// Cavalry Med Art Cloud Team — original internal-draft agent-to-agent system.
// Scheduled in Cloudflare Workers; safe by construction: no Fourthwall write client,
// no bank/payment API, no buyer PII, no public posting, no real product publishing.
const TEAM = [
 ["atlas","Research demand hypotheses; no fictional trend statistics or citations"],
 ["muse","Write one original abstract-art printable merchandise concept; no copyrighted assets"],
 ["forge","Prepare a hypothetical Fourthwall POD listing draft, no invented prices or specifications"],
 ["ledger","List required real margin inputs; never guess manufacturing, shipping or platform costs"],
 ["sentinel","Audit a draft for rights, merchant verification and misleading claims; block unsafe output"],
 ["pulse","Draft one ethical no-cost organic social post; do not actually send/post"],
 ["beacon","Draft accurate SEO research tasks and measurement methodology, no fake metrics"],
 ["harbor","Draft helpful order support policy text, no buyer data or delivery promises"],
 ["relay","Suggest an uptime/reliability check and cite only known audit facts"]
];
const MODEL="@cf/meta/llama-3.1-8b-instruct-fp8";
const SHOP="Med Art";
const BASELINE="Verified on October 9, 2026 via authenticated Fourthwall MCP: Med Art COMING_SOON, one HIDDEN Fourthwall-fulfilled Orbit Notes minimal art sticker at $6.29, one HIDDEN Original Abstract Art Gifts collection, payout INACTIVE. Price is not proof of positive net profit. This is a dated audit, not continuously authenticated cloud access.";
const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
const cap=s=>String(s||"").replace(/(?:Bearer\s+)[A-Za-z0-9._~+/-]+/gi,"Bearer [redacted]").slice(0,1400);
async function cycle(env) {
  if(!env.AI||!env.DB) throw Error("bindings_missing");
  const day=new Date().toISOString().slice(0,10);
  const today=await env.DB.prepare("SELECT COUNT(*) AS n FROM cycles WHERE ts>=?").bind(day).first();
  // Hard internal budget limiter: MAX eight cloud work cycles per day / sixteen inference calls.
  if((today?.n||0) >=8) return "daily_budget_cap";
  const total=await env.DB.prepare("SELECT COUNT(*) AS n FROM cycles").first();
  const index=(total?.n||0)%TEAM.length;
  const role=TEAM[index][0],goal=TEAM[index][1],next=TEAM[(index+1)%TEAM.length][0];
  const last=await env.DB.prepare("SELECT sender,body FROM messages WHERE recipient=? ORDER BY id DESC LIMIT 1").bind(role).first();
  const handoff=last ? ("Message from "+last.sender+" [UNVERIFIED DRAFT]: "+cap(last.body).slice(0,450)) : "No prior specialist handoff.";
  const supervisor=await env.AI.run(MODEL,{
    messages:[
      {role:"system",content:"You are Cavalry, a professional zero-budget POD operations supervisor. Assign internal research/draft work only. Do not pretend external actions, store launch, payment or sales have occurred. Max 70 words."},
      {role:"user",content:"Assign one safe preparatory task to "+role+". Goal: "+goal+". Store evidence: "+BASELINE+". Prior context: "+handoff}
    ],max_tokens:115,temperature:0.2
  });
  const assigned=cap(supervisor?.response);
  if(assigned.length<5) throw Error("supervisor_empty");
  const ai=await env.AI.run(MODEL,{
    messages:[
      {role:"system",content:"You are the "+role+" specialist under Cavalry. Produce a short concrete DRAFT, not verified facts. No outreach, purchases, product publishing, ad purchases, payment modification, fabricated metrics or trademark infringement. Give a useful final instruction to the next specialist "+next+". Max 100 words."},
      {role:"user",content:"Cavalry assignment: "+assigned+". Role brief: "+goal+". "+handoff}
    ],max_tokens:165,temperature:0.35
  });
  const draft=cap(ai?.response);
  if(draft.length<8) throw Error("specialist_empty");
  const ts=new Date().toISOString();
  const wrote=await env.DB.prepare("INSERT INTO cycles(ts,actor,status,model,verified) VALUES(?,?,?,?,0)")
    .bind(ts,role,"AI_DRAFT_COMPLETED",MODEL).run();
  const cid=wrote.meta?.last_row_id||0;
  await env.DB.batch([
    env.DB.prepare("INSERT INTO messages(ts,cycle_id,sender,recipient,kind,body,verified) VALUES(?,?,?,?,?,?,0)").bind(ts,cid,"Cavalry",role,"assignment",assigned),
    env.DB.prepare("INSERT INTO messages(ts,cycle_id,sender,recipient,kind,body,verified) VALUES(?,?,?,?,?,?,0)").bind(ts,cid,role,next,"handoff_draft",draft),
    env.DB.prepare("INSERT INTO messages(ts,cycle_id,sender,recipient,kind,body,verified) VALUES(?,?,?,?,?,?,0)").bind(ts,cid,role,"Cavalry","report_draft",draft)
  ]);
  return {role,next,cycle:cid,assignment_delivered:true,specialist_response_saved:true};
}
export default {
  async scheduled(controller,env,ctx) {
    ctx.waitUntil(cycle(env).catch(async(err)=>{
      // Fail closed; errors in logs never include credentials or personal data.
      console.error("cavalry_cloud_cycle_failed",String(err?.name||"error"));
    }));
  },
  async fetch(request,env) {
    if(request.method!=="GET")return json({error:"read_only"},405);
    const path=new URL(request.url).pathname;
    if(path!=="/"&&path!=="/status")return json({error:"not_found"},404);
    try {
      const n=await env.DB.prepare("SELECT COUNT(*) AS total FROM cycles").first();
      const last=await env.DB.prepare("SELECT ts,actor,status FROM cycles ORDER BY id DESC LIMIT 1").first();
      const msgs=await env.DB.prepare("SELECT COUNT(*) AS total FROM messages").first();
      const count=n?.total||0;
      return json({system:"Cavalry Med Art AI Team",mode:"cloud_prelaunch_draft_only",leader:"Cavalry",specialists:TEAM.map(a=>a[0]),
        total_cycles:count,total_handoffs:msgs?.total||0,last_cycle:last||null,next_role:TEAM[count%TEAM.length][0],
        independent_pc:true,merchant_live:false,ai_model:MODEL,external_store_writes:false,
        zero_spend_target:true,free_quota_budget_max_cycles_per_utc_day:8,
        payout_last_verified:"INACTIVE (2026-10-09)",store_last_verified:"COMING_SOON, 1 hidden POD sticker and 1 hidden collection (2026-10-09)"});
    } catch (e) {return json({service:"Cavalry",status:"db_unavailable"},503);}
  }
};