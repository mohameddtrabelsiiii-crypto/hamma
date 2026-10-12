import { createHash, createPublicKey, verify } from "node:crypto";

const url = process.argv[2] || "https://angels-truth-guardian.mohameddtrabelsiiii.workers.dev";
const PINNED_FINGERPRINT="cade0bff6d81b9edbaf475ed82878312f70e7a8fb4978e69cca49eed02c76ace";
const sha = (s) => createHash("sha256").update(s).digest("hex");
const get = async (suffix) => {
  const response=await fetch(url+suffix,{cache:"no-store",signal:AbortSignal.timeout(15000)});
  if (!response.ok) throw Error(suffix+" HTTP "+response.status);
  return response.json();
};
try {
  const [proof,identity,health] = await Promise.all([get("/proof"),get("/identity"),get("/health")]);
  if (!proof.available) throw Error("NO_DURABLE_EVIDENCE_YET");
  const jwk=proof.public_key_jwk;
  const fingerprint=sha(JSON.stringify({crv:jwk.crv,kty:jwk.kty,x:jwk.x}));
  if(fingerprint!==PINNED_FINGERPRINT || identity.fingerprint_sha256!==PINNED_FINGERPRINT || health.identity_fingerprint!==PINNED_FINGERPRINT) throw Error("IDENTITY_NOT_PINNED");
  const calculated=sha(proof.previous_hash+"|"+JSON.stringify({seq:proof.seq,occurred_at:proof.occurred_at,kind:proof.kind,payload:proof.payload}));
  if(calculated!==proof.event_hash || health.evidence_chain_head!==proof.event_hash) throw Error("CHAIN_HASH_MISMATCH");
  const publicKey=createPublicKey({key:jwk,format:"jwk"});
  const valid=verify(null,Buffer.from(proof.event_hash,"utf8"),publicKey,Buffer.from(proof.signature_ed25519_base64,"base64"));
  if(!valid) throw Error("SIGNATURE_INVALID");
  if(health.ledger_integrity!=="VERIFIED" || health.production_certified!==false) throw Error("TRUTH_STATUS_INVALID");
  const lastSelfCycle=Date.parse(health.last_cycle_at);
  if (!Number.isFinite(lastSelfCycle) || Date.now()-lastSelfCycle > 90*60*1000 || lastSelfCycle-Date.now() > 5*60*1000) throw Error("SCHEDULED_OBSERVATION_STALE");
  console.log(JSON.stringify({independent_verdict:"PASS",signed_event_seq:proof.seq,kind:proof.kind,identity_fingerprint:fingerprint,ledger_entries:health.ledger_entries,company_coverage:health.company_monitoring_coverage,certified:false}));
} catch(err) {
  console.error(JSON.stringify({independent_verdict:"FAIL",reason:String(err.message || err)}));
  process.exitCode=1;
}
