import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dispatchPaidCsv } from './dispatch.mjs';
const paid = {id:'test-order',status:'paid',payment_confirmed_at:'2026-10-06',file_path:'input.csv',services:{slug:'spreadsheet-cleanup'}};
function db(rows) { return {from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:rows.length>1?rows.shift():rows[0],error:null})})})})}; }
const env={url:'https://example.invalid',key:'test-only'};
test('eligible paid order is dispatched with server credentials',async()=>{
 let calls=0;
 await dispatchPaidCsv(db([paid]),paid.id,env,async(url,opts)=>{
  calls++;assert.equal(url,env.url+'/functions/v1/process-csv-order');
  assert.equal(opts.headers.authorization,'Bearer test-only');
  assert.deepEqual(JSON.parse(opts.body),{order_id:paid.id});return new Response('{}');
 });assert.equal(calls,1);
});
test('unpaid, unconfirmed, advanced, and unsupported orders are never dispatched',async()=>{
 for(const change of [{status:'awaiting_payment'},{payment_confirmed_at:null},{status:'needs_review'},{status:'processing'},{status:'delivered'},{status:'rejected'},{file_path:'a.xlsx'},{services:{slug:'cv'}}])
 await dispatchPaidCsv(db([{...paid,...change}]),paid.id,env,()=>assert.fail('unexpected dispatch'));
});
test('failed dispatch can be retried for the same paid order',async()=>{
 const client=db([paid]);
 await assert.rejects(dispatchPaidCsv(client,paid.id,env,async()=>new Response('',{status:503})),/retry webhook/);
 await dispatchPaidCsv(client,paid.id,env,async()=>new Response('{}'));
});
test('concurrent claim and held-for-review responses are acknowledged',async()=>{
 for(const [status,code] of [['processing',409],['needs_review',422]])
 await dispatchPaidCsv(db([paid,{...paid,status}]),paid.id,env,async()=>new Response('',{status:code}));
});
test('network errors propagate for webhook retry',async()=>{
 await assert.rejects(dispatchPaidCsv(db([paid]),paid.id,env,async()=>{throw new Error('offline')}),/offline/);
});
test('database errors do not falsely acknowledge delivery',async()=>{
 const client={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({error:'unavailable'})})})})};
 await assert.rejects(dispatchPaidCsv(client,paid.id,env),/read processing status/);
});
