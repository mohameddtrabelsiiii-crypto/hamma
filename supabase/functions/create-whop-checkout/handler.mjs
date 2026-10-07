// Only a verified order owner can open checkout for an approved quote.
export function createHandler(env, fetcher = fetch) {
  const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store'};
  const reply = (body, status=200) => Response.json(body, {status, headers:cors});
  const request = (url, options={}) => fetcher(url, {...options, signal:AbortSignal.timeout(15000)});
  return async req => {
    if (req.method === 'OPTIONS') return new Response('ok', {headers:cors});
    if (req.method !== 'POST') return reply({error:'Method not allowed'},405);
    const token = req.headers.get('authorization');
    if (!token?.startsWith('Bearer ')) return reply({error:'Sign in before opening checkout.'},401);
    try {
      const text = await req.text();
      if (text.length > 8192) return reply({error:'Request too large'},413);
      let body; try { body=JSON.parse(text); } catch { return reply({error:'Invalid JSON'},400); }
      const reference=body?.reference;
      if (typeof reference !== 'string' || !/^TF-[0-9A-F]{8}$/.test(reference)) return reply({error:'Enter a valid TF reference.'},400);
      const base=env.SUPABASE_URL, key=env.SUPABASE_SERVICE_ROLE_KEY;
      const auth=await request(base+'/auth/v1/user',{headers:{apikey:key,authorization:token}});
      if (!auth.ok) return reply({error:'Sign in before opening checkout.'},401);
      const user=await auth.json();
      if (!user.id || !user.email || !user.email_confirmed_at) return reply({error:'Confirm your email before opening checkout.'},403);
      const headers={apikey:key,authorization:'Bearer '+key,'content-type':'application/json'};
      const lookup=base+'/rest/v1/orders?reference=eq.'+reference;
      const record=await request(lookup+'&select=id,reference,customer_email,amount_tnd,status,payment_confirmed_at,whop_checkout_id,services(name)',{headers});
      if (!record.ok) throw new Error('Database unavailable');
      const order=(await record.json())[0];
      if (!order || order.customer_email?.toLowerCase()!==user.email.toLowerCase()) return reply({error:'Order not found'},404);
      if (order.status!=='awaiting_payment' || order.payment_confirmed_at) return reply({error:'Checkout is available only after your quote is approved and before payment.'},409);
      const amount=Number(order.amount_tnd);
      if (!Number.isFinite(amount) || amount<=0) return reply({error:'Your project is awaiting a confirmed price.'},409);
      // Do not take a payment until the verification channel is configured too.
      if (!env.WHOP_COMPANY_API_KEY || !env.WHOP_COMPANY_ID || !env.WHOP_WEBHOOK_SECRET) return reply({error:'Online payment is not available yet. Your project is saved; please return later.'},503);
      const appUrl=new URL(env.APP_URL || 'https://taskforge-cavalry.mohameddtrabelsiiii.workers.dev/');
      if (appUrl.protocol!=='https:') throw new Error('Invalid app URL');
      appUrl.pathname='/'; appUrl.search=''; appUrl.hash='account';
      const payload={
        plan:{company_id:env.WHOP_COMPANY_ID,force_create_new_plan:true,plan_type:'one_time',initial_price:amount,currency:'tnd',title:order.services?.name || 'TaskForge service',description:'TaskForge AI order '+reference},
        mode:'payment', metadata:{order_id:order.id,order_reference:reference}, redirect_url:appUrl.href,
      };
      const response=await request('https://api.whop.com/api/v1/checkout_configurations',{
        method:'POST',headers:{authorization:'Bearer '+env.WHOP_COMPANY_API_KEY,'content-type':'application/json','Idempotency-Key':'taskforge-'+order.id+'-tnd-'+amount},body:JSON.stringify(payload),
      });
      if (!response.ok) return reply({error:'Payment service unavailable. No payment has been confirmed.'},502);
      const checkout=await response.json();
      if (typeof checkout.id!=='string' || !/^[A-Za-z0-9_]+$/.test(checkout.id)) throw new Error('Invalid checkout');
      const target=new URL(checkout.purchase_url);
      if (target.protocol!=='https:' || target.hostname!=='whop.com' || target.username || target.password || target.port) throw new Error('Invalid checkout URL');
      // Never replace a previously issued checkout: that link may still be payable.
      if (order.whop_checkout_id && order.whop_checkout_id!==checkout.id) return reply({error:'An existing checkout needs review. Please do not make another payment.'},409);
      const condition=order.whop_checkout_id ? '&whop_checkout_id=eq.'+order.whop_checkout_id : '&whop_checkout_id=is.null';
      const saved=await request(lookup+'&status=eq.awaiting_payment&payment_confirmed_at=is.null&amount_tnd=eq.'+amount+condition,{
        method:'PATCH',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify({whop_checkout_id:checkout.id}),
      });
      if (!saved.ok) throw new Error('Checkout save failed');
      const rows=await saved.json();
      if (rows.length!==1) return reply({error:'Your order changed. Refresh before opening checkout.'},409);
      return reply({purchase_url:target.href,order_reference:reference,amount,currency:'TND'});
    } catch { return reply({error:'Checkout unavailable. Please try again later.'},503); }
  };
}
