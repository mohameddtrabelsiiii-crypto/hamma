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
  assert.ok(html.includes('href="/?service='));
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
test('authenticated project status proxy exposes only the caller reference',async()=>{
 const anonymous=await worker()(post('/api/status',{reference:'TF-1234ABCD'}));
 assert.equal(anonymous.status,401);
 assert.equal((await worker()(post('/api/status',{reference:'TF-1234ABCD'},{origin:'https://attacker.test','authorization':'Bearer test-user'}))).status,403);
 let called=0;
 const r=await worker(async(url,opts)=>{
  called++;assert.match(url,/\/functions\/v1\/order-status$/);
  assert.equal(opts.headers.authorization,'Bearer access-user');
  assert.deepEqual(JSON.parse(opts.body),{reference:'TF-1234ABCD'});
  return Response.json({reference:'TF-1234ABCD',phase:'reviewing',quote_amount_tnd:null,can_download:false,created_at:'2026-10-01T00:00:00Z'});
 })(post('/api/status',{reference:'TF-1234ABCD',other_customer:'blocked'},{authorization:'Bearer access-user'}));
 assert.equal(called,1);assert.equal(r.status,200);
 assert.equal((await r.json()).phase,'reviewing');
 assert.equal(r.headers.get('cache-control'),'no-store');
 assert.equal((await worker()(new Request('https://taskforge.example/api/status'))).status,405);
});
test('homepage provides tracking and service preselection without accepting payment',async()=>{
 const html=await (await worker()(new Request('https://taskforge.example/'))).text();
 assert.match(html,/id="check-status"/);
 assert.match(html,/searchParams.get\('service'\)/);
 assert.match(html,/Check project status/);
});

test('B2B automation proposal page is truthful, accessible and included in sitemap',async()=>{
 const w=worker();
 const r=await w(new Request('https://taskforge.example/automation'));
 assert.equal(r.status,200);
 const html=await r.text();
 for(const phrase of ['B2B AI Workflow Automation','Lead intake &amp; CRM routing','Invoices &amp; order documents','Support inbox triage','Request a scoped pilot','id="b2b-lead"']){
  assert.ok(html.includes(phrase),phrase);
 }
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 new vm.Script(script);
 assert.match(r.headers.get('content-security-policy'),/frame-ancestors 'none'/);
 const home=await (await w(new Request('https://taskforge.example/'))).text();
 assert.match(home,/href="\/automation"/);
 const sitemap=await (await w(new Request('https://taskforge.example/sitemap.xml'))).text();
 assert.match(sitemap,/https:\/\/taskforge-ai\.pages\.dev\/automation/);
 assert.equal((await w(new Request('https://taskforge.example/automation',{method:'POST'}))).status,405);
 assert.equal((await w(new Request('https://taskforge.example/automation',{method:'HEAD'}))).status,200);
});
test('B2B automation lead API validates input, strips unexpected fields and avoids leaking upstream data',async()=>{
 const w=worker();
 const good={name:'Jane Lead',email:'JANE@EXAMPLE.TEST',company:'Acme Operations',need:'We triage 500 inquiries weekly and need CRM routing.',budget:'USD 2000-10000',hack:'not allowed'};
 assert.equal((await w(post('/api/lead',good,{origin:'https://attacker.test'}))).status,403);
 assert.equal((await w(new Request('https://taskforge.example/api/lead'))).status,405);
 assert.equal((await w(post('/api/lead',{...good,need:'x'}))).status,400);
 assert.equal((await w(post('/api/lead',{...good,budget:'USD 0'}))).status,400);
 let count=0;
 const success=await worker(async(url,opts)=>{
  count++;
  assert.match(url,/capture-lead$/);
  const payload=JSON.parse(opts.body);
  assert.equal(payload.email,'jane@example.test');
  assert.equal(payload.hack,undefined);
  assert.equal(payload.company,'Acme Operations');
  return Response.json({ok:true,raw_sensitive_data:'private'});
 })(post('/api/lead',good));
 assert.equal(success.status,200);
 assert.deepEqual(await success.json(),{ok:true});
 assert.equal(count,1);
 const failed=await worker(async()=>Response.json({ok:false,error:'internal SQL details'},{status:502}))(post('/api/lead',good));
 assert.equal(failed.status,502);
 assert.ok(!JSON.stringify(await failed.json()).includes('SQL'));
});

