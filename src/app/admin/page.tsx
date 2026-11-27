import Link from "next/link";
import { adminGate, dayLabel, isoDay, when } from "@/lib/admin";
import { PAYOUT_PER_JOB, board, needsAction, sum } from "@/lib/adminview";
import { BOOKING_STATUS } from "@/lib/bookings";
import { inr } from "@/lib/data";
import { listPartners } from "@/lib/partners";
import { listTickets } from "@/lib/tickets";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard · Admin" };

export default async function Page() {
  await adminGate();
  const [rows, apps, tickets] = await Promise.all([board(), listPartners(), listTickets()]);
  const openTickets = tickets.filter((t) => t.status === "open");
  const now = new Date();
  const today = isoDay(now);
  const tomorrow = isoDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));

  const live = rows.filter((x) => x.b.status !== "cancelled");
  const soon = live.filter((x) => x.b.day === today || x.b.day === tomorrow).sort((a, b) => a.b.day.localeCompare(b.b.day));
  const action = rows.filter(needsAction);
  const paid = rows.filter((x) => x.b.paidAt);
  const month = paid.filter((x) => new Date(x.b.paidAt!).getMonth() === now.getMonth() && new Date(x.b.paidAt!).getFullYear() === now.getFullYear());
  const scores = rows.map((x) => x.score).filter((n): n is number => typeof n === "number");

  const days = [...Array(7)].map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + i);
    return { label: d.toLocaleDateString("en-IN", { weekday: "short" }), n: rows.filter((x) => isoDay(new Date(x.b.createdAt)) === isoDay(d)).length };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.n));
  const cities = [...new Set(rows.map((x) => x.b.city))].map((c) => ({ c, n: rows.filter((x) => x.b.city === c).length })).sort((a, b) => b.n - a.n);
  const maxCity = Math.max(1, ...cities.map((c) => c.n));

  const why = (x: (typeof rows)[number]) =>
    x.flagged ? "Flagged" : x.b.status === "new" ? "Confirm with technician" : x.b.status === "completed" && !x.b.paidAt ? "Payment not recorded" : "Send next-day message";

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Dashboard</h1>
          <p>{now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <Link className="adm-btn" href="/admin/bookings">
          All bookings
        </Link>
      </header>

      <div className="adm-stats">
        <div className="adm-stat">
          <small>Visits today</small>
          <b>{live.filter((x) => x.b.day === today).length}</b>
          <span>
            {rows.filter((x) => x.b.status === "started").length} in progress now · {live.filter((x) => x.b.day === tomorrow).length} tomorrow
          </span>
        </div>
        <div className={`adm-stat ${action.length ? "warn" : ""}`}>
          <small>Needs action</small>
          <b>{action.length}</b>
          <span>{rows.filter((x) => x.b.status === "new").length} to confirm</span>
        </div>
        <div className="adm-stat">
          <small>Collected this month</small>
          <b>{inr(sum(month.map((x) => x.b.finalPrice ?? 0)))}</b>
          <span>
            {month.length} paid job{month.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="adm-stat">
          <small>Payouts due</small>
          <b>{inr(rows.filter((x) => x.payoutDue).length * PAYOUT_PER_JOB)}</b>
          <span>to technicians</span>
        </div>
        <div className={`adm-stat ${rows.some((x) => x.flagged) ? "bad" : ""}`}>
          <small>Flagged</small>
          <b>{rows.filter((x) => x.flagged).length}</b>
          <span>direct payment or a problem</span>
        </div>
        <Link href="/admin/support" className={`adm-stat ${openTickets.length ? "warn" : ""}`}>
          <small>Support tickets</small>
          <b>{openTickets.length}</b>
          <span>{openTickets.filter((t) => t.urgent).length} urgent · waiting for a reply</span>
        </Link>
        <div className="adm-stat">
          <small>Average rating</small>
          <b>{scores.length ? (sum(scores) / scores.length).toFixed(1) : "–"}</b>
          <span>{apps.filter((a) => a.status === "new").length} new applications</span>
        </div>
      </div>

      <div className="adm-grid2">
        <section className="adm-card">
          <h2>Needs action</h2>
          {action.length === 0 && <p className="adm-quiet">Nothing waiting. </p>}
          <ul className="adm-list">
            {action.slice(0, 8).map((x) => (
              <li key={x.b.id}>
                <Link href={`/admin/bookings/${x.b.id}`}>
                  <span>
                    <b>{x.b.name}</b>
                    <small>
                      {x.b.modelName} · {x.b.city}
                    </small>
                  </span>
                  <em className={`adm-badge ${x.flagged ? "flagged" : "due"}`}>{why(x)}</em>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="adm-card">
          <h2>Visits today and tomorrow</h2>
          {soon.length === 0 && <p className="adm-quiet">No visits scheduled.</p>}
          <ul className="adm-list">
            {soon.map((x) => (
              <li key={x.b.id}>
                <Link href={`/admin/bookings/${x.b.id}`}>
                  <span>
                    <b>
                      {dayLabel(x.b.day)} · {x.b.slot}
                    </b>
                    <small>
                      {x.b.name} · {x.b.modelName} · {x.b.technicianName}
                    </small>
                  </span>
                  <em className={`adm-badge ${x.b.status}`}>{BOOKING_STATUS[x.b.status]}</em>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="adm-card">
          <h2>Bookings, last 7 days</h2>
          <div className="adm-bars">
            {days.map((d, i) => (
              <div key={i}>
                <b>{d.n || ""}</b>
                <i style={{ height: `${(d.n / maxDay) * 100}%` }} />
                <small>{d.label}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="adm-card">
          <h2>Bookings by city</h2>
          {cities.length === 0 && <p className="adm-quiet">No bookings yet.</p>}
          <div className="adm-hbars">
            {cities.map((c) => (
              <div key={c.c}>
                <span>{c.c}</span>
                <i>
                  <u style={{ width: `${(c.n / maxCity) * 100}%` }} />
                </i>
                <b>{c.n}</b>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="adm-card adm-gap">
        <h2>Latest activity</h2>
        <ul className="adm-timeline">
          {rows
            .flatMap((x) => (x.b.history ?? []).map((h) => ({ ...h, id: x.b.id, name: x.b.name })))
            .concat(rows.map((x) => ({ at: x.b.createdAt, text: "Booking received", id: x.b.id, name: x.b.name })))
            .sort((a, b) => b.at.localeCompare(a.at))
            .slice(0, 8)
            .map((h, i) => (
              <li key={i}>
                <small>{when(h.at)}</small>
                <span>
                  <Link href={`/admin/bookings/${h.id}`}>{h.id}</Link> · {h.name} — {h.text}
                </span>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
