export function createHandler(env, fetcher = fetch) {
  const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store'};
  const reply=(body,status=200)=>Response.json(body,{status,headers:cors});
  return async req=>{
    if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
    if(req.method!=='POST')return reply({error:'Method not allowed'},405);
    const token=req.headers.get('authorization');
    if(!token?.startsWith('Bearer '))return reply({error:'Sign in to download your result.'},401);
    try{
      let body;try{body=await req.json();}catch{return reply({error:'Invalid JSON'},400)}
      const id=body.order_id;
      if(typeof id!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return reply({error:'Invalid order ID'},400);
      const base=env.SUPABASE_URL,key=env.SUPABASE_SERVICE_ROLE_KEY;
      const auth=await fetcher(base+'/auth/v1/user',{headers:{apikey:key,authorization:token}});
      if(!auth.ok)return reply({error:'Sign in to download your result.'},401);
      const user=await auth.json();
      if(!user.id||!user.email||!user.email_confirmed_at)return reply({error:'Confirm your email before downloading.'},403);
      const headers={apikey:key,authorization:'Bearer '+key,'content-type':'application/json'};
      const r=await fetcher(base+'/rest/v1/orders?id=eq.'+id+'&select=id,customer_email,status,payment_confirmed_at,result_checked,result_text',{headers});
      if(!r.ok)throw new Error('Database unavailable');
      const order=(await r.json())[0];
      if(!order||order.customer_email?.toLowerCase()!==user.email.toLowerCase())return reply({error:'Order not found'},404);
      if(order.status!=='delivered'||!order.payment_confirmed_at||order.result_checked!==true)return reply({error:'Your checked result is not ready for download.'},409);
      let result;try{result=JSON.parse(order.result_text)}catch{return reply({error:'No downloadable file is available.'},409)}
      const path=result.output_path;
      if(result.output_bucket!=='order-files'||typeof path!=='string'||!path.startsWith('results/'+id+'/')||path.split('/').some(x=>!x||x==='.'||x==='..')||!path.endsWith('.csv'))return reply({error:'No downloadable file is available.'},409);
      const signed=await fetcher(base+'/storage/v1/object/sign/order-files/'+path.split('/').map(encodeURIComponent).join('/'),{method:'POST',headers,body:JSON.stringify({expiresIn:60})});
      if(!signed.ok)throw new Error('Signing failed');
      const data=await signed.json();
      if(typeof data.signedURL!=='string'||!data.signedURL.startsWith('/object/sign/'))throw new Error('Invalid storage response');
      return reply({url:base+'/storage/v1'+data.signedURL,expires_in:60});
    }catch{return reply({error:'Download unavailable. Please try again later.'},503)}
  };
}
