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
const BASELINE="Verified on October 9, 2026 via authenticated Fourthwall MCP: Med Art COMING_SOON, three HIDDEN Fourthwall-fulfilled print-on-demand products (Orbit Notes sticker $6.29, Contour Flow tee $22.75, Night Geometry mug $16.95) in one HIDDEN Original Abstract Art Gifts collection, payout INACTIVE. Price is not proof of positive net profit. This is a dated audit, not continuously authenticated cloud access.";
const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
const cap=s=>String(s||"").replace(/(?:Bearer\s+)[A-Za-z0-9._~+/-]+/gi,"Bearer [redacted]").slice(0,1400);
// An AI HTTP success is NOT proof of usable draft work. Reject generic refusals.
const unusable=s=>/^\s*(?:sorry\b|i\s+(?:cannot|can.t|can not|won.t|am unable)\b|as an ai\b)/i.test(s)||/is there anything else i can help you with\??\s*$/i.test(s);
/* Automatic draft quarantine: POD goods are supplier-produced, not handmade.
 * Do not let a model invent return guarantees, fulfillment times, medical
 * benefits, reviews or scarcity. Flag uncertainties for human review instead. */
const unverifiedCommerceClaims=s=>[
  /\b(?:handmade|handcrafted|one.of.a.kind|best.selling|limited.edition|health.focused)\b/i,
  /\b(?:guaranteed refund|full refund|free returns|no.questions.asked)\b/i,
  /\b(?:we (?:will|guarantee to) (?:provide|issue|offer).{0,30}refund)\b/i,
  /\b(?:we (?:ship|deliver)|shipping guaranteed|delivery guaranteed).{0,35}\bwithin\s+\d+\s+(?:business\s+)?days?\b/i,
  /\[(?:timeframe|price|name|contact|shipping|return period|\d+ days)\]/i,
  /\b(?:clinically proven|medical benefits|certified organic)\b/i,
  /\b(?:thousands of happy customers|five.star rated|customer favorite)\b/i
].some(pattern=>pattern.test(String(s||"")));
const draftRejected=s=>unusable(s)||unverifiedCommerceClaims(s);

