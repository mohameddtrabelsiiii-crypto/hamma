// Customer-owned order status only: no raw files, payment IDs or customer PII.
export function createHandler(env, fetcher=fetch) {
 const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
 const reply=(body,status=200)=>Response.json(body,{status,headers:cors});
 return async request=>{
  if(request.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(request.method!=='POST')return reply({error:'Method not allowed'},405);
  const token=request.headers.get('authorization');
  if(!token||!/^Bearer [^\\s]+$/.test(token))return reply({error:'Sign in to check your project status.'},401);
  const length=Number(request.headers.get('content-length'));
  if(Number.isFinite(length)&&length>1024)return reply({error:'Request too large'},413);
  let body;try {const text=await request.text();if(text.length>1024)return reply({error:'Request too large'},413);body=JSON.parse(text);}
  catch{return reply({error:'Invalid JSON'},400)}
  const reference=body?.reference;
  if(typeof reference!=='string'||!/^TF-[0-9A-F]{8}$/.test(reference))return reply({error:'Enter a valid TF reference.'},400);
  const base=env.SUPABASE_URL, key=env.SUPABASE_SERVICE_ROLE_KEY;
  if(!base||!key)return reply({error:'Status service temporarily unavailable.'},503);
  try {
   const auth=await fetcher(base+'/auth/v1/user',{headers:{apikey:key,authorization:token},signal:AbortSignal.timeout(12000)});
   if(!auth.ok)return reply({error:'Sign in to check your project status.'},401);
   const user=await auth.json();
   if(!user?.id||!user?.email||!user?.email_confirmed_at)return reply({error:'Confirm your email before checking status.'},403);
   const headers={apikey:key,authorization:'Bearer '+key};
   const lookup=await fetcher(base+'/rest/v1/orders?reference=eq.'+reference+'&select=reference,customer_email,amount_tnd,status,payment_confirmed_at,result_checked,created_at',{headers,signal:AbortSignal.timeout(12000)});
   if(!lookup.ok)throw new Error('Status lookup failed');
   const rows=await lookup.json();
   const order=Array.isArray(rows)?rows[0]:null;
   if(!order||typeof order.customer_email!=='string'||order.customer_email.trim().toLowerCase()!==user.email.trim().toLowerCase())return reply({error:'Project not found.'},404);
   const quoted=order.amount_tnd!==null&&order.amount_tnd!==undefined&&Number.isFinite(Number(order.amount_tnd))&&Number(order.amount_tnd)>0;
   const delivered=order.status==='delivered'&&Boolean(order.payment_confirmed_at)&&order.result_checked===true;
   const phases={awaiting_payment:quoted?'awaiting_payment':'reviewing',paid:'paid',processing:'processing',needs_review:'needs_review',delivered:delivered?'delivered':'needs_review',rejected:'rejected'};
   return reply({
    reference:order.reference,
    phase:phases[order.status]||'needs_review',
    quote_amount_tnd:quoted?Number(order.amount_tnd):null,
    can_download:delivered,
    created_at:order.created_at
   });
  } catch { return reply({error:'Unable to check your status right now. Please try again.'},503); }
 };
}
