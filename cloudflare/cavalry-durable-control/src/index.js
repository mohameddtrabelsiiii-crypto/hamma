import { DurableObject, WorkflowEntrypoint } from "cloudflare:workers";

export class CavalryState extends DurableObject {
  async tick() {
    const previous = (await this.ctx.storage.get("runs")) || 0;
    await this.ctx.storage.put("runs", previous + 1);
    return previous + 1;
  }
}

export class CavalryDailyWorkflow extends WorkflowEntrypoint {
  async run(event, step) {
    await step.do("check-database", async () => {
      const value = await this.env.DB.prepare("SELECT 1 AS ok").first();
      if (value?.ok !== 1) throw new Error("database unavailable");
      return true;
    });
    await step.do("record-activity", async () => {
      const id = this.env.STATE.idFromName("cavalry-watch");
      const count = await this.env.STATE.get(id).tick();
      await this.env.DB.prepare("INSERT INTO events(kind,origin,detail) VALUES(?,?,?)")
        .bind("workflow", "cavalry-durable-control", "run " + count).run();
      return count;
    });
  }
}

export default {
  async fetch(request) {
    if (request.method !== "GET" || new URL(request.url).pathname !== "/health")
      return new Response("Not found", { status: 404 });
    return Response.json({ service: "cavalry-durable-control", status: "configured" }, {
      headers: { "cache-control": "no-store" }
    });
  },
  async scheduled(event, env) {
    await env.CONTROL_WORKFLOW.create({ params: {
      origin: "scheduled", at: event.scheduledTime
    } });
  }
};
