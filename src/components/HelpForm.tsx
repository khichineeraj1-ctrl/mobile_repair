"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Topic = { id: string; label: string; hint: string };

// Raise a ticket, or reopen one you already have. No phone calls involved.
export default function HelpForm({ topics, bookingId = "" }: { topics: Topic[]; bookingId?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"new" | "find">("new");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [booking, setBooking] = useState(bookingId);
  const [website, setWebsite] = useState("");
  const [ticketNo, setTicketNo] = useState("");
  const [last4, setLast4] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send(url: string, body: object) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      router.push(data.url);
    } catch (err) {
      setError(err instanceof TypeError ? "No connection. Check your internet and try again." : (err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="card helpform" id="ticket">
      <div className="seg kind-tabs two" role="tablist">
        <button type="button" role="tab" aria-selected={mode === "new"} className={mode === "new" ? "on" : ""} onClick={() => (setMode("new"), setError(""))}>
          Raise a ticket
        </button>
        <button type="button" role="tab" aria-selected={mode === "find"} className={mode === "find" ? "on" : ""} onClick={() => (setMode("find"), setError(""))}>
          Check my ticket
        </button>
      </div>

      {mode === "new" ? (
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!topic) return setError("Please choose what you need help with.");
            send("/api/tickets", { topic, message, name, phone, bookingId: booking, website });
          }}
        >
          <div className="field">
            <span>What do you need help with?</span>
            <div className="topics">
              {topics.map((t) => (
                <button type="button" key={t.id} className={`topic ${t.id === topic ? "on" : ""}`} aria-pressed={t.id === topic} onClick={() => setTopic(t.id)}>
                  <b>{t.label}</b>
                  <small>{t.hint}</small>
                </button>
              ))}
            </div>
          </div>
          <label className="field">
            <span>Tell us what happened</span>
            <textarea rows={4} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="For example: the touch stops working near the top of the screen." required />
          </label>
          <label className="field">
            <span>Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" required />
          </label>
          <label className="field">
            <span>Mobile number used for the booking</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel-national" placeholder="10 digits" required />
          </label>
          <label className="field">
            <span>Booking reference, if you have one</span>
            <input value={booking} onChange={(e) => setBooking(e.target.value.toUpperCase().slice(0, 12))} placeholder="SS-XXXXXX" />
          </label>
          <input className="sr" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} name="website" />
          {error && (
            <p className="callout warn" role="alert">
              {error}
            </p>
          )}
          <button className="btn wide" type="submit" disabled={busy}>
            {busy ? "Sending…" : "Get my ticket number"}
          </button>
          <small className="muted">We reply in writing on your ticket page. Nobody will call you.</small>
        </form>
      ) : (
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            send("/api/tickets/find", { id: ticketNo, last4 });
          }}
        >
          <label className="field">
            <span>Ticket number</span>
            <input value={ticketNo} onChange={(e) => setTicketNo(e.target.value.toUpperCase().slice(0, 12))} placeholder="HT-XXXXXX" required />
          </label>
          <label className="field">
            <span>Last 4 digits of your mobile number</span>
            <input value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="4 digits" required />
          </label>
          {error && (
            <p className="callout warn" role="alert">
              {error}
            </p>
          )}
          <button className="btn wide" type="submit" disabled={busy || last4.length !== 4}>
            {busy ? "Looking…" : "Open my ticket"}
          </button>
        </form>
      )}
    </div>
  );
}
