'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Service = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_tnd: number | null;
};

type OrderResponse = {
  order?: { reference?: string; amount_tnd?: number | null };
  payment_link?: string | null;
  error?: string;
  message?: string;
};

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brief, setBrief] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [reference, setReference] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadServices() {
      const { data, error } = await supabase
        .from("services")
        .select("id,slug,name,description,price_tnd")
        .eq("active", true)
        .order("sort_order");

      if (error) setStatus("Unable to load services right now.");
      else setServices(data ?? []);
      setLoading(false);
    }
    loadServices();
  }, []);

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

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) {
      setStatus("Choose a service first.");
      return;
    }

    setSubmitting(true);
    setStatus("Creating your order…");
    setReference("");
    setPaymentLink("");

    const form = new FormData();
    form.append("service_slug", selected.slug);
    form.append("customer_name", name);
    form.append("customer_email", email);
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
    setSubmitting(false);
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <span className="eyebrow">TASKFORGE AI</span>
          <h1>Fast AI-powered business services.</h1>
          <p>Send your brief and file, receive a checked result, and keep your TF reference for payment and delivery.</p>
        </div>
        <div className="status-pill">● Online</div>
      </header>

      <section className="services">
        <div className="section-head">
          <h2>Choose a service</h2>
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
            </button>
          ))}
        </div>
      </section>

      <section className="order-panel">
        <div>
          <span className="eyebrow">NEW ORDER</span>
          <h2>{selected ? selected.name : "Tell us what you need"}</h2>
          <p>Your details and uploaded file are used to process this order.</p>
        </div>

        <form onSubmit={submitOrder} className="form">
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" />
          <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Brief / instructions" rows={5} />

          <label className="file-field">
            <span>Upload a source file <small>(optional, max 15 MB)</small></span>
            <input type="file" onChange={handleFile} accept=".pdf,.xlsx,.xls,.csv,.docx,.txt,.rtf" />
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
      </section>
    </main>
  );
}
