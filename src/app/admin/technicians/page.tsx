import Link from "next/link";
import { technicianAdd, technicianPause } from "../actions";
import { adminGate, type AdminParams } from "@/lib/admin";
import { board } from "@/lib/adminview";
import { SLOT_IDS } from "@/lib/bookings";
import { CITIES } from "@/lib/data";
import { liveTechnicians } from "@/lib/ratings";
import { DEMO_TECHNICIANS, initials } from "@/lib/technicians";

export const dynamic = "force-dynamic";
export const metadata = { title: "Technicians · Admin" };

export default async function Page({ searchParams }: { searchParams: AdminParams }) {
  const { s, link } = await adminGate(searchParams);
  const city = CITIES.find((c) => c.slug === s.city);
  const rows = await board();

  // Same ranking the customer sees, city by city. Paused technicians are
  // listed here but hidden from customers.
  const ranked = (
    await Promise.all(
      CITIES.map(async (c) => {
        let pos = 0;
        return (await liveTechnicians(c.slug, undefined, undefined, 99, true)).map((t) => ({ ...t, cityName: c.name, pos: t.paused ? 0 : ++pos }));
      })
    )
  ).flat();
  const shown = city ? ranked.filter((t) => t.city === city.slug) : ranked;
  const rated = ranked.filter((t) => t.rating);
  const flagsOf = (id: string) => rows.filter((x) => x.b.technicianId === id && x.flagged).length;

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Technicians</h1>
          <p>Ranked the way customers see them: by rating, city by city.</p>
        </div>
      </header>

      {DEMO_TECHNICIANS && (
        <p className="adm-note">
          The profiles not marked “Onboarded” are samples with invented names, ratings and job counts. Pause them as real technicians join.
        </p>
      )}

      <div className="adm-stats">
        <div className="adm-stat">
          <small>Technicians</small>
          <b>{ranked.length}</b>
          <span>{ranked.filter((t) => t.added).length} onboarded here</span>
        </div>
        <div className="adm-stat">
          <small>Taking bookings</small>
          <b>{ranked.filter((t) => !t.paused).length}</b>
          <span>{ranked.filter((t) => t.paused).length} paused</span>
        </div>
        <div className="adm-stat">
          <small>Average rating</small>
          <b>{rated.length ? (rated.reduce((n, t) => n + (t.rating ?? 0), 0) / rated.length).toFixed(1) : "–"}</b>
          <span>{ranked.length - rated.length} not rated yet</span>
        </div>
        <div className={`adm-stat ${ranked.some((t) => flagsOf(t.id)) ? "bad" : ""}`}>
          <small>Flagged</small>
          <b>{ranked.filter((t) => flagsOf(t.id)).length}</b>
          <span>direct payment or a problem</span>
        </div>
      </div>

      <details className="adm-card adm-add">
        <summary>+ Add a technician</summary>
        <form action={technicianAdd} className="adm-form">
          <label>
            Name shown to customers
            <input className="adm-input" name="name" placeholder="Ravi K." maxLength={40} required />
          </label>
          <label>
            City
            <select className="adm-input" name="city" defaultValue={city?.slug}>
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Years of experience
            <input className="adm-input" name="years" type="number" min="0" max="60" defaultValue={3} required />
          </label>
          <label>
            Languages, comma separated
            <input className="adm-input" name="langs" placeholder="Hindi, English" maxLength={80} />
          </label>
          <fieldset>
            <legend>Works in</legend>
            {SLOT_IDS.map((sl) => (
              <label key={sl} className="adm-check">
                <input type="checkbox" name={`slot-${sl}`} defaultChecked /> {sl[0].toUpperCase() + sl.slice(1)}
              </label>
            ))}
          </fieldset>
          <button className="adm-btn" type="submit">
            Add technician
          </button>
        </form>
      </details>

      <div className="adm-tabs">
        <Link href={link("/admin/technicians")} className={city ? "" : "on"}>
          All cities
        </Link>
        {CITIES.map((c) => (
          <Link key={c.slug} href={link("/admin/technicians", { city: c.slug })} className={city?.slug === c.slug ? "on" : ""}>
            {c.name}
          </Link>
        ))}
      </div>

      <div className="adm-table tc">
        <div className="adm-th">
          <span>Rank</span>
          <span>Technician</span>
          <span>City</span>
          <span>Experience</span>
          <span>Rating</span>
          <span>Repairs</span>
          <span>Bookings here</span>
          <span>Status</span>
        </div>
        {shown.map((t) => {
          const n = flagsOf(t.id);
          return (
            <div key={t.id} className={`adm-row adm-cells ${n ? "alert" : ""} ${t.paused ? "off" : ""}`}>
              <span data-l="Rank">
                <em className={`adm-rank ${t.pos === 1 ? "first" : ""}`}>{t.pos ? `#${t.pos}` : "–"}</em>
              </span>
              <span data-l="Technician" className="adm-person">
                <i style={{ background: `hsl(${t.hue} 55% 42%)` }}>{initials(t.name)}</i>
                <span>
                  <b>{t.name}</b>
                  <small>
                    {t.langs.join(", ")}
                    {t.added ? " · Onboarded" : ""}
                  </small>
                </span>
              </span>
              <span data-l="City">{t.cityName}</span>
              <span data-l="Experience">{t.years} years</span>
              <span data-l="Rating" className="adm-stars">
                {t.rating ? `${t.rating.toFixed(1)} ★` : <em className="adm-badge upcoming">New</em>}
              </span>
              <span data-l="Repairs" className="adm-n">
                {t.jobs}
              </span>
              <span data-l="Bookings here" className="adm-n">
                {rows.filter((x) => x.b.technicianId === t.id).length}
                {n ? <em className="adm-badge flagged">{n} flagged</em> : null}
              </span>
              <span data-l="Status">
                <form action={technicianPause} className="adm-actions">
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="paused" value={t.paused ? "0" : "1"} />
                  <em className={`adm-badge ${t.paused ? "cancelled" : "completed"}`}>{t.paused ? "Paused" : "Active"}</em>
                  <button className="adm-btn ghost" type="submit">
                    {t.paused ? "Resume" : "Pause"}
                  </button>
                </form>
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
