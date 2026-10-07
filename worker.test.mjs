import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('./worker.js',import.meta.url),'utf8');
function worker(fetcher=()=>assert.fail('Unexpected network request')){let handler;vm.runInNewContext(source,{Request,Response,URL,File,AbortSignal,fetch:fetcher,addEventListener:(_,fn)=>{handler=fn}});return async req=>{let response;handler({request:req,respondWith:r=>response=r});return response};}
function post(path,body,headers={}){return new Request('https://taskforge.example'+path,{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify(body)});}
test('page has labelled account and result forms',async()=>{const r=await worker()(new Request('https://taskforge.example/'));assert.equal(r.status,200);const html=await r.text();assert.match(html,/id="result-form"/);assert.match(html,/for="account-password"/);const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(script);});
test('rejects cross-origin and anonymous result requests',async()=>{assert.equal((await worker()(post('/api/login',{}, {origin:'https://evil.example'}))).status,403);assert.equal((await worker()(post('/api/result',{reference:'TF-1234ABCD'}))).status,401);});
test('login returns access token only, without persisting password or refresh token',async()=>{const r=await worker(async(url,opts)=>{assert.match(url,/token\?grant_type=password$/);assert.equal(JSON.parse(opts.body).email,'owner@example.test');return Response.json({access_token:'access-test',refresh_token:'private-refresh',user:{id:'user'}})})(post('/api/login',{email:'OWNER@example.test',password:'example-pass'}));assert.deepEqual(await r.json(),{access_token:'access-test'});assert.equal(r.headers.get('cache-control'),'no-store');});
test('signup suppresses account data',async()=>{const r=await worker(async()=>Response.json({user:{id:'user'},session:{access_token:'token'}}))(post('/api/signup',{email:'owner@example.test',password:'example-pass'}));assert.deepEqual(await r.json(),{ok:true});});
test('invalid sign-in is explained without exposing provider response',async()=>{const r=await worker(async()=>Response.json({error:'internal details'},{status:400}))(post('/api/login',{email:'owner@example.test',password:'example-pass'}));assert.equal(r.status,400);assert.match((await r.json()).error,/Sign-in failed/);});
test('result request forwards authenticated reference and preserves review denial',async()=>{const r=await worker(async(url,opts)=>{assert.match(url,/download-order-result$/);assert.equal(opts.headers.authorization,'Bearer user-token');assert.deepEqual(JSON.parse(opts.body),{reference:'TF-1234ABCD'});return Response.json({error:'Not ready'},{status:409})})(post('/api/result',{reference:'TF-1234ABCD'},{authorization:'Bearer user-token'}));assert.equal(r.status,409);});
test('checkout route requires login and forwards only the order reference',async()=>{
 assert.equal((await worker()(post('/api/checkout',{reference:'TF-1234ABCD'}))).status,401);
 const r=await worker(async(url,opts)=>{assert.match(url,/create-whop-checkout$/);assert.equal(opts.headers.authorization,'Bearer user-token');assert.deepEqual(JSON.parse(opts.body),{reference:'TF-1234ABCD'});return Response.json({error:'Online payment is not available yet.'},{status:503});})(post('/api/checkout',{reference:'TF-1234ABCD',amount:1},{authorization:'Bearer user-token'}));assert.equal(r.status,503);
});

test('service landing pages show accurate scopes, intake links and canonical URLs',async()=>{
 const pages=['/services/pdf-to-excel','/services/spreadsheet-cleanup','/services/company-list','/services/cv-writing'];
 for(const path of pages){
  const response=await worker()(new Request('https://taskforge.example'+path));
  assert.equal(response.status,200);
  const html=await response.text();
  assert.match(html,/TaskForge AI/);
  assert.ok(html.includes('href="/#order"'));
  assert.ok(html.includes('href="https://taskforge-ai.pages.dev'+path+'"'));
  assert.equal((await worker()(new Request('https://taskforge.example'+path,{method:'POST'}))).status,405);
 }
});
test('robots and sitemap list real service landing pages, with HEAD support',async()=>{
 const w=worker();
 const robots=await w(new Request('https://taskforge.example/robots.txt'));
 assert.equal(robots.status,200);
 assert.match(await robots.text(),/Sitemap: https:\/\/taskforge-ai\.pages\.dev\/sitemap\.xml/);
 const map=await w(new Request('https://taskforge.example/sitemap.xml'));
 assert.equal(map.status,200);
 const xml=await map.text();
 for(const path of ['/','/services/pdf-to-excel','/services/spreadsheet-cleanup','/services/company-list','/services/cv-writing']){
  assert.ok(xml.includes('<loc>https://taskforge-ai.pages.dev'+path+'</loc>'));
 }
 const head=await w(new Request('https://taskforge.example/sitemap.xml',{method:'HEAD'}));
 assert.equal(head.status,200);assert.equal(await head.text(),'');
 assert.equal((await w(new Request('https://taskforge.example/sitemap.xml',{method:'POST'}))).status,405);
});
