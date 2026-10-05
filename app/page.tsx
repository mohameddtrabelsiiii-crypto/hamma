'use client';

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Service = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_tnd: number | null;
};

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brief, setBrief] = useState("");
  const [status, setStatus] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(true);

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

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return setStatus("Choose a service first.");

    setStatus("Creating your order…");
    setReference("");

    const { data, error } = await supabase.rpc("create_order", {
      p_service_id: selected.id,
      p_customer_name: name,
      p_customer_email: email,
      p_brief: brief || null,
      p_file_path: null,
      p_amount_tnd: selected.price_tnd,
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    const row = Array.isArray(data) ? data[0] : data;
    setReference(row?.reference ?? "");
    setStatus("Order created. Keep your TF reference and follow the payment instructions.");
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <span className="eyebrow">TASKFORGE AI</span>
          <h1>Fast AI-powered business services.</h1>
          <p>Send a brief, get a checked result, and keep your TF reference for payment and delivery.</p>
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
                {service.price_tnd != null && <strong>{service.price_tnd} TND</strong>}
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
          <p>Your details are used only to process this order.</p>
        </div>

        <form onSubmit={submitOrder} className="form">
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" />
          <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Brief / instructions" rows={5} />
          <button className="primary" disabled={!selected}>
            Create order
          </button>
        </form>

        {status && <div className="notice">{status}</div>}
        {reference && <div className="reference">TF reference: <strong>{reference}</strong></div>}
      </section>
    </main>
  );
}
