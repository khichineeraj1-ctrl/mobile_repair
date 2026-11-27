import Link from "next/link";
import { notFound } from "next/navigation";
import AutoRefresh from "@/components/AutoRefresh";
import TicketReply from "@/components/TicketReply";
import { SITE } from "@/lib/data";
import { TICKET_STATUS_PUBLIC, getTicket, topicLabel } from "@/lib/tickets";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your support ticket", robots: { index: false, follow: false } };

const stamp = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

// The customer's private page for one ticket. Everything support does shows
// up here, so nobody needs to phone anybody.
export default async function Page({ params }: { params: Promise<{ id: string; key: string }> }) {
  const { id, key } = await params;
  const t = await getTicket(id);
  if (!t || t.key !== key) notFound();
  const step = t.status === "resolved" ? 3 : t.messages.some((m) => m.from === "support") ? 2 : 1;

  return (
    <main className="wrap page narrow ticketpage">
      <AutoRefresh seconds={15} />
      <small className="tag">Ticket {t.id}</small>
      <h1>{topicLabel(t.topic)}</h1>
      <p className="muted">
        Raised {stamp(t.createdAt)}
        {t.bookingId ? ` · booking ${t.bookingId}` : ""}
      </p>

      <div className={`card ticketstate ${t.status}`}>
        <b>{TICKET_STATUS_PUBLIC[t.status]}</b>
        <span>
          {t.status === "resolved"
            ? `Closed ${t.resolvedAt ? stamp(t.resolvedAt) : ""}. If it is still not right, write back below.`
            : t.status === "answered"
              ? "Read our reply below. Tell us if it solved the problem."
              : "We reply on this page. Keep your ticket number to come back to it."}
        </span>
        <ol className="ticketbar" aria-hidden="true">
          <li className="done">Raised</li>
          <li className={step >= 2 ? "done" : ""}>Replied</li>
          <li className={step >= 3 ? "done" : ""}>Resolved</li>
        </ol>
      </div>

      <ol className="thread">
        {t.messages.map((m, i) => (
          <li key={i} className={m.from}>
            <small>
              {m.from === "customer" ? "You" : m.from === "support" ? `${SITE.name} support` : "Automatic update"} · {stamp(m.at)}
            </small>
            <p>{m.text}</p>
          </li>
        ))}
      </ol>

      <div className="card">
        <TicketReply id={t.id} ticketKey={key} canSolve={t.status === "answered"} resolved={t.status === "resolved"} />
      </div>
      <p className="muted small ticketnote">
        To come back later, open <Link href="/help#ticket">Help</Link>, choose “Check my ticket” and enter {t.id} with the last 4 digits of your mobile number.
      </p>
    </main>
  );
}
