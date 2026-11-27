"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DEVICE_TABS, defaultItem, findItem, groupsOf, itemsOf, priceOf, repairTime, repairsOf, tierInfo, type DeviceKind } from "@/lib/catalog";
import { cityByPin, getCity, range, type TierId } from "@/lib/data";
import { DEMO_TECHNICIANS, initials, techniciansFor, type Technician } from "@/lib/technicians";
import DeviceArt from "./DeviceArt";
import TierCards from "./TierCards";

type Props = { model?: string; damage?: string; tier?: string; city?: string; tech?: string };
type Day = { key: string; dow: string; day: number; mon: string };

const STEPS = ["Repair", "Address", "Time", "Expert", "Confirm"];
const SLOTS = [
  { id: "morning", label: "Morning", time: "9 am – 12 pm" },
  { id: "afternoon", label: "Afternoon", time: "12 – 4 pm" },
  { id: "evening", label: "Evening", time: "4 – 8 pm" },
];
const ASSURE = [
  { t: "You choose your specialist", s: "Ranked by ratings from customers after each repair.", d: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" },
  { t: "Repaired in front of you", s: "Your device never leaves your sight.", d: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
  { t: "Pay ScreenSahi after the repair", s: "Test everything first. Paying us activates your warranty.", d: "M3 7h18v12H3zM3 11h18M7 15h4" },
  { t: "Price fixed before the visit", s: "No surprise charges at your door.", d: "M3 12V4h8l10 10-8 8L3 12zm5-4h.01" },
  { t: "Warranty on every repair", s: "Up to 6 months, on part and fitting.", d: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zm-3 9l2 2 4-4" },
];

export default function BookingFlow(p: Props) {
  const presetItem = p.model ? findItem(p.model) : undefined;
  const start = presetItem ?? defaultItem("iphone");
  const [step, setStep] = useState(presetItem ? 1 : 0);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ref, setRef] = useState("");
  const [door, setDoor] = useState<{ code: string; track: string } | null>(null);

  const [kind, setKind] = useState<DeviceKind>(start.kind);
  const [slug, setSlug] = useState(start.slug);
  const [group, setGroup] = useState(start.group);
  const [damage, setDamage] = useState(repairsOf(start.kind).some((d) => d.id === p.damage) ? p.damage! : "display");
  const [tier, setTier] = useState<TierId>(p.tier === "budget" ? "budget" : "premium");

  const [pin, setPin] = useState("");
  const [address, setAddress] = useState("");
  const [days, setDays] = useState<Day[]>([]);
  const [day, setDay] = useState("");
  const [slot, setSlot] = useState("");
  const [techId, setTechId] = useState(p.tech ?? ""); // pre-chosen from the home page, if they are free
  const [liveTechs, setLiveTechs] = useState<{ key: string; list: Technician[] } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Dates are built in the browser so they follow the customer's clock.
  useEffect(() => {
    const now = new Date();
    const out: Day[] = [];
    for (let i = 1; i <= 6; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      out.push({
        key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
        dow: i === 1 ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short" }),
        day: d.getDate(),
        mon: d.toLocaleDateString("en-IN", { month: "short" }),
      });
    }
    setDays(out);
    setDay(out[0].key);
  }, []);

  const model = findItem(slug)!;
  const t = tierInfo(kind, tier);
  const repairLabel = repairsOf(kind).find((d) => d.id === damage)!.label;
  const pickKind = (k: DeviceKind) => {
    const it = defaultItem(k);
    setKind(k);
    setSlug(it.slug);
    setGroup(it.group);
    setDamage("display");
  };
  const pinCity = pin.length === 6 ? cityByPin(pin) : undefined;
  const city = pinCity ?? (p.city ? getCity(p.city) : undefined);
  const q = priceOf(slug, damage, tier, city)!;
  const dayObj = days.find((d) => d.key === day);
  const slotObj = SLOTS.find((s) => s.id === slot);
  const when = dayObj && slotObj ? `${dayObj.dow === "Tomorrow" ? "Tomorrow" : dayObj.dow}, ${dayObj.day} ${dayObj.mon} · ${slotObj.label}` : "";

  // Only technicians who cover this city and are free in the chosen slot.
  // Ordered by customer rating: the live order comes from the server, with a
  // built-in fallback so the step never shows empty while it loads.
  const techKey = pinCity && day && slot ? `${pinCity.slug}|${day}|${slot}` : "";
  useEffect(() => {
    if (!techKey) return;
    const [c, d, sl] = techKey.split("|");
    let live = true;
    fetch(`/api/technicians?city=${c}&day=${d}&slot=${sl}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => live && data?.technicians && setLiveTechs({ key: techKey, list: data.technicians }))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [techKey]);
  const techs = !techKey ? [] : liveTechs?.key === techKey ? liveTechs.list : techniciansFor(pinCity!.slug, day, slot);
  const tech = techs.find((x) => x.id === techId) ?? techs[0]; // best match is pre-selected
  const techFirst = tech?.name.split(" ")[0];

  const ok = [true, !!pinCity && address.trim().length >= 6, !!day && !!slot, !!tech, name.trim().length >= 2 && /^[6-9]\d{9}$/.test(phone)][step];

  const summary = (
    <div className="summary">
      <DeviceArt kind={kind} repair={damage} fixed={sent} />
      <div className="sum-body">
        <small className="tag">Your repair</small>
        <b>{model.name}</b>
        <span>
          {repairLabel} · {t.short} grade
        </span>
        <div className="sum-price">{range(q)}</div>
        <small className="sum-note">Pay after repair · {t.warranty} warranty</small>
        {(pinCity || when) && (
          <ul className="sum-rows">
            {pinCity && (
              <li>
                <small>Where</small>
                {address.trim() ? `${address.trim()}, ` : ""}
                {pinCity.name} {pin}
              </li>
            )}
            {when && (
              <li>
                <small>When</small>
                {when}
              </li>
            )}
            {tech && (sent || step >= 3) && (
              <li>
                <small>Technician</small>
                {tech.name}
                {tech.rating ? ` · ★ ${tech.rating.toFixed(1)}` : ""}
              </li>
            )}
          </ul>
        )}
      </div>
      {!sent && step > 0 && (
        <button className="sum-edit" onClick={() => setStep(0)}>
          Change
        </button>
      )}
    </div>
  );

  if (sent)
    return (
      <div className="book done-wrap">
        <div className="book-main">
          <div className="card success pop">
            <svg className="bigtick" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="29" />
              <path d="M19 33l9 9 17-19" />
            </svg>
            <h2>Visit requested, {name.trim().split(" ")[0]}</h2>
            <p className="muted">{when}</p>
            <p className="ref">
              Booking reference <b>{ref}</b>
            </p>
            {door && (
              <div className="doorcode">
                <small className="tag">Your start code</small>
                <div className="digits">
                  {door.code.split("").map((c, i) => (
                    <span key={i}>{c}</span>
                  ))}
                </div>
                <p>
                  Read this to {techFirst ?? "your technician"} at your door, before the repair starts. You get a second code to end the job once you have tested your
                  device.
                </p>
                <Link className="btn ghost btn-sm" href={door.track}>
                  Open your booking page
                </Link>
              </div>
            )}
            <ol className="next">
              <li className="done">
                <b>Request received</b>
                <span>Your repair, address and slot are saved.</span>
              </li>
              <li>
                <b>{techFirst ?? "Your technician"} is notified</b>
                <span>You’ll get the arrival window on WhatsApp at +91 {phone}.</span>
              </li>
              <li>
                <b>{techFirst ?? "Technician"} at your door</b>
                <span>With the {t.short.toLowerCase()}-grade part for your {model.name} in a sealed kit.</span>
              </li>
              <li>
                <b>Fixed in front of you</b>
                <span>Takes {repairTime(kind)}. Test everything, then pay ScreenSahi. Your warranty starts on payment.</span>
              </li>
              <li>
                <b>You rate {techFirst ?? "your technician"}</b>
                <span>Before they leave, on your own phone. We also check in privately the next day. Ratings decide who gets the next booking.</span>
              </li>
            </ol>
            <div className="cta-row">
              <Link className="btn" href="/">
                Back to home
              </Link>
            </div>
          </div>
        </div>
        <aside className="book-side">{summary}</aside>
      </div>
    );

  return (
    <div className="book">
      <div className="book-main">
        <ol className="stepper">
          {STEPS.map((s, i) => (
            <li key={s} className={i < step ? "done" : i === step ? "on" : ""}>
              <button disabled={i >= step} onClick={() => setStep(i)} aria-current={i === step ? "step" : undefined}>
                <i>{i < step ? "✓" : i + 1}</i>
                <span>{s}</span>
              </button>
            </li>
          ))}
        </ol>

        <form
          className="card bstep pop"
          key={step}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!ok || busy) return;
            setError("");
            if (step < 4) {
              setStep(step + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
              return;
            }
            setBusy(true);
            try {
              const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ model: slug, damage, tier, pincode: pin, address, day, slot, when, technician: tech?.id, name, phone }),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
              setRef(data.id);
              if (data.startCode && data.track) setDoor({ code: data.startCode, track: data.track });
              setSent(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            } catch (err) {
              setError(err instanceof TypeError ? "No connection. Check your internet and try again." : (err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {step === 0 && (
            <>
              <h2>What are we fixing?</h2>
              <p className="muted">Then you pick the time, and the specialist who comes.</p>
              <div className="seg kind-tabs" role="tablist" aria-label="Device">
                {DEVICE_TABS.map((d) => (
                  <button type="button" key={d.kind} className={d.kind === kind ? "on" : ""} onClick={() => pickKind(d.kind)} role="tab" aria-selected={d.kind === kind}>
                    {d.tab}
                  </button>
                ))}
              </div>
              <div className="rail">
                {groupsOf(kind).map((g) => (
                  <button
                    type="button"
                    key={g.id}
                    className={`chip ${g.id === group ? "on" : ""}`}
                    onClick={() => {
                      setGroup(g.id);
                      setSlug(itemsOf(kind).find((x) => x.group === g.id)!.slug);
                    }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              <div className="rail">
                {itemsOf(kind)
                  .filter((x) => x.group === group)
                  .map((x) => (
                    <button type="button" key={x.slug} className={`chip chip-model ${x.slug === slug ? "on" : ""}`} onClick={() => setSlug(x.slug)}>
                      {x.short}
                    </button>
                  ))}
              </div>
              <div className="dmg-grid">
                {repairsOf(kind).map((d) => (
                  <button type="button" key={d.id} className={`dmg ${d.id === damage ? "on" : ""}`} onClick={() => setDamage(d.id)} aria-pressed={d.id === damage}>
                    <DeviceArt kind={kind} repair={d.id} />
                    <b>{d.label}</b>
                    <small>{d.desc}</small>
                  </button>
                ))}
              </div>
              <h3>Choose your part grade</h3>
              <TierCards kind={kind} price={(x) => priceOf(slug, damage, x, city)!} tier={tier} onPick={setTier} />
            </>
          )}

          {step === 1 && (
            <>
              <h2>Where should we come?</h2>
              <p className="muted">Home, office, hostel, anywhere with a table and good light.</p>
              <label className="field">
                <span>Pincode</span>
                <div className={`pinbox ${pin.length === 6 ? (pinCity ? "ok" : "no") : ""}`}>
                  <input
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="e.g. 110001"
                    autoFocus
                  />
                  {pin.length === 6 && <em>{pinCity ? `✓ ${pinCity.name}` : "Not covered yet"}</em>}
                </div>
              </label>
              {pin.length === 6 && !pinCity && <p className="callout warn">We don’t reach this pincode yet. Try another address, or check back soon.</p>}
              <label className="field">
                <span>Address</span>
                <input value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" placeholder="Flat / building, street, landmark" />
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <h2>When suits you?</h2>
              <p className="muted">The repair takes {repairTime(kind)}. You’ll get the exact arrival time on WhatsApp.</p>
              <div className="rail days">
                {days.map((d) => (
                  <button type="button" key={d.key} className={`day ${d.key === day ? "on" : ""}`} onClick={() => setDay(d.key)} aria-pressed={d.key === day}>
                    <small>{d.dow}</small>
                    <b>{d.day}</b>
                    <small>{d.mon}</small>
                  </button>
                ))}
              </div>
              <div className="slots">
                {SLOTS.map((s) => (
                  <button type="button" key={s.id} className={`slot ${s.id === slot ? "on" : ""}`} onClick={() => setSlot(s.id)} aria-pressed={s.id === slot}>
                    <b>{s.label}</b>
                    <small>{s.time}</small>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2>Choose your technician</h2>
              <p className="muted">
                Free for {pinCity?.name}, {when}. Ranked by customer ratings; everyone is ID-verified and skill-tested by us.
              </p>
              <div className="techs">
                {techs.map((x, i) => (
                  <button type="button" key={x.id} className={`tech ${x.id === tech?.id ? "on" : ""}`} onClick={() => setTechId(x.id)} aria-pressed={x.id === tech?.id}>
                    <span className="avatar" style={{ background: `hsl(${x.hue} 62% 42%)` }} aria-hidden="true">
                      {initials(x.name)}
                    </span>
                    <span className="tech-body">
                      <span className="tech-top">
                        <b>{x.name}</b>
                        {i === 0 && <em>{x.rating ? "Top rated" : "Best match"}</em>}
                      </span>
                      <span className="tech-stats">
                        {x.rating ? (
                          <>
                            <strong>★ {x.rating.toFixed(1)}</strong> · {x.jobs} repairs with us
                          </>
                        ) : (
                          <strong>New on ScreenSahi</strong>
                        )}{" "}
                        · {x.years} yrs experience
                      </span>
                      <span className="tech-tags">
                        <i className="ok">✓ ID verified</i>
                        <i className="ok">✓ Skill tested</i>
                        <i>{x.langs.join(", ")}</i>
                      </span>
                    </span>
                    <i className="radio" aria-hidden="true" />
                  </button>
                ))}
              </div>
              {tech && (
                <a className="tech-more" href={`/specialists/${tech.id}`} target="_blank" rel="noreferrer">
                  Read {techFirst}’s profile and reviews ↗
                </a>
              )}
              <p className="callout">
                Calls are connected through ScreenSahi, so your number stays private. <b>Pay only to ScreenSahi after the repair</b> — that is what activates
                your warranty.
              </p>
              {DEMO_TECHNICIANS && <small className="muted">Sample profiles shown while technicians are being onboarded.</small>}
            </>
          )}

          {step === 4 && (
            <>
              <h2>Last step: who should {techFirst ?? "we"} ask for?</h2>
              <label className="field">
                <span>Your name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Full name" autoFocus />
              </label>
              <label className="field">
                <span>WhatsApp number</span>
                <div className={`pinbox tel ${/^[6-9]\d{9}$/.test(phone) ? "ok" : ""}`}>
                  <b>+91</b>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="10-digit mobile"
                  />
                  {/^[6-9]\d{9}$/.test(phone) && <em>✓</em>}
                </div>
              </label>
              <p className="muted small">Only used to confirm this visit. No spam, no sales calls.</p>
            </>
          )}

          <div className="bnav">
            {step > 0 && (
              <button type="button" className="btn ghost" onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}
            <button className="btn" type="submit" disabled={!ok || busy}>
              {busy ? "Booking…" : step === 4 ? "Confirm visit" : "Continue"}
            </button>
          </div>
          {error && (
            <p className="callout warn" role="alert">
              {error}
            </p>
          )}
          <small className="muted center">No advance payment. Pay ScreenSahi after the repair.</small>
        </form>

        <ul className="assure">
          {ASSURE.map((a) => (
            <li key={a.t}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={a.d} />
              </svg>
              <div>
                <b>{a.t}</b>
                <span>{a.s}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <aside className="book-side">{summary}</aside>
    </div>
  );
}
