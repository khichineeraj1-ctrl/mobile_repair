"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type R = { at: string; stars: number; tags: string[]; comment: string; name: string; device: string; city: string; techId: string; techName: string };

// "What customers say" on the home page. Shows the latest written reviews,
// whatever their stars. Renders nothing until there is at least one.
export default function ReviewStrip() {
  const [list, setList] = useState<R[]>([]);
  useEffect(() => {
    fetch("/api/reviews?limit=6")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.reviews && setList(d.reviews))
      .catch(() => {});
  }, []);
  if (!list.length) return null;

  return (
    <section className="section">
      <small className="tag">From customers</small>
      <h2>What customers say</h2>
      <p className="muted lead">The latest reviews, as written. Every one comes from a completed booking.</p>
      <div className="rail reviews-rail">
        {list.map((r, i) => (
          <article key={i} className="card review">
            <div className="rv-stars" aria-label={`${r.stars} out of 5`}>
              {"★".repeat(r.stars)}
              <span>{"★".repeat(5 - r.stars)}</span>
            </div>
            <p>“{r.comment}”</p>
            <small>
              <b>{r.name}</b>
              {r.device ? ` · ${r.device}` : ""}
              {r.city ? ` · ${r.city}` : ""}
            </small>
            <Link href={`/specialists/${r.techId}`}>Repaired by {r.techName} ›</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
