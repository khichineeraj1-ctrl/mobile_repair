"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Tech = { id: string; name: string; rating: number | null; years: number; jobs: number; hue: number };
type Props = { id: string; bookingKey: string; day: string; slot: string; techId: string; techName: string; daysAhead: number; movesLeft: number };

const SLOTS = [
  { id: "morning", label: "Morning", time: "9 am – 12 pm" },
  { id: "afternoon", label: "Afternoon", time: "12 – 4 pm" },
  { id: "evening", label: "Evening", time: "4 – 8 pm" },
];
const initials = (n: string) =>
  n
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

// Lets the customer move their own visit: pick a day and time, keep the same
// specialist if they are free, or choose another one.
export default function Reschedule(p: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState<{ key: string; dow: string; day: number; mon: string }[]>([]);
  const [day, setDay] = useState("");
  const [slot, setSlot] = useState("");
  const [check, setCheck] = useState<{ for: string; currentFree: boolean; technicians: Tech[] } | null>(null);
  const [pick, setPick] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  // Built in the browser so "tomorrow" follows the customer's own clock.
  useEffect(() => {
    const now = new Date();
    setDays(
      [...Array(p.daysAhead)].map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i + 1);
        return {
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
          dow: i === 0 ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short" }),
          day: d.getDate(),
          mon: d.toLocaleDateString("en-IN", { month: "short" }),
        };
      })
    );
  }, [p.daysAhead]);

  const chosen = day && slot ? `${day}|${slot}` : "";
  const same = day === p.day && slot === p.slot;

  async function call(body: object) {
    const res = await fetch("/api/bookings/reschedule", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: p.id, key: p.bookingKey, day, slot, ...body }) });
    return { ok: res.ok, data: await res.json().catch(() => ({})) };
  }

  // Ask who is free as soon as a day and a time are both chosen.
  useEffect(() => {
    if (!chosen || same) return;
    let stale = false;
    setError("");
    setPick("");
    call({ check: true })
      .then(({ ok, data }) => {
        if (stale) return;
        if (ok) setCheck({ for: chosen, currentFree: data.currentFree, technicians: data.technicians });
        else setError(data.error || "Something went wrong. Please try again.");
      })
      .catch(() => !stale && setError("No connection. Check your internet and try again."));
    return () => {
      stale = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosen]);

  const ready = check?.for === chosen ? check : null;
  const needPick = !!ready && !ready.currentFree;
  const canSave = !!ready && !same && (ready.currentFree || !!pick) && !busy;

  if (done)
    return (
      <div className="card resched">
        <p className="callout good" role="status">
          {done}
        </p>
      </div>
    );

  if (!open)
    return (
      <div className="resched-open">
        <button type="button" className="btn ghost" onClick={() => setOpen(true)}>
          Change day or time
        </button>
      </div>
    );

  return (
    <div className="card resched">
      <h2>Move your visit</h2>
      <p className="muted small">
        Free to change until the repair starts. You can move it {p.movesLeft} more time{p.movesLeft === 1 ? "" : "s"}.
      </p>
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

      {same && <p className="callout">That is your current visit time.</p>}
      {ready && !same && ready.currentFree && (
        <p className="callout good">
          <b>{p.techName}</b> is free then, so your specialist stays the same.
        </p>
      )}
      {needPick && !same && (
        <>
          <p className="callout warn">
            <b>{p.techName}</b> is not free then. Choose who comes instead:
          </p>
          <div className="techs">
            {ready!.technicians.map((t) => (
              <button type="button" key={t.id} className={`tech ${t.id === pick ? "on" : ""}`} onClick={() => setPick(t.id)} aria-pressed={t.id === pick}>
                <span className="avatar" style={{ background: `hsl(${t.hue} 62% 42%)` }} aria-hidden="true">
                  {initials(t.name)}
                </span>
                <span className="tech-body">
                  <span className="tech-top">
                    <b>{t.name}</b>
                  </span>
                  <span className="tech-stats">
                    {t.rating ? <strong>★ {t.rating.toFixed(1)}</strong> : <strong>New on ScreenSahi</strong>}
                    {t.rating ? ` · ${t.jobs} repairs` : ""} · {t.years} yrs experience
                  </span>
                </span>
                <span className="radio" aria-hidden="true" />
              </button>
            ))}
          </div>
        </>
      )}
      {error && (
        <p className="callout warn" role="alert">
          {error}
        </p>
      )}
      <div className="cta-row">
        <button
          type="button"
          className="btn"
          disabled={!canSave}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              const { ok, data } = await call(pick ? { technician: pick } : {});
              if (!ok) throw new Error(data.error || "Something went wrong. Please try again.");
              setDone(`Done. Your visit is now ${data.when} with ${data.technician}. Your start code stays the same.`);
              router.refresh();
            } catch (err) {
              setError(err instanceof TypeError ? "No connection. Check your internet and try again." : (err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving…" : "Confirm new time"}
        </button>
        <button type="button" className="btn ghost" onClick={() => setOpen(false)}>
          Keep current time
        </button>
      </div>
    </div>
  );
}
