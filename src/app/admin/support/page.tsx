import Link from "next/link";
import { adminGate, when, type AdminParams } from "@/lib/admin";
import { TICKET_STATUS, listTickets, topicLabel, type Ticket } from "@/lib/tickets";

export const dynamic = "force-dynamic";
export const metadata = { title: "Support · Admin" };

const VIEWS: { id: string; label: string; test: (t: Ticket) => boolean }[] = [
  { id: "open", label: "Needs a reply", test: (t) => t.status === "open" },
  { id: "answered", label: "Waiting for customer", test: (t) => t.status === "answered" },
  { id: "resolved", label: "Resolved", test: (t) => t.status === "resolved" },
  { id: "all", label: "All", test: () => true },
];
const BADGE = { open: "new", answered: "due", resolved: "completed" };

export default async function Page({ searchParams }: { searchParams: AdminParams }) {
  const { s, link } = await adminGate(searchParams);
  const view = VIEWS.find((v) => v.id === s.view) ?? VIEWS[0];
  const q = (s.q ?? "").trim().toLowerCase().slice(0, 60);
  const all = await listTickets();
  const match = (t: Ticket) => !q || [t.id, t.name, t.phone, t.bookingId].some((v) => v.toLowerCase().includes(q));
  // Urgent first, then the ones waiting longest.
  const shown = all
    .filter((t) => view.test(t) && match(t))
    .sort((a, b) => Number(b.urgent) - Number(a.urgent) || (view.id === "open" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)));
  const closed = all.filter((t) => t.resolvedAt);
  const hours = closed.length ? closed.reduce((n, t) => n + (new Date(t.resolvedAt!).getTime() - new Date(t.createdAt).getTime()), 0) / closed.length / 36e5 : null;

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Support</h1>
          <p>Tickets customers raised from the Help page. Everything is answered in writing; the customer reads replies on their ticket page.</p>
        </div>
        <Link className="adm-btn" href="/help" target="_blank">
          Open Help page ↗
        </Link>
      </header>

      <div className="adm-stats">
        <div className={`adm-stat ${all.some((t) => t.status === "open") ? "warn" : ""}`}>
          <small>Needs a reply</small>
          <b>{all.filter((t) => t.status === "open").length}</b>
          <span>customer is waiting</span>
        </div>
        <div className={`adm-stat ${all.some((t) => t.status === "open" && t.urgent) ? "bad" : ""}`}>
          <small>Urgent</small>
          <b>{all.filter((t) => t.status !== "resolved" && t.urgent).length}</b>
          <span>warranty or technician</span>
        </div>
        <div className="adm-stat">
          <small>Waiting for customer</small>
          <b>{all.filter((t) => t.status === "answered").length}</b>
          <span>we replied</span>
        </div>
        <div className="adm-stat">
          <small>Resolved</small>
          <b>{all.filter((t) => t.status === "resolved").length}</b>
          <span>{hours === null ? "no closed tickets yet" : `average ${hours < 1 ? "under 1 hour" : `${hours.toFixed(1)} hours`} to close`}</span>
        </div>
      </div>

      <div className="adm-bar">
        <div className="adm-tabs">
          {VIEWS.map((v) => (
            <Link key={v.id} href={link("/admin/support", { view: v.id === "open" ? undefined : v.id, q: q || undefined })} className={view.id === v.id ? "on" : ""}>
              {v.label} <i>{all.filter((t) => v.test(t) && match(t)).length}</i>
            </Link>
          ))}
        </div>
        <form className="adm-search" action="/admin/support">
          {view.id !== "open" && <input type="hidden" name="view" value={view.id} />}
          <input className="adm-input" type="search" name="q" defaultValue={q} placeholder="Search ticket, name, phone, booking…" aria-label="Search tickets" />
        </form>
      </div>

      <div className="adm-table tk">
        <div className="adm-th">
          <span>Ticket</span>
          <span>Customer</span>
          <span>Topic</span>
          <span>Latest message</span>
          <span>Booking</span>
          <span>Status</span>
        </div>
        {shown.length === 0 && <div className="adm-empty">{all.length === 0 ? "No tickets yet. They appear here when a customer raises one from the Help page." : "Nothing in this view."}</div>}
        {shown.map((t) => {
          const last = [...t.messages].reverse().find((m) => m.from !== "system") ?? t.messages[0];
          return (
            <Link key={t.id} href={`/admin/support/${t.id}`} className={`adm-row adm-cells ${t.urgent && t.status !== "resolved" ? "alert" : ""}`}>
              <span data-l="Ticket">
                <b>{t.id}</b>
                <small>{when(t.createdAt)}</small>
              </span>
              <span data-l="Customer">
                <b>{t.name}</b>
                <small>+91 {t.phone}</small>
              </span>
              <span data-l="Topic">{topicLabel(t.topic)}</span>
              <span data-l="Latest message" className="adm-clip">
                <small>{last.from === "customer" ? "Customer" : "Support"}:</small> {last.text}
              </span>
              <span data-l="Booking">{t.bookingId || "–"}</span>
              <span data-l="Status" className="adm-badges">
                <em className={`adm-badge ${BADGE[t.status]}`}>{TICKET_STATUS[t.status]}</em>
                {t.urgent && t.status !== "resolved" && <em className="adm-badge flagged">Urgent</em>}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
