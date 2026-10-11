// Deployed independently to Cloudflare as cavalry-free-hub on 2026-10-11.
// Public endpoint is read-only. Queue accepts only health-check jobs.
// Real customer orders, payment verification and agent instructions must be
// authenticated and added in a separate reviewed release.
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method !== "GET" || url.pathname !== "/health") {
      return new Response("Not found", { status: 404 });
    }
    try {
      const row = await env.DB.prepare("SELECT 1 AS ok").first();
      const value = await env.CONFIG.get("initialized");
      return Response.json(
        {
          service: "cavalry-free-hub",
          status: row?.ok === 1 && value === "yes" ? "ok" : "degraded",
          database: row?.ok === 1,
          config: value === "yes",
          queue_bound: !!env.JOBS,
          ai_bound: !!env.AI,
          vectorize_bound: !!env.KNOWLEDGE
        },
        { headers: { "cache-control": "no-store" } }
      );
    } catch {
      return Response.json({ status: "degraded" }, { status: 503 });
    }
  },
  async scheduled(event, env) {
    const id = "heartbeat-" + String(event.scheduledTime);
    await env.DB.prepare("INSERT OR IGNORE INTO jobs(id,kind,state) VALUES (?,?,?)")
      .bind(id, "health-check", "queued").run();
    await env.JOBS.send({ id, kind: "health-check" });
  },
  async queue(batch, env) {
    for (const msg of batch.messages) {
      try {
        const body = msg.body || {};
        if (body.kind !== "health-check" || typeof body.id !== "string" || body.id.length > 120) {
          msg.ack();
          continue;
        }
        await env.DB.prepare(
          "UPDATE jobs SET state=?,updated_at=CURRENT_TIMESTAMP,result=? WHERE id=? AND kind=?"
        ).bind("complete", "heartbeat processed", body.id, "health-check").run();
        await env.DB.prepare("INSERT INTO events(kind,origin,detail) VALUES (?,?,?)")
          .bind("heartbeat", "cavalry-free-hub", body.id).run();
        msg.ack();
      } catch {
        msg.retry({ delaySeconds: 60 });
      }
    }
  }
};