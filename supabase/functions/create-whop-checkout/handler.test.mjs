import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHandler} from './handler.mjs';
const env={SUPABASE_URL:'https://project.example',SUPABASE_SERVICE_ROLE_KEY:'test-server',WHOP_COMPANY_API_KEY:'test-whop',WHOP_COMPANY_ID:'biz_test',WHOP_WEBHOOK_SECRET:'test-secret'};
const user={id:'owner',email:'owner@example.test',email_confirmed_at:'2026-10-07'};
const order={id:'11111111-1111-4111-8111-111111111111',reference:'TF-1234ABCD',customer_email:user.email,amount_tnd:40,status:'awaiting_payment',payment_confirmed_at:null,whop_checkout_id:null,services:{name:'CSV cleanup'}};
const req=(body={reference:order.reference},token='customer')=>new Request('https://example.test',{method:'POST',headers:token?{authorization:'Bearer '+token}:{},body:JSON.stringify(body)});
function fixture({u=user,o=order,e=env,checkout={id:'ch_test',purchase_url:'https://whop.com/checkout/plan_test'},saved=[order],providerStatus=200}={}) {
  const calls=[];
  const handler=createHandler(e,async(url,options)=>{
    calls.push({url,options});
    if(url.endsWith('/auth/v1/user'))return Response.json(u);
    if(url.startsWith('https://api.whop.com/'))return Response.json(checkout,{status:providerStatus});
    if(options.method==='PATCH')return Response.json(saved);
    return Response.json(o?[o]:[]);
  });
  return {handler,calls};
}
test('checkout rejects anonymous, malformed and unverified callers before payment access',async()=>{
  for(const [body,token,status] of [[{},'',401],[{reference:'TF-1234ABCD&x=1'},'customer',400]]){
    const f=fixture();assert.equal((await f.handler(req(body,token))).status,status);assert.equal(f.calls.length,0);
  }
  const f=fixture({u:{...user,email_confirmed_at:null}});assert.equal((await f.handler(req())).status,403);assert.equal(f.calls.length,1);
});
test('checkout hides another customer order and nonexistent orders',async()=>{
  for(const o of [null,{...order,customer_email:'other@example.test'}]){const f=fixture({o});assert.equal((await f.handler(req())).status,404);assert.equal(f.calls.length,2);}
});
test('unapproved, already paid and invalid quotes cannot open checkout',async()=>{
  for(const patch of [{status:'pending_review'},{payment_confirmed_at:'2026-10-07'},{amount_tnd:0},{amount_tnd:'NaN'}]){
    const f=fixture({o:{...order,...patch}});assert.equal((await f.handler(req())).status,409);assert.equal(f.calls.length,2);
  }
});
test('all three payment settings are required before sending anything to Whop',async()=>{
  for(const key of ['WHOP_COMPANY_API_KEY','WHOP_COMPANY_ID','WHOP_WEBHOOK_SECRET']){
    const f=fixture({e:{...env,[key]:''}});assert.equal((await f.handler(req())).status,503);assert.equal(f.calls.length,2);
  }
});
test('verified owner gets only a saved checkout at the server price with an idempotency key',async()=>{
  const f=fixture();const response=await f.handler(req({reference:order.reference,amount:1}));assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{purchase_url:'https://whop.com/checkout/plan_test',order_reference:order.reference,amount:40,currency:'TND'});
  const options=f.calls[2].options,payload=JSON.parse(options.body);
  assert.equal(payload.plan.initial_price,40);assert.equal(payload.metadata.order_reference,order.reference);
  assert.match(payload.redirect_url,/#account$/);assert.equal(options.headers['Idempotency-Key'],'taskforge-'+order.id+'-tnd-40');
  assert.match(f.calls[3].url,/status=eq.awaiting_payment.*amount_tnd=eq.40.*whop_checkout_id=is.null/);
  assert.equal(response.headers.get('cache-control'),'no-store');
});
test('changed order and conflicting old checkout never release a new payment link',async()=>{
  const changed=fixture({saved:[]});assert.equal((await changed.handler(req())).status,409);
  const previous=fixture({o:{...order,whop_checkout_id:'ch_previous'}});assert.equal((await previous.handler(req())).status,409);assert.equal(previous.calls.length,3);
});
test('provider errors and unsafe payment URLs do not leak provider data or links',async()=>{
  const failure=fixture({providerStatus:400,checkout:{secret:'provider-private'}});const r=await failure.handler(req());assert.equal(r.status,502);assert.doesNotMatch(await r.text(),/provider-private/);
  for(const url of ['https://evil.example/pay','http://whop.com/pay','https://user@whop.com/pay']){
    const f=fixture({checkout:{id:'ch_test',purchase_url:url}});assert.equal((await f.handler(req())).status,503);assert.equal(f.calls.length,3);
  }
});
