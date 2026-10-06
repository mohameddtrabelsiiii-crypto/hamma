'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type Service = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_tnd: number | null;
  needs_verified_result: boolean;
  auto_processed: boolean;
};

type OrderStatus = "awaiting_payment" | "paid" | "processing" | "needs_review" | "delivered" | "rejected";

type OrderRow = {
  id: string;
  reference: string;
  status: OrderStatus;
  amount_tnd: number | null;
  brief: string | null;
  file_path: string | null;
  result_text: string | null;
  result_checked: boolean;
  created_at: string;
  delivered_at: string | null;
  services?: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

type OrderResponse = {
  order?: { reference?: string; amount_tnd?: number | null };
  payment_link?: string | null;
  error?: string;
  message?: string;
};

const statusLabels: Record<OrderStatus, string> = {
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  processing: "Processing",
  needs_review: "Needs review",
  delivered: "Delivered",
  rejected: "Rejected",
};

const trackingSteps = ["Payment", "Processing", "Review", "Delivery"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function serviceName(order: OrderRow) {
  const service = Array.isArray(order.services) ? order.services[0] : order.services;
  return service?.name ?? "TaskForge service";
}

function currentStep(status: OrderStatus) {
  if (status === "awaiting_payment") return 0;
  if (status === "paid" || status === "processing") return 1;
  if (status === "needs_review") return 2;
  if (status === "delivered") return 3;
  return -1;
}

function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === "rejected") {
    return <div className="progress rejected">This order was rejected. Contact TaskForge AI for details.</div>;
  }

  const activeStep = currentStep(status);

  return (
    <div className="progress" aria-label={`Order status: ${statusLabels[status]}`}>
      {trackingSteps.map((step, index) => (
        <div className={`step ${index < activeStep ? "complete" : ""} ${index === activeStep ? "current" : ""}`} key={step}>
          <span>{index + 1}</span>
          <small>{step}</small>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brief, setBrief] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [reference, setReference] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const accountEmail = session?.user?.email ?? "";

  const loadOrders = useCallback(async () => {
    if (!session) {
      setOrders([]);
      return;
    }

    setOrdersLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("id,reference,status,amount_tnd,brief,file_path,result_text,result_checked,created_at,delivered_at,services(name,slug)")
      .order("created_at", { ascending: false });

    if (error) {
      setAuthMessage(error.message || "Unable to load your orders right now.");
    } else {
      setOrders((data ?? []) as OrderRow[]);
    }
    setOrdersLoading(false);
  }, [session]);

  useEffect(() => {
    async function loadServices() {
      const { data, error } = await supabase
        .from("services")
        .select("id,slug,name,description,price_tnd,needs_verified_result,auto_processed")
        .eq("active", true)
        .order("sort_order");

      if (error) setStatus("Unable to load services right now.");
      else setServices((data ?? []) as Service[]);
      setLoading(false);
    }

    loadServices();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user?.email) {
        setEmail(data.session.user.email);
        setAuthEmail(data.session.user.email);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user?.email) {
        setEmail(nextSession.user.email);
        setAuthEmail(nextSession.user.email);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    if (next && next.size > 15 * 1024 * 1024) {
      setFile(null);
      setStatus("File is too large. Maximum size is 15 MB.");
      event.target.value = "";
      return;
    }
    setStatus("");
    setFile(next);
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage("");

    if (authPassword.length < 8) {
      setAuthMessage("Password must be at least 8 characters.");
      setAuthBusy(false);
      return;
    }

    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
      if (error) setAuthMessage(error.message);
      else if (data.session) setAuthMessage("Account created and signed in.");
      else setAuthMessage("Account created. Check your email to confirm your address, then sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) setAuthMessage(error.message);
      else setAuthMessage("Signed in. Your orders are loading.");
    }

    setAuthBusy(false);
  }

  async function downloadResult(orderId: string) {
    setAuthMessage("Preparing your checked result…");
    try {
      const { data, error } = await supabase.functions.invoke<{ url: string }>("download-order-result", {
        body: { order_id: orderId }
      });
      if (error || !data?.url) throw new Error("Download unavailable. Refresh your orders and try again.");
      window.location.assign(data.url);
      setAuthMessage("Your download is ready.");
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Download unavailable.");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setOrders([]);
    setAuthMessage("Signed out.");
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) {
      setStatus("Choose a service first.");
      return;
    }

    const customerEmail = accountEmail || email.trim().toLowerCase();

    setSubmitting(true);
    setStatus("Creating your order…");
    setReference("");
    setPaymentLink("");

    const form = new FormData();
    form.append("service_slug", selected.slug);
    form.append("customer_name", name);
    form.append("customer_email", customerEmail);
    form.append("brief", brief);
    if (file) form.append("file", file);

    const { data, error } = await supabase.functions.invoke<OrderResponse>("create-order", {
      body: form,
    });

    if (error) {
      setStatus(error.message || "Unable to create the order.");
      setSubmitting(false);
      return;
    }

    if (data?.error) {
      setStatus(data.error);
      setSubmitting(false);
      return;
    }

    setReference(data?.order?.reference ?? "");
    setPaymentLink(data?.payment_link ?? "");
    setStatus(data?.message ?? "Order created. Keep your TF reference.");
    setBrief("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (session) await loadOrders();
    setSubmitting(false);
  }

  return (
    <main className="shell">
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">TASKFORGE AI</span>
          <h1>Fast AI-powered business services.</h1>
          <p>Send your brief and file, receive a checked result, and keep your TF reference for payment and delivery.</p>
        </div>
        <div className="hero-panel" aria-label="Service status">
          <span className="live-dot" />
          <strong>Online</strong>
          <small>{orders.length ? `${orders.length} tracked order${orders.length === 1 ? "" : "s"}` : "Secure order intake"}</small>
        </div>
      </header>

      <section className="services" aria-labelledby="services-title">
        <div className="section-head">
          <div>
            <span className="eyebrow">SERVICE CATALOG</span>
            <h2 id="services-title">Choose a service</h2>
          </div>
          <span>{loading ? "Loading…" : `${services.length} services`}</span>
        </div>

        <div className="grid">
          {services.map((service) => (
            <button
              className={`card ${selected?.id === service.id ? "selected" : ""}`}
              key={service.id}
              onClick={() => setSelected(service)}
              type="button"
            >
              <div className="card-top">
                <span className="tag">{service.slug}</span>
                <strong>{service.price_tnd != null ? `${service.price_tnd} TND` : "Price on request"}</strong>
              </div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <div className="service-flags">
                {service.auto_processed && <span>Auto processed</span>}
                {service.needs_verified_result && <span>Checked result</span>}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="workspace" aria-label="Order workspace">
        <div className="order-panel">
          <div>
            <span className="eyebrow">NEW ORDER</span>
            <h2>{selected ? selected.name : "Tell us what you need"}</h2>
            <p>Your details and uploaded file are used to process this order.</p>
          </div>

          <form onSubmit={submitOrder} className="form">
            <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              disabled={Boolean(accountEmail)}
              title={accountEmail ? "Orders created while signed in are attached to your account email." : "Email address"}
            />
            {accountEmail && <small className="field-note">This order will be attached to {accountEmail}.</small>}
            <textarea value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="Brief / instructions" rows={5} />

            <label className="file-field">
              <span>Upload a source file <small>(optional, max 15 MB)</small></span>
              <input ref={fileInputRef} type="file" onChange={handleFile} accept=".pdf,.xlsx,.xls,.csv,.docx,.txt,.rtf" />
              {file && <small>Selected: {file.name}</small>}
            </label>

            <button className="primary" disabled={!selected || submitting}>
              {submitting ? "Creating order…" : "Create order"}
            </button>
          </form>

          {status && <div className="notice">{status}</div>}

          {reference && (
            <div className="reference">
              <div>TF reference: <strong>{reference}</strong></div>
              {paymentLink ? (
                <a className="payment-button" href={paymentLink} target="_blank" rel="noreferrer">
                  Continue to payment
                </a>
              ) : (
                <small>Payment link will be provided after the merchant payment method is configured.</small>
              )}
            </div>
          )}
        </div>

        <aside className="account-panel" aria-labelledby="account-title">
          <div className="account-head">
            <div>
              <span className="eyebrow">CUSTOMER PORTAL</span>
              <h2 id="account-title">Track your orders</h2>
            </div>
            {session && <span className="account-badge">Signed in</span>}
          </div>

          {!session ? (
            <>
              <div className="auth-toggle" role="tablist" aria-label="Authentication mode">
                <button className={authMode === "signin" ? "active" : ""} onClick={() => setAuthMode("signin")} type="button">Sign in</button>
                <button className={authMode === "signup" ? "active" : ""} onClick={() => setAuthMode("signup")} type="button">Create account</button>
              </div>

              <form className="auth-form" onSubmit={handleAuth}>
                <input required type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="Email address" />
                <input required type="password" minLength={8} value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="Password, 8+ characters" />
                <button className="secondary" disabled={authBusy} type="submit">
                  {authBusy ? "Working…" : authMode === "signin" ? "Sign in" : "Create account"}
                </button>
              </form>
              <p className="account-copy">Use the same email as your orders to see them here. Guest checkout still works without an account.</p>
            </>
          ) : (
            <div className="account-summary">
              <div>
                <small>Account email</small>
                <strong>{accountEmail}</strong>
              </div>
              <div className="account-actions">
                <button className="secondary" onClick={loadOrders} type="button">Refresh orders</button>
                <button className="ghost" onClick={signOut} type="button">Sign out</button>
              </div>
            </div>
          )}

          {authMessage && <div className="notice compact">{authMessage}</div>}

          {session && (
            <div className="orders-list">
              <div className="orders-head">
                <span>Order history</span>
                <small>{ordersLoading ? "Loading…" : `${orders.length} total`}</small>
              </div>

              {!ordersLoading && orders.length === 0 && (
                <div className="empty-state">No orders are attached to this account yet.</div>
              )}

              {orders.map((order) => (
                <article className="order-card" key={order.id}>
                  <div className="order-top">
                    <div>
                      <small>{order.reference}</small>
                      <h3>{serviceName(order)}</h3>
                    </div>
                    <span className={`status status-${order.status.replace(/_/g, "-")}`}>{statusLabels[order.status]}</span>
                  </div>
                  <OrderProgress status={order.status} />
                  <dl className="order-meta">
                    <div><dt>Created</dt><dd>{formatDate(order.created_at)}</dd></div>
                    <div><dt>Amount</dt><dd>{order.amount_tnd != null ? `${order.amount_tnd} TND` : "On request"}</dd></div>
                    <div><dt>File</dt><dd>{order.file_path ? "Uploaded" : "None"}</dd></div>
                  </dl>
                  {order.status === "delivered" && order.result_checked && (
                    <button className="secondary" type="button" onClick={() => downloadResult(order.id)}>
                      Download checked result
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
