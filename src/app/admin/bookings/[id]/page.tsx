import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { assign, note, payment, reschedule, setStatus, unlockCodes } from "../../actions";
import { adminGate, dayLabel, stars, when } from "@/lib/admin";
import { board } from "@/lib/adminview";
import { BOOKING_STATUS, MAX_CODE_FAILS, PAY_METHODS, SLOT_IDS, type BookingStatus } from "@/lib/bookings";
import { CITIES, inr } from "@/lib/data";
import { roster } from "@/lib/roster";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking · Admin" };

const wa = (phone: string, text: string) => `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`;
const NEXT: Record<BookingStatus, { status: BookingStatus; label: string; ghost?: boolean }[]> = {
  new: [
    { status: "confirmed", label: "Confirm booking" },
    { status: "cancelled", label: "Cancel", ghost: true },
  ],
  confirmed: [
    { status: "completed", label: "Mark repair completed" },
    { status: "cancelled", label: "Cancel", ghost: true },
  ],
  started: [
    { status: "completed", label: "Mark repair completed" },
    { status: "cancelled", label: "Cancel", ghost: true },
  ],
  completed: [{ status: "confirmed", label: "Reopen", ghost: true }],
  cancelled: [{ status: "new", label: "Restore booking", ghost: true }],
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await adminGate();
  const { id } = await params;
  const x = (await board()).find((r) => r.b.id === id);
  if (!x) notFound();
  const { b, r, f, due, leak, broken, followDue } = x;

  const h = await headers();
  const base = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const first = b.name.split(" ")[0];
  // Messages the team sends from their own WhatsApp until sending is automated.
  const rateMsg = `Hi ${first}, thank you for choosing ScreenSahi. Please rate ${b.technicianName.split(" ")[0]} for your ${b.modelName} repair. It takes 20 seconds: ${base}/rate/${b.id}`;
  const followMsg = `Hi ${first}, this is ScreenSahi checking in on your ${b.modelName} repair. Is everything working? Four quick questions, and your technician never sees your answers: ${base}/followup/${b.id}`;
  const trackUrl = `${base}/track/${b.id}/${b.customerKey}`;
  const jobUrl = `${base}/job/${b.id}/${b.techKey}`;
  const confirmMsg = `Hi ${first}, your ScreenSahi doorstep repair is confirmed. ${b.technicianName} will visit on ${dayLabel(b.day)} (${b.slot}) for your ${b.modelName}. Your start code is on your booking page: ${trackUrl} . Share it only at your door. You pay ScreenSahi after the repair. Booking ${b.id}.`;
  const jobMsg = `ScreenSahi job ${b.id}: ${b.modelName}, ${b.damage} repair, ${dayLabel(b.day)} (${b.slot}), ${b.city} ${b.pincode}. Open your job page to see the address and enter the customer's start and end codes: ${jobUrl}`;
  const mins = b.startedAt && b.endedAt ? Math.max(1, Math.round((new Date(b.endedAt).getTime() - new Date(b.startedAt).getTime()) / 60000)) : null;
  const fails = b.codeFails ?? 0;

  const citySlug = CITIES.find((c) => c.name === b.city)?.slug;
  const techs = (await roster()).filter((t) => t.city === citySlug && (!t.paused || t.id === b.technicianId));
  const history = [{ at: b.createdAt, text: "Booking received from the website" }, ...(b.history ?? [])].reverse();

  return (
    <>
      <nav className="adm-crumb">
        <Link href="/admin/bookings">← Bookings</Link>
      </nav>
      <header className="adm-head">
        <div>
          <h1>
            {b.id} <em className={`adm-badge ${b.status}`}>{BOOKING_STATUS[b.status]}</em>
          </h1>
          <p>
            {b.name} · {b.modelName} · received {when(b.createdAt)}
          </p>
        </div>
        <div className="adm-actions">
          {NEXT[b.status].map((n) => (
            <form key={n.status} action={setStatus}>
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="status" value={n.status} />
              <button className={`adm-btn ${n.ghost ? "ghost" : ""}`} type="submit">
                {n.label}
              </button>
            </form>
          ))}
        </div>
      </header>

      {leak && <p className="adm-alert">Customer paid, or was asked to pay, the technician directly.</p>}
      {broken && <p className="adm-alert">Customer reports a problem after the repair. Warranty call needed.</p>}

      <div className="adm-split">
        <div className="adm-col">
          <section className="adm-card">
            <h2>Job</h2>
            <dl className="adm-dl">
              <div>
                <dt>Repair</dt>
                <dd>
                  {b.modelName} · {b.damage} · {b.tier} part
                </dd>
              </div>
              <div>
                <dt>Quote given</dt>
                <dd>
                  {inr(b.priceLo)}–{inr(b.priceHi)}
                </dd>
              </div>
              <div>
                <dt>Visit</dt>
                <dd>
                  {dayLabel(b.day)} · {b.slot}
                  {b.customerMoves ? <small className="adm-sub">Moved by the customer {b.customerMoves === 1 ? "once" : `${b.customerMoves} times`}</small> : null}
                </dd>
              </div>
              <div>
                <dt>Technician</dt>
                <dd>{b.technicianName}</dd>
              </div>
              <div>
                <dt>Payment</dt>
                <dd>{b.paidAt ? `${inr(b.finalPrice ?? 0)} by ${b.paidMethod}, ${when(b.paidAt)}` : "Not received yet"}</dd>
              </div>
              <div>
                <dt>Technician payout</dt>
                <dd>{b.payoutAt ? `Sent ${when(b.payoutAt)}` : b.paidAt ? "Due" : "After payment"}</dd>
              </div>
            </dl>
          </section>

          <section className="adm-card">
            <h2>
              Door codes{" "}
              <em className={`adm-badge ${b.endedAt ? "completed" : b.startedAt ? "started" : ""}`}>
                {b.endedAt ? "Job ended" : b.startedAt ? "Job in progress" : "Not started"}
              </em>
            </h2>
            <dl className="adm-dl">
              <div>
                <dt>Start code, customer tells technician</dt>
                <dd className="adm-code">{b.startCode}</dd>
              </div>
              <div>
                <dt>End code, after customer tests</dt>
                <dd className="adm-code">{b.endCode}</dd>
              </div>
              <div>
                <dt>Job started</dt>
                <dd>{b.startedAt ? when(b.startedAt) : "Start code not entered yet"}</dd>
              </div>
              <div>
                <dt>Job ended</dt>
                <dd>{b.endedAt ? `${when(b.endedAt)}${mins ? ` · took ${mins} min` : ""}` : b.startedAt ? "End code not entered yet" : "–"}</dd>
              </div>
            </dl>
            {fails > 0 && (
              <form action={unlockCodes} className="adm-actions adm-lock">
                <input type="hidden" name="id" value={b.id} />
                <span>
                  {fails >= MAX_CODE_FAILS ? "The technician’s page is locked after too many wrong codes." : `${fails} wrong code${fails === 1 ? "" : "s"} entered.`}
                </span>
                <button className="adm-btn ghost" type="submit">
                  {fails >= MAX_CODE_FAILS ? "Unlock" : "Reset count"}
                </button>
              </form>
            )}
            <div className="adm-actions">
              <a className="adm-btn" href={`https://wa.me/?text=${encodeURIComponent(jobMsg)}`} target="_blank" rel="noreferrer" title={jobMsg}>
                Send job link to technician
              </a>
              <a className="adm-btn ghost" href={jobUrl} target="_blank" rel="noreferrer">
                Technician’s page ↗
              </a>
              <a className="adm-btn ghost" href={trackUrl} target="_blank" rel="noreferrer">
                Customer’s page ↗
              </a>
            </div>
          </section>

          <section className="adm-card">
            <h2>Customer</h2>
            <dl className="adm-dl">
              <div>
                <dt>Name</dt>
                <dd>{b.name}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>+91 {b.phone}</dd>
              </div>
              <div className="wide">
                <dt>Address</dt>
                <dd>
                  {b.address}, {b.city} {b.pincode}
                </dd>
              </div>
            </dl>
            <div className="adm-actions">
              <a className="adm-btn" href={wa(b.phone, confirmMsg)} target="_blank" rel="noreferrer" title={confirmMsg}>
                Send confirmation
              </a>
              {!r && (
                <a className="adm-btn ghost" href={wa(b.phone, rateMsg)} target="_blank" rel="noreferrer" title={rateMsg}>
                  Send rating link
                </a>
              )}
              {!f && (
                <a className={`adm-btn ${followDue ? "" : "ghost"}`} href={wa(b.phone, followMsg)} target="_blank" rel="noreferrer" title={followMsg}>
                  Send next-day message
                </a>
              )}
              <a className="adm-btn ghost" href={`tel:+91${b.phone}`}>
                Call
              </a>
            </div>
            <details className="adm-msgs">
              <summary>Preview the messages</summary>
              <p>
                <b>Confirmation:</b> {confirmMsg}
              </p>
              <p>
                <b>To the technician:</b> {jobMsg}
              </p>
              <p>
                <b>Rating:</b> {rateMsg}
              </p>
              <p>
                <b>Next day:</b> {followMsg}
              </p>
            </details>
          </section>

          <section className="adm-card">
            <h2>Customer feedback</h2>
            <dl className="adm-dl">
              <div className="wide">
                <dt>Rating at the door</dt>
                <dd>
                  {r ? (
                    <>
                      <span className="adm-stars">{stars(r.stars)}</span> {r.tags.join(", ")}
                      {r.comment ? ` — “${r.comment}”` : ""}
                    </>
                  ) : (
                    "Not rated yet"
                  )}
                </dd>
              </div>
              <div className="wide">
                <dt>Private next-day feedback</dt>
                <dd>
                  {f ? (
                    <>
                      <span className="adm-stars">{stars(f.stars)}</span> {f.working ? "Working well" : "Has a problem"} · Paid {f.paidPlatform ? "ScreenSahi" : "the technician"}
                      {f.askedDirect ? " · Was asked to pay directly" : ""}
                      {f.comment ? ` — “${f.comment}”` : ""}
                    </>
                  ) : followDue ? (
                    "Due now"
                  ) : (
                    `Due from ${due.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                  )}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="adm-col">
          <section className="adm-card">
            <h2>Record payment</h2>
            <form action={payment} className="adm-form" key={`${b.finalPrice}-${b.paidMethod}`}>
              <input type="hidden" name="id" value={b.id} />
              <label>
                Amount received (₹)
                <input className="adm-input" name="amount" type="number" min="1" step="1" defaultValue={b.finalPrice ?? b.priceLo} required />
              </label>
              <label>
                Paid by
                <select className="adm-input" name="method" defaultValue={b.paidMethod ?? "UPI"}>
                  {PAY_METHODS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>
              <button className="adm-btn" type="submit">
                {b.paidAt ? "Update payment" : "Mark as paid"}
              </button>
            </form>
          </section>

          <section className="adm-card">
            <h2>Change technician</h2>
            <form action={assign} className="adm-form" key={b.technicianId}>
              <input type="hidden" name="id" value={b.id} />
              <label>
                Technician in {b.city}
                <select className="adm-input" name="technicianId" defaultValue={b.technicianId}>
                  {techs.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                      {t.rating ? ` · ${t.rating}★` : " · new"}
                    </option>
                  ))}
                </select>
              </label>
              <button className="adm-btn ghost" type="submit">
                Reassign
              </button>
            </form>
          </section>

          <section className="adm-card">
            <h2>Reschedule</h2>
            <form action={reschedule} className="adm-form" key={`${b.day}-${b.slot}`}>
              <input type="hidden" name="id" value={b.id} />
              <label>
                Day
                <input className="adm-input" name="day" type="date" defaultValue={b.day} required />
              </label>
              <label>
                Time
                <select className="adm-input" name="slot" defaultValue={b.slot}>
                  {SLOT_IDS.map((sl) => (
                    <option key={sl} value={sl}>
                      {sl[0].toUpperCase() + sl.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
              <button className="adm-btn ghost" type="submit">
                Move visit
              </button>
            </form>
          </section>

          <section className="adm-card">
            <h2>Notes and history</h2>
            <form action={note} className="adm-form one">
              <input type="hidden" name="id" value={b.id} />
              <input className="adm-input" name="text" maxLength={300} placeholder="Add a note for the team…" aria-label="Note" required />
              <button className="adm-btn ghost" type="submit">
                Add note
              </button>
            </form>
            <ul className="adm-timeline">
              {history.map((e, i) => (
                <li key={i}>
                  <small>{when(e.at)}</small>
                  <span>{e.text}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
