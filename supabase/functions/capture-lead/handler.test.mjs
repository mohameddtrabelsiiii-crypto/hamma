import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHandler} from './handler.mjs';
const env={SUPABASE_URL:'https://project.supabase.co',SUPABASE_ANON_KEY:'publishable-test'};
const valid={name:'Jane',email:'JANE@EXAMPLE.TEST',company:'Acme',need:'We route hundreds of leads through spreadsheets each week.',budget:'USD 2000-10000'};
const req=(body,headers={})=>new Request('https://project.supabase.co/functions/v1/capture-lead',{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify(body)});
test('rejects invalid business leads and cross-origin writes before querying database',async()=>{
 const fn=createHandler(env,()=>assert.fail('Unexpected database call'));
 assert.equal((await fn(req({...valid,need:''}))).status,400);
 assert.equal((await fn(req({...valid,email:'bad'}))).status,400);
 assert.equal((await fn(req({...valid,budget:'no budget'}))).status,400);
 assert.equal((await fn(req(valid,{origin:'https://untrusted.example'}))).status,403);
});
test('sanitizes intake fields and stores only permitted lead columns',async()=>{
 let posted=0;
 const fn=createHandler(env,async(url,opt)=>{
  posted++;
  assert.match(url,/\/rest\/v1\/leads$/);
  assert.equal(opt.headers.authorization,'Bearer publishable-test');
  const row=JSON.parse(opt.body);
  assert.deepEqual(row,{name:'Jane',email:'jane@example.test',company:'Acme',need:valid.need,budget:'USD 2000-10000',source:'website-b2b-automation',status:'new'});
  return new Response(null,{status:201});
 });
 const r=await fn(req({...valid,secret:'must-not-save',status:'paid'}));
 assert.equal(r.status,200);assert.deepEqual(await r.json(),{ok:true});assert.equal(posted,1);
});
test('does not leak storage errors or claim success after failed storage',async()=>{
 const fn=createHandler(env,async()=>Response.json({error:'private SQL exception'},{status:400}));
 const r=await fn(req(valid));
 assert.equal(r.status,502);assert.deepEqual(await r.json(),{error:'Could not save assessment request'});
 assert.equal(r.headers.get('cache-control'),'no-store');
});
test('handles preflight and invalid methods',async()=>{
 const fn=createHandler(env,()=>assert.fail('Unexpected network call'));
 assert.equal((await fn(new Request('https://project.supabase.co/functions/v1/capture-lead',{method:'OPTIONS'}))).status,204);
 assert.equal((await fn(new Request('https://project.supabase.co/functions/v1/capture-lead'))).status,405);
});
