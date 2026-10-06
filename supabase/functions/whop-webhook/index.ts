import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import { Webhook } from "npm:standardwebhooks@1.1.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, webhook-id, webhook-timestamp, webhook-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" }
  });
}

function dig(obj: any, paths: string[]): any {
  for (const path of paths) {
    let cur = obj;
    for (const part of path.split(".")) cur = cur?.[part];
    if (cur !== undefined && cur !== null && cur !== "") return cur;
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const secret = Deno.env.get("WHOP_WEBHOOK_SECRET");
  if (!secret) return json({ error: "Whop webhook is not configured yet." }, 503);

  try {
    const bodyText = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    const verifier = new Webhook(btoa(secret));

    let event: any;
    try {
      event = verifier.verify(bodyText, headers);
    } catch {
      return json({ error: "Invalid Whop webhook signature." }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const eventData = event?.data ?? {};
    const eventType = String(event?.type ?? "unknown");
    const whopEventId = headers["webhook-id"] || (event?.id ? String(event.id) : null);
    const paymentId = dig(eventData, ["id", "payment_id", "payment.id"]);

    const metadata =
      eventData?.metadata ??
      eventData?.payment?.metadata ??
      eventData?.checkout?.metadata ??
      {};

    const orderReference = String(
      metadata?.order_reference ??
      metadata?.reference ??
      eventData?.order_reference ??
      ""
    ).trim();

    let order: any = null;
    if (orderReference) {
      const { data } = await supabase
        .from("orders")
        .select("id,reference,status,amount_tnd,whop_checkout_id")
        .eq("reference", orderReference)
        .maybeSingle();
      order = data;
    }

    const { data: existing } = whopEventId
      ? await supabase.from("whop_events").select("id,processed").eq("whop_event_id", whopEventId).maybeSingle()
      : { data: null };

    if (existing?.processed) return json({ ok: true, duplicate: true });

    const { data: savedEvent, error: saveError } = await supabase
      .from("whop_events")
      .upsert({
        whop_event_id: whopEventId,
        event_type: eventType,
        payment_id: paymentId ? String(paymentId) : null,
        order_id: order?.id ?? null,
        raw_payload: event,
        processed: false
      }, { onConflict: "whop_event_id" })
      .select("id")
      .maybeSingle();

    if (saveError) return json({ error: saveError.message }, 500);

    if (eventType === "payment.succeeded" && order) {
      // Never release work for an unpriced order, wrong currency, or unmatched checkout.
      const expected = Number(order.amount_tnd);
      const total = Number(eventData?.total);
      const checkoutId = dig(eventData, ["checkout_id", "checkout.id"]);
      if (!order.amount_tnd || !Number.isFinite(expected) || expected <= 0 ||
          eventData?.total == null || !Number.isFinite(total) ||
          Math.abs(total - expected) > 0.000001 ||
          String(eventData?.currency ?? "").toLowerCase() !== "tnd" ||
          !paymentId || !order.whop_checkout_id || checkoutId !== order.whop_checkout_id) {
        return json({ ok: true, needs_review: true });
      }
      const { error: paymentError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_confirmed_at: new Date().toISOString(),
          whop_payment_id: paymentId ? String(paymentId) : null,
          whop_customer_id: dig(eventData, ["user_id", "customer_id", "member_id"]) ? String(dig(eventData, ["user_id", "customer_id", "member_id"])) : null,
          whop_checkout_id: dig(eventData, ["checkout_id", "checkout.id"]) ? String(dig(eventData, ["checkout_id", "checkout.id"])) : null
        })
        .eq("id", order.id)
        .in("status", ["awaiting_payment", "paid"]);
      if (paymentError) return json({error:"Could not record payment."},500);

      if (savedEvent?.id) {
        await supabase.from("whop_events").update({
          processed: true,
          processed_at: new Date().toISOString()
        }).eq("id", savedEvent.id);
      }
    } else if (eventType === "payment.failed" && savedEvent?.id) {
      await supabase.from("whop_events").update({
        processed: true,
        processed_at: new Date().toISOString()
      }).eq("id", savedEvent.id);
    } else if (eventType === "refund.created" && order) {
      await supabase.from("orders").update({
        status: "rejected",
        result_text: "Payment refunded through Whop."
      }).eq("id", order.id);

      if (savedEvent?.id) {
        await supabase.from("whop_events").update({
          processed: true,
          processed_at: new Date().toISOString()
        }).eq("id", savedEvent.id);
      }
    }

    return json({ ok: true, event_type: eventType, order_reference: orderReference || null });
  } catch (error) {
    return json({
      error: error instanceof Error ? error.message : "Unexpected error."
    }, 500);
  }
});