async function cycle(env) {
  if(!env.AI||!env.DB) throw Error("bindings_missing");
  // Keep monitoring HOURLY, but spread at most eight inference cycles evenly over 24h.
  // This avoids burning the entire free-draft budget during the first eight hours.
  if(new Date().getUTCHours()%3!==0) return "interval_monitor_only";
  const day=new Date().toISOString().slice(0,10);
  const today=await env.DB.prepare("SELECT COUNT(*) AS n FROM cycles WHERE ts>=?").bind(day).first();
  // Hard internal budget limiter: MAX eight cloud work cycles per day / sixteen inference calls.
  if((today?.n||0) >=8) return "daily_budget_cap";
  const total=await env.DB.prepare("SELECT COUNT(*) AS n FROM cycles").first();
  const index=(total?.n||0)%TEAM.length;
  const role=TEAM[index][0],goal=TEAM[index][1],next=TEAM[(index+1)%TEAM.length][0];
  const last=await env.DB.prepare("SELECT sender,body FROM messages WHERE recipient=? ORDER BY id DESC LIMIT 1").bind(role).first();
  const handoff=last&&!draftRejected(last.body) ? ("Message from "+last.sender+" [UNVERIFIED DRAFT]: "+cap(last.body).slice(0,450)) : "No safe prior specialist handoff.";
  const supervisor=await env.AI.run(MODEL,{
    messages:[
      {role:"system",content:"You are Cavalry, a professional POD planning supervisor. Assign a helpful short INTERNAL DRAFT task; creative marketing and research drafts are allowed. Do not actually post, contact buyers or claim external actions, store launch, payment or sales have occurred. Max 70 words."},
      {role:"user",content:"Assign one safe preparatory task to "+role+". Goal: "+goal+". Store evidence: "+BASELINE+". Prior context: "+handoff}
    ],max_tokens:115,temperature:0.2
  });
  let assigned=cap(supervisor?.response);
  if(draftRejected(assigned)) assigned="Internal, unpublished creative/research task: "+goal+". Produce a useful short DRAFT only. Never assert unverified store actions, production specifications, demand, prices or sales.";
  if(assigned.length<5) throw Error("supervisor_empty");
  const ai=await env.AI.run(MODEL,{
    messages:[
      {role:"system",content:"You are the "+role+" specialist under Cavalry. Prepare a practical, unpublished INTERNAL DRAFT, not an external action. Writing benign proposed social copy or reviewing copy is allowed. Avoid false claims, fabricated metrics, copied brands, or statements that products are on sale. The only real collection is Original Abstract Art Gifts. These are POD supplier-produced items, never handmade or one-of-a-kind. Do not promise refunds, fixed shipping days, scarcity, health benefits or claim reviews. If policy, shipping, price or materials are unknown, mark them TO VERIFY. Give a useful next step to "+next+". Max 100 words."},
      {role:"user",content:"Cavalry assignment: "+assigned+". Role brief: "+goal+". "+handoff}
    ],max_tokens:165,temperature:0.35
  });
  const draft=cap(ai?.response);
  if(draft.length<8) throw Error("specialist_empty");
  const draftStatus=draftRejected(draft)?"DRAFT_REJECTED":"AI_DRAFT_COMPLETED";
  const ts=new Date().toISOString();
  const wrote=await env.DB.prepare("INSERT INTO cycles(ts,actor,status,model,verified) VALUES(?,?,?,?,0)")
    .bind(ts,role,draftStatus,MODEL).run();
  const cid=wrote.meta?.last_row_id||0;
  // Rejected text is not a creative output and must not be handed to the next agent.
  if(draftStatus==="DRAFT_REJECTED")return {role,next,cycle:cid,status:draftStatus,assignment_delivered:false,specialist_response_saved:false};
  await env.DB.batch([
    env.DB.prepare("INSERT INTO messages(ts,cycle_id,sender,recipient,kind,body,verified) VALUES(?,?,?,?,?,?,0)").bind(ts,cid,"Cavalry",role,"assignment",assigned),
    env.DB.prepare("INSERT INTO messages(ts,cycle_id,sender,recipient,kind,body,verified) VALUES(?,?,?,?,?,?,0)").bind(ts,cid,role,next,"handoff_draft",draft),
    env.DB.prepare("INSERT INTO messages(ts,cycle_id,sender,recipient,kind,body,verified) VALUES(?,?,?,?,?,?,0)").bind(ts,cid,role,"Cavalry","report_draft",draft)
  ]);
  return {role,next,cycle:cid,status:draftStatus,assignment_delivered:true,specialist_response_saved:true};
}
async function monitoredCycle(env) {
  // Safe heartbeat: prove cron invocation and distinguish AI errors from a missing schedule.
  const ts=new Date().toISOString();
  const begin=await env.DB.prepare("INSERT INTO worker_runs(ts,status,role,error_code) VALUES(?,'RUNNING',NULL,NULL)")
    .bind(ts).run();
  const rid=begin.meta?.last_row_id;
  try {
    const result=await cycle(env);
    const role=typeof result==="object" ? result.role : null;
    await env.DB.prepare("UPDATE worker_runs SET status=?,role=? WHERE id=?")
      .bind(result==="daily_budget_cap"?"SKIPPED_BUDGET":result==="interval_monitor_only"?"SKIPPED_INTERVAL":result?.status==="DRAFT_REJECTED"?"REJECTED_DRAFT":"SUCCESS",role,rid).run();
    return result;
  } catch(err) {
    // Record only an error class, never messages, tokens or customer information.
    await env.DB.prepare("UPDATE worker_runs SET status='ERROR',error_code=? WHERE id=?")
      .bind(String(err?.name||"unclassified").slice(0,48),rid).run().catch(()=>{});
    throw err;
  }
}
export default {
  async scheduled(controller,env,ctx) {
    ctx.waitUntil(monitoredCycle(env).catch(err=>{
      console.error("cavalry_cloud_cycle_failed",String(err?.name||"error"));
      throw err;
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
      const handoffs=await env.DB.prepare("SELECT COUNT(*) AS total FROM messages WHERE kind='handoff_draft'").first();
      const lastRun=await env.DB.prepare("SELECT ts,status,role,error_code FROM worker_runs ORDER BY id DESC LIMIT 1").first();
      const count=n?.total||0;
      return json({system:"Cavalry Med Art AI Team",mode:"cloud_prelaunch_draft_only",leader:"Cavalry",specialists:TEAM.map(a=>a[0]),
        total_cycles:count,total_messages:msgs?.total||0,total_handoffs:handoffs?.total||0,last_cycle:last||null,last_scheduler_event:lastRun||null,next_role:TEAM[count%TEAM.length][0],
        independent_pc:true,merchant_live:false,ai_model:MODEL,external_store_writes:false,
        zero_spend_target:true,free_quota_budget_max_cycles_per_utc_day:8,quality_guardrail:"refusal_and_unsupported_commerce_claims_v2",
        payout_last_verified:"INACTIVE (2026-10-09)",store_last_verified:"COMING_SOON, 3 hidden POD items in one hidden collection (2026-10-09)"});
    } catch (e) {return json({service:"Cavalry",status:"db_unavailable"},503);}
  }
};