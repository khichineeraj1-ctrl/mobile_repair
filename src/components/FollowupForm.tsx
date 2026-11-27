"use client";

import { useState } from "react";

const WORDS = ["", "Poor", "Not good", "Okay", "Good", "Excellent"];

type Props = { bookingId: string; techName: string; device: string };
type YesNo = boolean | null;

// Two-choice question as a pair of big tiles.
function Choice({ q, value, onPick, yes, no }: { q: string; value: YesNo; onPick: (v: boolean) => void; yes: [string, string]; no: [string, string] }) {
  return (
    <div className="field">
      <span>{q}</span>
      <div className="slots two">
        <button type="button" className={`slot ${value === true ? "on" : ""}`} onClick={() => onPick(true)} aria-pressed={value === true}>
          <b>{yes[0]}</b>
          <small>{yes[1]}</small>
        </button>
        <button type="button" className={`slot ${value === false ? "on" : ""}`} onClick={() => onPick(false)} aria-pressed={value === false}>
          <b>{no[0]}</b>
          <small>{no[1]}</small>
        </button>
      </div>
    </div>
  );
}

export default function FollowupForm({ bookingId, techName, device }: Props) {
  const first = techName.split(" ")[0];
  const [working, setWorking] = useState<YesNo>(null);
  const [paid, setPaid] = useState<YesNo>(null);
  const [fair, setFair] = useState<YesNo>(null); // true = was NOT asked to pay directly
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [last4, setLast4] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const answered = [working, paid, fair].filter((x) => x !== null).length + (stars ? 1 : 0);
  const ok = answered === 4 && last4.length === 4;

  if (done)
    return (
      <div className="card success pop">
        <svg className="bigtick" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="29" />
          <path d="M19 33l9 9 17-19" />
        </svg>
        <h2>Thank you</h2>
        <p className="muted">
          {working === false
            ? "We’re sorry something is wrong. Your repair is under warranty, and we will call you to put it right."
            : "Your answers are saved and stay private. They help us keep good specialists at the top."}
        </p>
      </div>
    );

  return (
    <form
      className="card rate pop"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!ok || busy) return;
        setBusy(true);
        setError("");
        try {
          const res = await fetch("/api/followups", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ bookingId, working, paidPlatform: paid, askedDirect: fair === false, stars, comment, last4 }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
          setDone(true);
        } catch (err) {
          setError(err instanceof TypeError ? "No connection. Check your internet and try again." : (err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="private">
        <b>Private.</b> {first} never sees these answers.
      </p>
      <div className="segs" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <i key={i} className={i < answered ? "done" : ""} />
        ))}
      </div>

      <Choice
        q={`Is your ${device} working well?`}
        value={working}
        onPick={setWorking}
        yes={["Yes, all good", "No problems since the repair"]}
        no={["No, there’s a problem", "Covered by your warranty"]}
      />
      <Choice q="Who did you pay?" value={paid} onPick={setPaid} yes={["ScreenSahi", "UPI link or QR from us"]} no={["The technician", "Cash or their own UPI"]} />
      <Choice
        q={`Did ${first} ask you to pay them directly, or offer a discount for cash?`}
        value={fair}
        onPick={setFair}
        yes={["No", "Nothing like that"]}
        no={["Yes", "They asked or offered"]}
      />

      <div className="field">
        <span>A day later, how many stars for {first}?</span>
        <div className="stars" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} role="radio" aria-checked={stars === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} className={n <= stars ? "on" : ""} onClick={() => setStars(n)}>
              ★
            </button>
          ))}
        </div>
        <div className={`star-word s${stars}`} aria-live="polite">
          {WORDS[stars] || " "}
        </div>
      </div>

      <label className="field">
        <span>{working === false ? "What is wrong?" : "Anything else? (optional)"}</span>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} rows={3} placeholder="Tell us in your own words" />
      </label>

      <label className="field">
        <span>Last 4 digits of your mobile number</span>
        <div className={`pinbox ${last4.length === 4 ? "ok" : ""}`}>
          <input value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" autoComplete="off" placeholder="e.g. 4321" />
        </div>
      </label>

      <div className="bnav">
        <button className="btn" type="submit" disabled={!ok || busy}>
          {busy ? "Saving…" : "Send private feedback"}
        </button>
      </div>
      {error && (
        <p className="callout warn" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
