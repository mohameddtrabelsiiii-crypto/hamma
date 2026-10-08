import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from './handler.mjs';

const ref='TF-1234ABCD';
function fixture(order={},user={},authOk=true){
 let calls=[];
 const customer={id:'auth-user',email:'OWNER@EXAMPLE.TEST',email_confirmed_at:'2026-10-01T00:00:00Z',...user};
 const saved={reference:ref,customer_email:'owner@example.test',amount_tnd:null,status:'awaiting_payment',payment_confirmed_at:null,result_checked:false,created_at:'2026-10-01T00:00:00Z',...order};
 const fetcher=async(url,opts)=>{calls.push({url,opts});
  if(url.includes('/auth/v1/user'))return authOk?Response.json(customer):Response.json({error:'not authorized'},{status:401});
  if(url.includes('/rest/v1/orders?'))return Response.json([saved]);
  throw new Error('Unexpected network call');
 };
 const handler=createHandler({SUPABASE_URL:'https://db.example.test',SUPABASE_SERVICE_ROLE_KEY:'service-secret'},fetcher);
 const req=(reference=ref,token='token')=>new Request('https://example.test/status',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({reference})});
 return {handler,req,calls};
}
test('Anonymous or malformed requests are rejected before any database access',async()=>{
 const f=fixture();
 const anonymous=new Request('https://example.test/status',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({reference:ref})});
 assert.equal((await f.handler(anonymous)).status,401);
 assert.equal((await f.handler(f.req('other'))).status,400);
 assert.equal(f.calls.length,0);
});
test('Invalid sign-in and unconfirmed users cannot check order statuses',async()=>{
 const bad=fixture({}, {}, false);
 assert.equal((await bad.handler(bad.req())).status,401);
 assert.equal(bad.calls.length,1);
 const unverified=fixture({}, {email_confirmed_at:null});
 assert.equal((await unverified.handler(unverified.req())).status,403);
 assert.equal(unverified.calls.length,1);
});
test('No cross-customer project status disclosures',async()=>{
 const other=fixture({customer_email:'other@example.test',amount_tnd:50,status:'paid'});
 const response=await other.handler(other.req());
 assert.equal(response.status,404);
 assert.deepEqual(await response.json(),{error:'Project not found.'});
});
test('Unpriced project is reviewing and does not pretend checkout is ready',async()=>{
 const f=fixture();const response=await f.handler(f.req());
 assert.equal(response.status,200);
 assert.equal(response.headers.get('cache-control'),'no-store');
 const data=await response.json();
 assert.equal(data.phase,'reviewing');assert.equal(data.quote_amount_tnd,null);
 assert.equal(data.can_download,false);
 assert.deepEqual(Object.keys(data).sort(),['can_download','created_at','phase','quote_amount_tnd','reference'].sort());
});
test('Approved quote, paid and checked-delivered statuses are distinguished',async()=>{
 for(const [order,phase,download] of [
  [{amount_tnd:120},'awaiting_payment',false],
  [{amount_tnd:120,status:'processing',payment_confirmed_at:'2026-10-01T11:00:00Z'},'processing',false],
  [{amount_tnd:120,status:'delivered',result_checked:false,payment_confirmed_at:'2026-10-01T11:00:00Z'},'needs_review',false],
  [{amount_tnd:120,status:'delivered',result_checked:true,payment_confirmed_at:'2026-10-01T11:00:00Z'},'delivered',true]
 ]){
  const f=fixture(order);const response=await f.handler(f.req());assert.equal(response.status,200);
  const data=await response.json();assert.equal(data.phase,phase);assert.equal(data.can_download,download);
  assert.equal(data.quote_amount_tnd,120);
 }
});
test('Only POST status check is available',async()=>{
 const f=fixture();const r=await f.handler(new Request('https://example.test/status',{method:'GET'}));
 assert.equal(r.status,405);assert.equal(f.calls.length,0);
});
