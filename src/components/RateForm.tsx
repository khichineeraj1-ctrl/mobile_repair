"use client";

import { useState } from "react";

const WORDS = ["", "Poor", "Not good", "Okay", "Good", "Excellent"];
const GOOD_TAGS = ["On time", "Polite", "Explained the repair", "Neat work", "Screen looks perfect"];
const BAD_TAGS = ["Late", "Rude", "Rushed", "Problem not fixed", "Asked for cash"];

type Props = { bookingId: string; techName: string; device: string };

export default function RateForm({ bookingId, techName, device }: Props) {
  const first = techName.split(" ")[0];
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [paid, setPaid] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [last4, setLast4] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const shown = hover || stars;
  const tagSet = stars >= 4 ? GOOD_TAGS : BAD_TAGS;
  const ok = stars > 0 && paid !== null && last4.length === 4;

  if (done)
    return (
      <div className="card success pop">
        <svg className="bigtick" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="29" />
          <path d="M19 33l9 9 17-19" />
        </svg>
        <h2>Thank you</h2>
        <p className="muted">
          Your rating for {first} is saved. Ratings decide which specialists are shown first, so you have just helped the next customer choose.
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
          const res = await fetch("/api/ratings", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ bookingId, stars, tags, paidPlatform: paid, comment, last4 }),
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
      <h2>How was {first}?</h2>
      <p className="muted">Your {device} repair. Tap a star.</p>
      <div className="stars" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            role="radio"
            aria-checked={stars === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className={n <= shown ? "on" : ""}
            onMouseEnter={() => setHover(n)}
            onClick={() => {
              if ((n >= 4) !== (stars >= 4)) setTags([]); // tag list changes with the mood
              setStars(n);
            }}
          >
            ★
          </button>
        ))}
      </div>
      <div className={`star-word s${shown}`} aria-live="polite">
        {WORDS[shown] || " "}
      </div>

      {stars > 0 && (
        <div className="pop">
          <div className="field">
            <span>{stars >= 4 ? "What went well?" : "What went wrong?"}</span>
            <div className="chips">
              {tagSet.map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`chip chip-model ${tags.includes(t) ? "on" : ""}`}
                  onClick={() => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))}
                  aria-pressed={tags.includes(t)}
                >
                  {tags.includes(t) ? "✓ " : ""}
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span>Who did you pay?</span>
            <div className="slots two">
              <button type="button" className={`slot ${paid === true ? "on" : ""}`} onClick={() => setPaid(true)} aria-pressed={paid === true}>
                <b>ScreenSahi</b>
                <small>UPI link or QR from us</small>
              </button>
              <button type="button" className={`slot ${paid === false ? "on" : ""}`} onClick={() => setPaid(false)} aria-pressed={paid === false}>
                <b>The technician</b>
                <small>Cash or their own UPI</small>
              </button>
            </div>
          </div>

          <label className="field">
            <span>Anything else? (optional)</span>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} rows={3} placeholder="Tell us in your own words" />
          </label>

          <label className="field">
            <span>Last 4 digits of your mobile number</span>
            <div className={`pinbox ${last4.length === 4 ? "ok" : ""}`}>
              <input
                value={last4}
                onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                autoComplete="off"
                placeholder="e.g. 4321"
              />
            </div>
          </label>
          <p className="muted small">This confirms the rating is from you, the customer. {first} cannot change it.</p>
          <p className="muted small">Your first name, stars and words are shown on {first}’s public profile to help other customers choose.</p>
        </div>
      )}

      <div className="bnav">
        <button className="btn" type="submit" disabled={!ok || busy}>
          {busy ? "Saving…" : "Submit rating"}
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
