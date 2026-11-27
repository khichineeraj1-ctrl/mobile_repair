import Link from "next/link";
import { adminGate, dayLabel, when, type AdminParams } from "@/lib/admin";
import { board, needsAction, sum, type Row } from "@/lib/adminview";
import { BOOKING_STATUS } from "@/lib/bookings";
import { inr } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookings · Admin" };

const VIEWS: { id: string; label: string; test: (x: Row) => boolean }[] = [
  { id: "all", label: "All", test: () => true },
  { id: "action", label: "Needs action", test: needsAction },
  { id: "new", label: "New", test: (x) => x.b.status === "new" },
  { id: "confirmed", label: "Confirmed", test: (x) => x.b.status === "confirmed" },
  { id: "started", label: "In progress", test: (x) => x.b.status === "started" },
  { id: "completed", label: "Completed", test: (x) => x.b.status === "completed" },
  { id: "cancelled", label: "Cancelled", test: (x) => x.b.status === "cancelled" },
];

export default async function Page({ searchParams }: { searchParams: AdminParams }) {
  const { s, link } = await adminGate(searchParams);
  const view = VIEWS.find((v) => v.id === s.view) ?? VIEWS[0];
  const q = (s.q ?? "").trim().toLowerCase().slice(0, 60);

  const rows = await board();
  const match = (x: Row) =>
    !q || [x.b.id, x.b.name, x.b.phone, x.b.city, x.b.pincode, x.b.modelName, x.b.technicianName].some((v) => v.toLowerCase().includes(q));
  const shown = rows.filter((x) => view.test(x) && match(x));
  const paid = rows.filter((x) => x.b.paidAt);

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Bookings</h1>
          <p>Every doorstep repair request, newest first. Open one to manage it.</p>
        </div>
        <div className="adm-actions">
          <a className="adm-btn ghost" href="/admin/bookings/export">
            Export CSV
          </a>
          <Link className="adm-btn" href="/book" target="_blank">
            + New booking
          </Link>
        </div>
      </header>

      <div className="adm-stats">
        <div className="adm-stat">
          <small>Bookings</small>
          <b>{rows.length}</b>
          <span>{rows.filter((x) => x.b.status === "cancelled").length} cancelled</span>
        </div>
        <div className={`adm-stat ${rows.some((x) => x.b.status === "new") ? "warn" : ""}`}>
          <small>To confirm</small>
          <b>{rows.filter((x) => x.b.status === "new").length}</b>
          <span>call the technician</span>
        </div>
        <div className="adm-stat">
          <small>Collected</small>
          <b>{inr(sum(paid.map((x) => x.b.finalPrice ?? 0)))}</b>
          <span>
            {paid.length} paid job{paid.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className={`adm-stat ${rows.some((x) => x.followDue) ? "warn" : ""}`}>
          <small>Follow-ups due</small>
          <b>{rows.filter((x) => x.followDue).length}</b>
          <span>next-day message to send</span>
        </div>
        <div className={`adm-stat ${rows.some((x) => x.flagged) ? "bad" : ""}`}>
          <small>Flagged</small>
          <b>{rows.filter((x) => x.flagged).length}</b>
          <span>direct payment or a problem</span>
        </div>
      </div>

      <div className="adm-bar">
        <div className="adm-tabs">
          {VIEWS.map((v) => (
            <Link key={v.id} href={link("/admin/bookings", { view: v.id === "all" ? undefined : v.id, q: q || undefined })} className={view.id === v.id ? "on" : ""}>
              {v.label} <i>{rows.filter((x) => v.test(x) && match(x)).length}</i>
            </Link>
          ))}
        </div>
        <form className="adm-search" action="/admin/bookings">
          {view.id !== "all" && <input type="hidden" name="view" value={view.id} />}
          <input className="adm-input" type="search" name="q" defaultValue={q} placeholder="Search name, phone, ID, city…" aria-label="Search bookings" />
        </form>
      </div>

      <div className="adm-table bk">
        <div className="adm-th">
          <span>Booking</span>
          <span>Customer</span>
          <span>Repair</span>
          <span>Amount</span>
          <span>Visit</span>
          <span>Technician</span>
          <span>Rating</span>
          <span>Status</span>
        </div>
        {shown.length === 0 && (
          <div className="adm-empty">{rows.length === 0 ? "No bookings yet. Make one from the Book page and it will appear here." : "Nothing matches this view."}</div>
        )}
        {shown.map(({ b, r, f, flagged, followDue, score }) => (
          <Link key={b.id} href={`/admin/bookings/${b.id}`} className={`adm-row adm-cells ${flagged ? "alert" : ""}`}>
            <span data-l="Booking">
              <b>{b.id}</b>
              <small>{when(b.createdAt)}</small>
            </span>
            <span data-l="Customer">
              <b>{b.name}</b>
              <small>
                {b.city} {b.pincode}
              </small>
            </span>
            <span data-l="Repair">
              <b>{b.modelName}</b>
              <small>
                {b.damage} · {b.tier}
              </small>
            </span>
            <span data-l="Amount" className="adm-n">
              {b.finalPrice ? inr(b.finalPrice) : `${inr(b.priceLo)}–${inr(b.priceHi)}`}
              <small>{b.paidAt ? `paid · ${b.paidMethod}` : "quote"}</small>
            </span>
            <span data-l="Visit">
              <b>{dayLabel(b.day)}</b>
              <small>{b.slot}</small>
            </span>
            <span data-l="Technician">{b.technicianName}</span>
            <span data-l="Rating" className="adm-stars">
              {score ? `${score}.0 ★` : "–"}
              {score ? <small>{f ? "next day" : r ? "at the door" : ""}</small> : null}
            </span>
            <span data-l="Status" className="adm-badges">
              <em className={`adm-badge ${b.status}`}>{BOOKING_STATUS[b.status]}</em>
              {flagged && <em className="adm-badge flagged">Flagged</em>}
              {followDue && <em className="adm-badge due">Follow-up due</em>}
              {b.customerMoves && b.status === "new" ? <em className="adm-badge started">Rescheduled</em> : null}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
