// Public B2B intake. Every submitted value is treated as untrusted; no payment or CRM action.
export function createHandler(env, fetcher=fetch) {
 const cors={'Access-Control-Allow-Origin':'https://taskforge-ai.pages.dev','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'content-type','Cache-Control':'no-store'};
 const reply=(body,status=200)=>Response.json(body,{status,headers:cors});
 return async req=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(req.method!=='POST')return reply({error:'Method not allowed'},405);
  if(!req.headers.get('content-type')?.startsWith('application/json'))return reply({error:'JSON required'},415);
  if(Number(req.headers.get('content-length'))>8192)return reply({error:'Request too large'},413);
  const origin=req.headers.get('origin');
  if(origin&&origin!=='https://taskforge-ai.pages.dev')return reply({error:'Origin not allowed'},403);
  try{
   const raw=await req.text();if(raw.length>8192)return reply({error:'Request too large'},413);
   let data;try{data=JSON.parse(raw)}catch{return reply({error:'Invalid JSON'},400)}
   if(!data||typeof data!=='object'||Array.isArray(data))return reply({error:'Invalid request'},400);
   const field=(key,max)=>typeof data[key]==='string'&&data[key].length<=max?data[key].trim():null;
   const name=field('name',160),email=field('email',254),company=field('company',160),need=field('need',5000),budget=field('budget',60);
   const validBudgets=['Exploring budget','Under USD 500','USD 500-2000','USD 2000-10000','USD 10000+'];
   if(!name||!company||!email||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!need||need.length<15||!validBudgets.includes(budget))return reply({error:'Invalid assessment request'},400);
   if(!env.SUPABASE_URL||!env.SUPABASE_ANON_KEY)return reply({error:'Intake unavailable'},503);
   const record={name,email:email.toLowerCase(),company,need,budget,source:'website-b2b-automation',status:'new'};
   const r=await fetcher(env.SUPABASE_URL+'/rest/v1/leads',{
     method:'POST',
     headers:{apikey:env.SUPABASE_ANON_KEY,authorization:'Bearer '+env.SUPABASE_ANON_KEY,'content-type':'application/json',Prefer:'return=minimal'},
     body:JSON.stringify(record),
     signal:AbortSignal.timeout(15000)
   });
   if(!r.ok)return reply({error:'Could not save assessment request'},502);
   return reply({ok:true});
  }catch{return reply({error:'Intake temporarily unavailable'},502)}
 };
}
