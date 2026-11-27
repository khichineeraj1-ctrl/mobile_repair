"use client";

import { useState } from "react";
import { ticketReply } from "@/app/admin/actions";

// Reply box for a ticket, with saved replies that fill the box so the same
// answers are not typed again and again.
export default function AdminTicketReply({ id, saved, resolved }: { id: string; saved: { label: string; text: string }[]; resolved: boolean }) {
  const [text, setText] = useState("");
  return (
    <form
      action={async (fd) => {
        await ticketReply(fd);
        setText("");
      }}
      className="adm-reply"
    >
      <input type="hidden" name="id" value={id} />
      <div className="adm-tags">
        {saved.map((s) => (
          <button type="button" key={s.label} onClick={() => setText(s.text)}>
            {s.label}
          </button>
        ))}
      </div>
      <textarea className="adm-input" name="text" rows={5} maxLength={1500} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your reply. The customer reads it on their ticket page." required />
      <div className="adm-actions">
        <button className="adm-btn" type="submit" name="resolve" value="1">
          Reply and resolve
        </button>
        <button className="adm-btn ghost" type="submit">
          {resolved ? "Reply and keep closed" : "Reply, keep open"}
        </button>
      </div>
    </form>
  );
}
