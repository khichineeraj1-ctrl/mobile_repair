"use client";

import { useState } from "react";
import { CITIES } from "@/lib/data";

// Kept in sync with PARTNER_OPTIONS in lib/partners.ts (that file is server-only).
const YEARS = ["Under 2 years", "2–5 years", "5–10 years", "10+ years"];
const WORK = ["Own shop", "Work at a shop", "Freelance"];
const SKILLS = ["iPhone screens", "iPhone back glass", "Battery", "Android screens", "Board-level repair"];
const SLOTS = [
  { label: "Morning", time: "9 am – 12 pm" },
  { label: "Afternoon", time: "12 – 4 pm" },
  { label: "Evening", time: "4 – 8 pm" },
];
const DAYS = ["Weekdays", "Weekends", "All week"];
const STEPS = ["About you", "Your skills", "Your time"];
const CITY_NAMES = [...CITIES.map((c) => c.name), "Other city"];

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export default function PartnerForm() {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ref, setRef] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [years, setYears] = useState("");
  const [work, setWork] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [bike, setBike] = useState(false);
  const [tools, setTools] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [days, setDays] = useState("");
  const [consent, setConsent] = useState(false);

  const phoneOk = /^[6-9]\d{9}$/.test(phone);
  const ok = [
    name.trim().length >= 2 && phoneOk && !!city && pincode.length === 6,
    !!years && !!work && skills.length > 0,
    slots.length > 0 && !!days && consent,
  ][step];

  if (ref)
    return (
      <div className="card success pop">
        <svg className="bigtick" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="29" />
          <path d="M19 33l9 9 17-19" />
        </svg>
        <h2>Application received, {name.trim().split(" ")[0]}</h2>
        <p className="ref">
          Application number <b>{ref}</b>
        </p>
        <ol className="next">
          <li className="done">
            <b>Application received</b>
            <span>We have your details and skills.</span>
          </li>
          <li>
            <b>We call you</b>
            <span>On +91 {phone}, to fix a time to meet.</span>
          </li>
          <li>
            <b>Skill test and ID check</b>
            <span>A screen replacement on a practice phone, and your ID, in person.</span>
          </li>
          <li>
            <b>Trial jobs, then your profile goes live</b>
            <span>Customers in {city === "Other city" ? "your city" : city} can choose you.</span>
          </li>
        </ol>
      </div>
    );

  return (
    <div>
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
          if (step < 2) return setStep(step + 1);
          setBusy(true);
          try {
            const res = await fetch("/api/partners", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ name, phone, city, pincode, years, work, skills, bike, tools, slots, days, consent }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
            setRef(data.id);
          } catch (err) {
            setError(err instanceof TypeError ? "No connection. Check your internet and try again." : (err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {step === 0 && (
          <>
            <h2>Tell us about you</h2>
            <label className="field">
              <span>Your name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Full name" />
            </label>
            <label className="field">
              <span>WhatsApp number</span>
              <div className={`pinbox tel ${phoneOk ? "ok" : ""}`}>
                <b>+91</b>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="10-digit mobile"
                />
                {phoneOk && <em>✓</em>}
              </div>
            </label>
            <div className="field">
              <span>Which city do you work in?</span>
              <div className="chips">
                {CITY_NAMES.map((c) => (
                  <button type="button" key={c} className={`chip ${c === city ? "on" : ""}`} onClick={() => setCity(c)} aria-pressed={c === city}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <label className="field">
              <span>Your area pincode</span>
              <div className={`pinbox ${pincode.length === 6 ? "ok" : ""}`}>
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="e.g. 110001"
                />
                {pincode.length === 6 && <em>✓</em>}
              </div>
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <h2>Your repair experience</h2>
            <div className="field">
              <span>How long have you repaired phones?</span>
              <div className="chips">
                {YEARS.map((y) => (
                  <button type="button" key={y} className={`chip ${y === years ? "on" : ""}`} onClick={() => setYears(y)} aria-pressed={y === years}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span>How do you work today?</span>
              <div className="chips">
                {WORK.map((w) => (
                  <button type="button" key={w} className={`chip ${w === work ? "on" : ""}`} onClick={() => setWork(w)} aria-pressed={w === work}>
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span>Which repairs do you do? Tap all that apply</span>
              <div className="chips">
                {SKILLS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={`chip chip-model ${skills.includes(s) ? "on" : ""}`}
                    onClick={() => setSkills((cur) => toggle(cur, s))}
                    aria-pressed={skills.includes(s)}
                  >
                    {skills.includes(s) ? "✓ " : ""}
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span>Do you have</span>
              <div className="chips">
                <button type="button" className={`chip chip-model ${bike ? "on" : ""}`} onClick={() => setBike(!bike)} aria-pressed={bike}>
                  {bike ? "✓ " : ""}A two-wheeler
                </button>
                <button type="button" className={`chip chip-model ${tools ? "on" : ""}`} onClick={() => setTools(!tools)} aria-pressed={tools}>
                  {tools ? "✓ " : ""}Your own tool kit
                </button>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>When can you take jobs?</h2>
            <p className="muted">Tap every slot you can work. You can change this later.</p>
            <div className="slots">
              {SLOTS.map((s) => (
                <button
                  type="button"
                  key={s.label}
                  className={`slot ${slots.includes(s.label) ? "on" : ""}`}
                  onClick={() => setSlots((cur) => toggle(cur, s.label))}
                  aria-pressed={slots.includes(s.label)}
                >
                  <b>{s.label}</b>
                  <small>{s.time}</small>
                </button>
              ))}
            </div>
            <div className="field">
              <span>Which days?</span>
              <div className="chips">
                {DAYS.map((d) => (
                  <button type="button" key={d} className={`chip ${d === days ? "on" : ""}`} onClick={() => setDays(d)} aria-pressed={d === days}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <label className="consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>ScreenSahi can call or WhatsApp me about this application.</span>
            </label>
          </>
        )}

        <div className="bnav">
          {step > 0 && (
            <button type="button" className="btn ghost" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          <button className="btn" type="submit" disabled={!ok || busy}>
            {busy ? "Sending…" : step === 2 ? "Send application" : "Continue"}
          </button>
        </div>
        {error && (
          <p className="callout warn" role="alert">
            {error}
          </p>
        )}
        <small className="muted center">No documents needed now. Your ID is checked in person.</small>
      </form>
    </div>
  );
}
