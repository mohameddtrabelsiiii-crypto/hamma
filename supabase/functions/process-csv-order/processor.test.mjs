import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanCsv} from './csv.mjs';
import {createHandler} from './handler.mjs';
test('CSV preserves identifiers, quoted commas/newlines and duplicates',()=>{
 const r=cleanCsv('\uFEFFid,name,note\r\n001,"A, B","two\nlines"\r\n001,"A, B","two\nlines"\r\n,,\r\n');
 assert.equal(r.report.duplicateRowsRetained,1);assert.equal(r.report.removedBlankRows,1);
 assert.match(r.csv,/"001","A, B","two\nlines"/);assert.equal(r.report.dataRows,2);
});
test('Rejects ambiguous input and flags formula-like cells',()=>{
 for(const v of ['a,b\n1','a,a\n1,2','a,b\n"oops,2','a,b\n"x"z,2'])assert.throws(()=>cleanCsv(v));
 assert.equal(cleanCsv('a,b\n1,=SUM(A1)\n').report.formulaCells,1);
});
const id='12345678-1234-1234-1234-123456789abc';
function fixture(status='paid',file='a,b\n 001 ,test\n'){
 let order={id,status,payment_confirmed_at:status==='paid'?'2026-10-06T00:00:00Z':null,file_path:'input/source.csv',services:{slug:'spreadsheet-cleanup'}};
 let uploaded=null,calls=0;
 const fetcher=async(url,opts={})=>{calls++;const u=new URL(url);
  if(u.pathname==='/rest/v1/orders'){
   if(opts.method==='PATCH'){const expected=u.searchParams.get('status')?.slice(3);if(expected&&order.status!==expected)return Response.json([]);order={...order,...JSON.parse(opts.body)};return Response.json([order]);}
   return Response.json([order]);
  }
  if(u.pathname.includes('/object/authenticated/'))return new Response(file);
  if(u.pathname.includes('/object/order-files/results/')){uploaded=opts.body;return Response.json({});}
  throw new Error('Unexpected request');
 };
 const handle=createHandler({SUPABASE_URL:'https://example.test',SUPABASE_SERVICE_ROLE_KEY:'test-key'},fetcher);
 const req=(key='test-key')=>new Request('https://example.test/process',{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json'},body:JSON.stringify({order_id:id})});
 return {handle,req,get order(){return order},get uploaded(){return uploaded},get calls(){return calls}};
}
test('Rejects anonymous and unpaid callers before file access',async()=>{
 const f=fixture();assert.equal((await f.handle(f.req('bad'))).status,401);assert.equal(f.calls,0);
 const unpaid=fixture('awaiting_payment');assert.equal((await unpaid.handle(unpaid.req())).status,409);assert.equal(unpaid.uploaded,null);
});
test('Safe paid CSV auto-delivers with a checked private result; replay is rejected',async()=>{
 const f=fixture();const response=await f.handle(f.req());assert.equal(response.status,200);
 assert.equal((await response.json()).status,'delivered');
 assert.equal(f.order.status,'delivered');assert.equal(f.order.result_checked,true);assert.match(f.uploaded,/"001"/);
 assert.equal(JSON.parse(f.order.result_text).output_bucket,'order-files');
 assert.ok(Number.isFinite(Date.parse(f.order.delivered_at)));
 assert.equal((await f.handle(f.req())).status,409);
});
test('Paid CSV with formula cells or duplicate rows stays private for review',async()=>{
 for(const input of ['a,b\n1,=SUM(A1)\n','a,b\n1,x\n1,x\n']){
  const f=fixture('paid',input);const response=await f.handle(f.req());assert.equal(response.status,200);
  assert.equal((await response.json()).status,'needs_review');
  assert.equal(f.order.status,'needs_review');assert.equal(f.order.result_checked,false);
  assert.equal(f.order.delivered_at,null);assert.equal(JSON.parse(f.order.result_text).output_bucket,'order-files');
  assert.equal((await f.handle(f.req())).status,409);
 }
});
test('Malformed paid input is held for review',async()=>{
 const f=fixture('paid','a,b\n1');assert.equal((await f.handle(f.req())).status,422);assert.equal(f.order.status,'needs_review');assert.equal(f.uploaded,null);
});
