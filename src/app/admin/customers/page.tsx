import { adminGate, dayLabel, type AdminParams } from "@/lib/admin";
import { board, sum } from "@/lib/adminview";
import { inr } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customers · Admin" };

export default async function Page({ searchParams }: { searchParams: AdminParams }) {
  const { s } = await adminGate(searchParams);
  const q = (s.q ?? "").trim().toLowerCase().slice(0, 60);
  const rows = await board();

  // One customer per phone number.
  const all = [...new Set(rows.map((x) => x.b.phone))].map((phone) => {
    const mine = rows.filter((x) => x.b.phone === phone); // newest first
    const scores = mine.map((x) => x.score).filter((n): n is number => typeof n === "number");
    return {
      phone,
      name: mine[0].b.name,
      city: mine[0].b.city,
      count: mine.length,
      spent: sum(mine.map((x) => x.b.finalPrice ?? 0)),
      last: mine[0].b,
      devices: [...new Set(mine.map((x) => x.b.modelName))],
      avg: scores.length ? sum(scores) / scores.length : null,
      flagged: mine.some((x) => x.flagged),
    };
  });
  const list = all.filter((c) => !q || [c.name, c.phone, c.city].some((v) => v.toLowerCase().includes(q)));
  const repeat = all.filter((c) => c.count > 1).length;

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Customers</h1>
          <p>Everyone who has booked, grouped by phone number.</p>
        </div>
        <form className="adm-search" action="/admin/customers">
          <input className="adm-input" type="search" name="q" defaultValue={q} placeholder="Search name, phone, city…" aria-label="Search customers" />
        </form>
      </header>

      <div className="adm-stats">
        <div className="adm-stat">
          <small>Customers</small>
          <b>{all.length}</b>
          <span>{new Set(all.map((c) => c.city)).size} cities</span>
        </div>
        <div className="adm-stat">
          <small>Repeat customers</small>
          <b>{repeat}</b>
          <span>booked more than once</span>
        </div>
        <div className="adm-stat">
          <small>Average spend</small>
          <b>{all.some((c) => c.spent) ? inr(Math.round(sum(all.map((c) => c.spent)) / all.filter((c) => c.spent).length)) : "–"}</b>
          <span>per paying customer</span>
        </div>
      </div>

      <div className="adm-table cu">
        <div className="adm-th">
          <span>Customer</span>
          <span>City</span>
          <span>Bookings</span>
          <span>Spent</span>
          <span>Devices</span>
          <span>Last visit</span>
          <span>Rating given</span>
          <span>Contact</span>
        </div>
        {list.length === 0 && <div className="adm-empty">{all.length ? "No customer matches that search." : "No customers yet."}</div>}
        {list.map((c) => (
          <div key={c.phone} className={`adm-row adm-cells ${c.flagged ? "alert" : ""}`}>
            <span data-l="Customer">
              <b>{c.name}</b>
              <small>+91 {c.phone}</small>
            </span>
            <span data-l="City">{c.city}</span>
            <span data-l="Bookings" className="adm-n">
              {c.count}
            </span>
            <span data-l="Spent" className="adm-n">
              {c.spent ? inr(c.spent) : "–"}
            </span>
            <span data-l="Devices">{c.devices.join(", ")}</span>
            <span data-l="Last visit">
              <a href={`/admin/bookings/${c.last.id}`}>{dayLabel(c.last.day)}</a>
            </span>
            <span data-l="Rating given" className="adm-stars">
              {c.avg ? `${c.avg.toFixed(1)} ★` : "–"}
            </span>
            <span data-l="Contact" className="adm-actions">
              <a className="adm-btn ghost" href={`https://wa.me/91${c.phone}`} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
              <a className="adm-btn ghost" href={`tel:+91${c.phone}`}>
                Call
              </a>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
