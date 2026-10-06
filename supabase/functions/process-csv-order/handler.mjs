import { cleanCsv } from './csv.mjs';
export function createHandler(env, fetcher=fetch) {
  const reply=(body,status=200)=>Response.json(body,{status,headers:{'cache-control':'no-store'}});
  return async request=>{
    const key=env.SUPABASE_SERVICE_ROLE_KEY, base=env.SUPABASE_URL;
    if (!key || request.headers.get('authorization')!=='Bearer '+key) return reply({error:'Unauthorized'},401);
    if(request.method!=='POST')return reply({error:'Method not allowed'},405);
    let body;try{body=await request.json();}catch{return reply({error:'Invalid JSON'},400);}
    const id=body.order_id;
    if(typeof id!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return reply({error:'Invalid order ID'},400);
    const headers={apikey:key,authorization:'Bearer '+key,'content-type':'application/json'};
    const api=async(path,method='GET',data)=>{const r=await fetcher(base+path,{method,headers:{...headers,Prefer:'return=representation'},...(data===undefined?{}:{body:JSON.stringify(data)})});if(!r.ok)throw new Error('Database operation failed');return r.status===204?null:r.json();};
    let claimed=false;
    const orderPath='/rest/v1/orders?id=eq.'+id;
    try {
      const rows=await api(orderPath+'&select=id,status,payment_confirmed_at,file_path,services(slug)');
      const order=rows[0];if(!order)return reply({error:'Order not found'},404);
      if(order.status!=='paid'||!order.payment_confirmed_at)return reply({error:'A confirmed paid order is required'},409);
      if(order.services?.slug!=='spreadsheet-cleanup'||!order.file_path?.toLowerCase().endsWith('.csv'))return reply({error:'This processor supports CSV spreadsheet cleanup only'},422);
      const lock=await api(orderPath+'&status=eq.paid&payment_confirmed_at=not.is.null','PATCH',{status:'processing'});
      if(!lock?.length)return reply({error:'Order already claimed'},409);claimed=true;
      const path=order.file_path.split('/').map(encodeURIComponent).join('/');
      const file=await fetcher(base+'/storage/v1/object/authenticated/order-files/'+path,{headers});
      if(!file.ok)throw new Error('Source download failed');
      const buffer=await file.arrayBuffer();if(buffer.byteLength>2*1024*1024)throw new Error('CSV exceeds automatic processing limit of 2 MB');
      const result=cleanCsv(new TextDecoder('utf-8',{fatal:true}).decode(buffer));
      const output='results/'+id+'/'+crypto.randomUUID()+'.csv';
      const upload=await fetcher(base+'/storage/v1/object/order-files/'+output,{method:'POST',headers:{...headers,'content-type':'text/csv; charset=utf-8','x-upsert':'false'},body:result.csv});
      if(!upload.ok)throw new Error('Result upload failed');
      const done=await api(orderPath+'&status=eq.processing','PATCH',{status:'needs_review',result_checked:false,result_text:JSON.stringify({processor:'csv-cleanup-v1',output_bucket:'order-files',output_path:output,report:result.report})});
      if(!done?.length)throw new Error('Order state changed during processing');
      return reply({order_id:id,status:'needs_review',report:result.report});
    } catch(error) {
      if(claimed)try{await api(orderPath+'&status=eq.processing','PATCH',{status:'needs_review',result_checked:false,result_text:JSON.stringify({processor:'csv-cleanup-v1',error:'Automatic processing could not complete. Review source and retry manually.'})});}catch{ /* Leave processing state for operator recovery. */ }
      return reply({error:'Processing could not complete; manual review required'},422);
    }
  };
}
