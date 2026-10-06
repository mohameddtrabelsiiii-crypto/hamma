import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHandler} from './handler.mjs';
const id='11111111-1111-4111-8111-111111111111';
const user={id:'user',email:'owner@example.test',email_confirmed_at:'2026-10-06'};
const order={id,customer_email:user.email,status:'delivered',payment_confirmed_at:'2026-10-06',result_checked:true,result_text:JSON.stringify({output_bucket:'order-files',output_path:'results/'+id+'/result.csv'})};
const request=()=>new Request('https://example.test',{method:'POST',headers:{authorization:'Bearer customer'},body:JSON.stringify({order_id:id})});
function fixture(u=user,o=order){let calls=0;const handler=createHandler({SUPABASE_URL:'https://project.example',SUPABASE_SERVICE_ROLE_KEY:'test-server'},async(url,options)=>{calls++;if(url.endsWith('/auth/v1/user'))return Response.json(u);if(url.includes('/rest/v1/'))return Response.json([o]);assert.equal(options.headers.authorization,'Bearer test-server');assert.equal(JSON.parse(options.body).expiresIn,60);return Response.json({signedURL:'/object/sign/order-files/result.csv?token=test'});});return {handler,calls:()=>calls};}
test('verified owner gets a short-lived signed download',async()=>{const f=fixture();const r=await f.handler(request());assert.equal(r.status,200);assert.equal((await r.json()).expires_in,60);assert.equal(f.calls(),3);});
test('another customer cannot download',async()=>{const f=fixture({...user,email:'other@example.test'});assert.equal((await f.handler(request())).status,404);assert.equal(f.calls(),2);});
test('email verification is required',async()=>{const f=fixture({...user,email_confirmed_at:null});assert.equal((await f.handler(request())).status,403);assert.equal(f.calls(),1);});
test('unpaid, unreviewed, refunded and unfinished results stay private',async()=>{for(const patch of [{payment_confirmed_at:null},{result_checked:false},{status:'needs_review'},{status:'rejected'}]){const f=fixture(user,{...order,...patch});assert.equal((await f.handler(request())).status,409);assert.equal(f.calls(),2);}});
test('foreign output paths cannot be signed',async()=>{const f=fixture(user,{...order,result_text:JSON.stringify({output_bucket:'order-files',output_path:'results/other/result.csv'})});assert.equal((await f.handler(request())).status,409);assert.equal(f.calls(),2);});
test('anonymous request is rejected before network access',async()=>{const f=fixture();assert.equal((await f.handler(new Request('https://example.test',{method:'POST'}))).status,401);assert.equal(f.calls(),0);});
