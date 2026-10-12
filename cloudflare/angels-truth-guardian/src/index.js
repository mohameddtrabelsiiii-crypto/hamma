import { DurableObject } from "cloudflare:workers";

/**
 * ANGELS.co Guardian — independently scoped, evidence-first foundation.
 * This release is OBSERVE_ONLY. It cannot repair, authorize, certify, or accept
 * external events. Only Cloudflare Cron can append a self-observation.
 * A heartbeat is proof of liveness ONLY — never progress or completion.
 */
const enc = new TextEncoder();
const hex = (a) => [...new Uint8Array(a)].map(x => x.toString(16).padStart(2, "0")).join("");
const b64 = (a) => btoa(String.fromCharCode(...new Uint8Array(a)));
const unb64 = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const digest = async (s) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));

export class GuardianState extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.ready = ctx.blockConcurrencyWhile(async () => {
      ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS ledger (seq INTEGER PRIMARY KEY, occurred_at TEXT NOT NULL, kind TEXT NOT NULL, payload TEXT NOT NULL, previous_hash TEXT NOT NULL, event_hash TEXT NOT NULL, signature TEXT NOT NULL)");
      ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS registry (entity_id TEXT PRIMARY KEY, entity_type TEXT NOT NULL, status TEXT NOT NULL, owner TEXT NOT NULL, last_verified_at TEXT, evidence_ref TEXT)");
      ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS incidents (incident_id TEXT PRIMARY KEY, status TEXT NOT NULL, severity TEXT NOT NULL, source_id TEXT NOT NULL, first_seen TEXT NOT NULL, last_seen TEXT NOT NULL, evidence_ref TEXT NOT NULL, next_action TEXT NOT NULL)");
      if (!(await ctx.storage.get("private_jwk"))) {
        const keys = await crypto.subtle.generateKey({name:"Ed25519"}, true, ["sign","verify"]);
        const privateKey = await crypto.subtle.exportKey("jwk", keys.privateKey);
        const publicKey = await crypto.subtle.exportKey("jwk", keys.publicKey);
        await ctx.storage.put({private_jwk:privateKey, public_jwk:publicKey, identity_created_at:new Date().toISOString()});
      }
    });
  }

  async identity() {
    await this.ready;
    const jwk = await this.ctx.storage.get("public_jwk");
    const fingerprint = await digest(JSON.stringify({crv:jwk.crv,kty:jwk.kty,x:jwk.x}));
    return {algorithm:"Ed25519",fingerprint_sha256:fingerprint, public_key_jwk:{kty:jwk.kty,crv:jwk.crv,x:jwk.x},created_at:await this.ctx.storage.get("identity_created_at")};
  }

  async validateLedger() {
    await this.ready;
    const allCount = this.ctx.storage.sql.exec("SELECT COUNT(*) AS n FROM ledger").toArray()[0].n;
    if (allCount > 2000) return {ok:false,reason:"MANUAL_FULL_LEDGER_REVIEW_REQUIRED",entries:allCount};
    const rows = this.ctx.storage.sql.exec("SELECT seq,occurred_at,kind,payload,previous_hash,event_hash,signature FROM ledger ORDER BY seq ASC").toArray();
    const pub = await crypto.subtle.importKey("jwk",await this.ctx.storage.get("public_jwk"),{name:"Ed25519"},false,["verify"]);
    let previous = "GENESIS";
    for (let i=0;i<rows.length;i++) {
      const item=rows[i];
      if (item.seq !== i+1 || item.previous_hash !== previous) return {ok:false,reason:"CHAIN_DISCONTINUITY",at:item.seq,entries:allCount};
      const calculated = await digest(previous+"|"+JSON.stringify({seq:item.seq,occurred_at:item.occurred_at,kind:item.kind,payload:JSON.parse(item.payload)}));
      if (item.event_hash !== calculated) return {ok:false,reason:"HASH_MISMATCH",at:item.seq,entries:allCount};
      const verified=await crypto.subtle.verify("Ed25519",pub,unb64(item.signature),enc.encode(item.event_hash));
      if (!verified) return {ok:false,reason:"INVALID_SIGNATURE",at:item.seq,entries:allCount};
      previous=item.event_hash;
    }
    const durableHead=await this.ctx.storage.get("head_hash");
    if (durableHead !== undefined && durableHead !== previous) return {ok:false,reason:"HEAD_MISMATCH",entries:allCount};
    return {ok:true,entries:allCount,head_hash:previous};
  }

  async tick(scheduledTime) {
    const integrity=await this.validateLedger();
    if (!integrity.ok) return {ok:false,reason:integrity.reason};
    const next=integrity.entries+1;
    const at=new Date().toISOString();
    const payload={scope:"GUARDIAN_RUNTIME_ONLY",liveness:"OBSERVED",productive_progress:"UNKNOWN",company_coverage:"UNKNOWN",scheduled_time:scheduledTime};
    const eventHash=await digest(integrity.head_hash+"|"+JSON.stringify({seq:next,occurred_at:at,kind:"SELF_OBSERVATION",payload}));
    const signer=await crypto.subtle.importKey("jwk",await this.ctx.storage.get("private_jwk"),{name:"Ed25519"},false,["sign"]);
    const signature=b64(await crypto.subtle.sign("Ed25519",signer,enc.encode(eventHash)));
    this.ctx.storage.sql.exec(
      "INSERT INTO ledger(seq,occurred_at,kind,payload,previous_hash,event_hash,signature) VALUES(?,?,?,?,?,?,?)",
      next,at,"SELF_OBSERVATION",JSON.stringify(payload),integrity.head_hash,eventHash,signature
    );
    await this.ctx.storage.put({head_hash:eventHash,last_cycle_at:at});
    return {ok:true,seq:next,event_hash:eventHash};
  }

  async latestProof() {
    await this.ready;
    const rows=this.ctx.storage.sql.exec("SELECT seq,occurred_at,kind,payload,previous_hash,event_hash,signature FROM ledger ORDER BY seq DESC LIMIT 1").toArray();
    if (!rows.length) return {available:false};
    const r=rows[0];
    return {available:true,seq:r.seq,occurred_at:r.occurred_at,kind:r.kind,payload:JSON.parse(r.payload),previous_hash:r.previous_hash,event_hash:r.event_hash,signature_ed25519_base64:r.signature,public_key_jwk:(await this.identity()).public_key_jwk};
  }

  async observeServices(scheduledTime,reports) {
    const integrity=await this.validateLedger();
    if (!integrity.ok) return {ok:false,reason:integrity.reason};
    const seq=integrity.entries+1;
    const at=new Date().toISOString();
    const payload={scope:"READ_ONLY_INTERNAL_SERVICE_PROBES",productive_progress:"UNKNOWN",scheduled_time:scheduledTime,reports};
    const eventHash=await digest(integrity.head_hash+"|"+JSON.stringify({seq,occurred_at:at,kind:"SERVICE_OBSERVATION",payload}));
    const signer=await crypto.subtle.importKey("jwk",await this.ctx.storage.get("private_jwk"),{name:"Ed25519"},false,["sign"]);
    const signature=b64(await crypto.subtle.sign("Ed25519",signer,enc.encode(eventHash)));
    this.ctx.storage.sql.exec(
      "INSERT INTO ledger(seq,occurred_at,kind,payload,previous_hash,event_hash,signature) VALUES(?,?,?,?,?,?,?)",
      seq,at,"SERVICE_OBSERVATION",JSON.stringify(payload),integrity.head_hash,eventHash,signature
    );
    await this.ctx.storage.put({head_hash:eventHash,last_service_probe_at:at});
    for (const r of reports) {
      this.ctx.storage.sql.exec(
        "INSERT INTO registry(entity_id,entity_type,status,owner,last_verified_at,evidence_ref) VALUES(?,?,?,?,?,?) ON CONFLICT(entity_id) DO UPDATE SET status=excluded.status,last_verified_at=excluded.last_verified_at,evidence_ref=excluded.evidence_ref",
        r.id,"WORKER",r.outcome,"CAVALRY_UNVERIFIED",r.outcome==="FUNCTIONAL_ENDPOINT_OK"?at:null,eventHash
      );
      if (r.outcome==="FAILED") {
        this.ctx.storage.sql.exec(
          "INSERT INTO incidents(incident_id,status,severity,source_id,first_seen,last_seen,evidence_ref,next_action) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(incident_id) DO UPDATE SET last_seen=excluded.last_seen,evidence_ref=excluded.evidence_ref",
          "HEALTH-"+r.id,"OPEN","MEDIUM",r.id,at,at,eventHash,"Independent diagnosis and recovery authorization required"
        );
      }
    }
    return {ok:true,seq,event_hash:eventHash};
  }

  async summary() {
    const integrity=await this.validateLedger();
    const identity=await this.identity();
    return {
      system:"ANGELS.co Guardian",
      operating_mode:"OBSERVE_ONLY",
      production_certified:false,
      company_monitoring_coverage:"PARTIAL_TWO_INTERNAL_WORKERS",
      ledger_integrity:integrity.ok?"VERIFIED":"FAILED",
      integrity_reason:integrity.ok?null:integrity.reason,
      ledger_entries:integrity.entries,
      observed_worker_count:this.ctx.storage.sql.exec("SELECT COUNT(*) AS n FROM registry").toArray()[0].n,
      open_incident_count:this.ctx.storage.sql.exec("SELECT COUNT(*) AS n FROM incidents WHERE status='OPEN'").toArray()[0].n,
      last_service_probe_at:await this.ctx.storage.get("last_service_probe_at") || null,
      last_cycle_at:await this.ctx.storage.get("last_cycle_at") || null,
      identity_fingerprint:identity.fingerprint_sha256,
      recoveries_executed:0,
      evidence_chain_head:integrity.ok?integrity.head_hash:null
    };
  }
}

