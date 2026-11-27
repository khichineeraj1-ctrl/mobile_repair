"use client";

import { useState } from "react";
import { inr } from "@/lib/data";

// `fee` is an example per-job payout passed in from the page (placeholder
// until the real fee is set). The maths is deliberately simple and visible.
export default function EarningsEstimator({ fee }: { fee: number }) {
  const [jobs, setJobs] = useState(3);
  const [days, setDays] = useState(6);
  const week = jobs * days * fee;

  return (
    <div className="earn">
      <div className="earn-out" aria-live="polite">
        <small>You could earn about</small>
        <b>{inr(week)}</b>
        <span>a week · about {inr(week * 4)} a month</span>
      </div>
      <label>
        <span>
          Jobs a day <b>{jobs}</b>
        </span>
        <input type="range" min={1} max={6} value={jobs} onChange={(e) => setJobs(+e.target.value)} />
      </label>
      <label>
        <span>
          Days a week <b>{days}</b>
        </span>
        <input type="range" min={1} max={7} value={days} onChange={(e) => setDays(+e.target.value)} />
      </label>
      <small className="earn-note">Example only, at {inr(fee)} per completed job. Actual fees depend on the phone model.</small>
    </div>
  );
}