test('browser-only routing demo displays fictional sample messages and no external network calls',async()=>{
 const w=worker();
 const response=await w(new Request('https://taskforge.example/automation/demo'));
 assert.equal(response.status,200);
 const html=await response.text();
 assert.match(html,/Lead Routing Demonstration/);
 assert.match(html,/fictional messages/);
 assert.match(html,/id="sample"/);
 assert.match(html,/id="message"/);
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 new vm.Script(script);
 const elements={
  '#sample':{value:'lead',addEventListener(){}},
  '#message':{value:''},
  '#result':{textContent:''},
  '#route':{addEventListener(){}}
 };
 const ctx={document:{querySelector(selector){const el=elements[selector];if(!el)throw Error('Unknown control '+selector);return el;}}};
 vm.runInNewContext(script+'\n;globalThis.demoRoute=route;',ctx);
 assert.equal(ctx.demoRoute('I need a demo and quote for my team.').queue,'Sales / CRM review');
 assert.equal(ctx.demoRoute('Dashboard is not working, I need support.').queue,'Support queue');
 assert.equal(ctx.demoRoute('Please check our purchase order and invoice.').queue,'Operations / finance review');
 assert.equal(ctx.demoRoute('Hello').queue,'Human triage');
 assert.equal(ctx.demoRoute('We have a quote and invoice issue.').queue,'Human triage');
 assert.match(response.headers.get('content-security-policy'),/connect-src 'none'/);
 assert.equal((await w(new Request('https://taskforge.example/automation/demo',{method:'POST'}))).status,405);
 const sitemap=await (await w(new Request('https://taskforge.example/sitemap.xml'))).text();
 assert.ok(sitemap.includes('<loc>https://taskforge-ai.pages.dev/automation/demo</loc>'));
});

test('functional LeadOps CSV pilot routes leads, marks duplicates and protects spreadsheet exports',async()=>{
 const w=worker();
 const resp=await w(new Request('https://taskforge.example/automation/leadops'));
 assert.equal(resp.status,200);
 assert.match(resp.headers.get('content-security-policy'),/connect-src 'none'/);
 const html=await resp.text();
 assert.match(html,/LeadOps CSV Pilot/);
 assert.match(html,/No login, external API or paid software required/);
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 new vm.Script(script);
 const elements={};
 const el=(selector)=>elements[selector]??(elements[selector]={value:'',files:[],textContent:'',hidden:false,disabled:false,
  addEventListener(){},replaceChildren(){},appendChild(){}});
 const context={document:{querySelector:el}};
 vm.runInNewContext(script+'\n;globalThis.leadops={parseCsv,analyzeCsv,exportCsv,classify,safeExportCell};',context);
 const core=context.leadops;
 const csv='name,email,company,message\r\nTaylor,TAYLOR@example.test,Acme,"We need a demo, and a quote."\r\nTaylor,taylor@example.test,Acme,"Send a quote."\r\nMorgan,morgan@example.test,Supply,"Please review our invoice and purchase order."\r\nAlex,alex@example.test,Other,"Hello"\r\n';
 const result=core.analyzeCsv(csv);
 assert.equal(result.records.length,4);
 assert.equal(result.duplicates,1);
 assert.equal(result.records[0].queue,'Sales / CRM');
 assert.equal(result.records[2].queue,'Finance / operations');
 assert.equal(result.records[3].queue,'Human triage');
 assert.match(result.records[1].flags,/Possible duplicate/);
 const exported=core.exportCsv(result);
 assert.match(exported,/taskforge_review_flags/);
 assert.equal(core.parseCsv(exported).rows.length,4);
 const quoted=core.parseCsv('\uFEFFname,message\r\n"Jane","A quoted ""word"", then a\\nmultiline note"\r\n');
 assert.equal(quoted.rows.length,1);
 assert.equal(quoted.rows[0][1],'A quoted "word", then a\\nmultiline note');
 assert.match(core.safeExportCell('=HYPERLINK("https://evil.test")'),/^"'=/);
 assert.match(core.safeExportCell('  +1+1'),/^"'  \+1/);
 assert.throws(()=>core.parseCsv('name,message\n"a","unclosed'),/Unclosed/);
 assert.throws(()=>core.analyzeCsv('name,email\nTaylor,taylor@example.test'),/message, inquiry or notes/);
 assert.throws(()=>core.parseCsv('name,message\nTaylor,"abc"def'),/Unexpected/);
 assert.equal((await w(new Request('https://taskforge.example/automation/leadops',{method:'POST'}))).status,405);
 assert.equal((await w(new Request('https://taskforge.example/automation/leadops',{method:'HEAD'}))).status,200);
 const sitemap=await (await w(new Request('https://taskforge.example/sitemap.xml'))).text();
 assert.ok(sitemap.includes('<loc>https://taskforge-ai.pages.dev/automation/leadops</loc>'));
 const assessment=await (await w(new Request('https://taskforge.example/automation'))).text();
 assert.match(assessment,/href="\/automation\/leadops"/);
});


test('serves IndexNow ownership proof only to safe read methods',async()=>{
 const w=worker();
 const path='/7d2669768911ab1286b83b5b8c732b7b.txt';
 const get=await w(new Request('https://taskforge.example'+path));
 assert.equal(get.status,200);
 assert.equal(await get.text(),'7d2669768911ab1286b83b5b8c732b7b');
 assert.match(get.headers.get('content-type'),/text\/plain/);
 const head=await w(new Request('https://taskforge.example'+path,{method:'HEAD'}));
 assert.equal(head.status,200);
 assert.equal(await head.text(),'');
 assert.equal((await w(new Request('https://taskforge.example'+path,{method:'POST'}))).status,405);
});