export default {
  async fetch(request, env) {
    const pathname=new URL(request.url).pathname;
    if (request.method!=="GET" || (pathname!=="/health" && pathname!=="/identity" && pathname!=="/proof")) return new Response("Not found",{status:404});
    try {
      const obj=env.GUARDIAN_STATE.get(env.GUARDIAN_STATE.idFromName("ANGELS_GUARDIAN_V1"));
      const body=pathname==="/identity" ? await obj.identity() : pathname==="/proof" ? await obj.latestProof() : await obj.summary();
      const status=pathname==="/health" && body.ledger_integrity==="FAILED" ? 503 : 200;
      return Response.json(body,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
    } catch {
      return Response.json({system:"ANGELS.co Guardian",status:"UNKNOWN",production_certified:false},{status:503,headers:{"Cache-Control":"no-store"}});
    }
  },
  async scheduled(event,env) {
    const obj=env.GUARDIAN_STATE.get(env.GUARDIAN_STATE.idFromName("ANGELS_GUARDIAN_V1"));
    const outcome=await obj.tick(event.scheduledTime);
    if (!outcome.ok) throw new Error("GUARDIAN_LEDGER_INTEGRITY_FAILURE");
    const probeDefinitions=[
      {id:"cavalry-free-hub",binding:env.CAVALRY_FREE_HUB,expected:"functional"},
      {id:"cavalry-durable-control",binding:env.CAVALRY_CONTROL,expected:"route"}
    ];
    const reports=await Promise.all(probeDefinitions.map(async (p) => {
      try {
        const response=await p.binding.fetch(new Request("https://service.internal/health"));
        const raw=await response.text();
        const parsed=JSON.parse(raw);
        const functional=p.expected==="functional" && response.status===200 && parsed.status==="ok" && parsed.database===true && parsed.config===true;
        const route=p.expected==="route" && response.status===200 && parsed.service==="cavalry-durable-control";
        return {id:p.id,http_status:response.status,outcome:functional?"FUNCTIONAL_ENDPOINT_OK":route?"REACHABLE_ONLY":"FAILED",body_sha256:await digest(raw)};
      } catch {
        return {id:p.id,http_status:0,outcome:"FAILED",body_sha256:null};
      }
    }));
    const recorded=await obj.observeServices(event.scheduledTime,reports);
    if (!recorded.ok) throw new Error("GUARDIAN_SERVICE_LEDGER_FAILURE");
  }
};
