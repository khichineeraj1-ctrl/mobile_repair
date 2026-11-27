"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// The customer's side of a ticket: write back, or confirm it is solved.
export default function TicketReply({ id, ticketKey, canSolve, resolved }: { id: string; ticketKey: string; canSolve: boolean; resolved: boolean }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function post(body: object) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/tickets/reply", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, key: ticketKey, ...body }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setText("");
      router.refresh();
    } catch (err) {
      setError(err instanceof TypeError ? "No connection. Check your internet and try again." : (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="form ticketreply"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim().length >= 2) post({ text });
      }}
    >
      <label className="field">
        <span>{resolved ? "Still not right? Write back and the ticket reopens." : "Add a message"}</span>
        <textarea rows={3} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type here…" />
      </label>
      {error && (
        <p className="callout warn" role="alert">
          {error}
        </p>
      )}
      <div className="cta-row">
        <button className="btn" type="submit" disabled={busy || text.trim().length < 2}>
          {busy ? "Sending…" : resolved ? "Reopen ticket" : "Send"}
        </button>
        {canSolve && (
          <button className="btn ghost" type="button" disabled={busy} onClick={() => post({ solved: true })}>
            This solved it
          </button>
        )}
      </div>
    </form>
  );
}
