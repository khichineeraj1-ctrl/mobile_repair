"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CITIES } from "@/lib/data";
import { DEMO_TECHNICIANS, TECHNICIANS, initials, type Technician } from "@/lib/technicians";

// Home-page window into the marketplace: tap a city, see who you could choose.
// `lockCity` pins it to one city (city pages); `href` is where the button goes.
export default function TechShowcase({ lockCity, href = "/book" }: { lockCity?: string; href?: string }) {
  const [city, setCity] = useState(lockCity ?? CITIES[0].slug);
  const [live, setLive] = useState<{ city: string; list: Technician[] } | null>(null);
  // Same rating-ordered list the booking flow uses.
  useEffect(() => {
    let on = true;
    fetch(`/api/technicians?city=${city}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => on && d?.technicians && setLive({ city, list: d.technicians }))
      .catch(() => {});
    return () => {
      on = false;
    };
  }, [city]);
  const list = live?.city === city ? live.list : TECHNICIANS.filter((t) => t.city === city);

  return (
    <div className="showcase">
      {!lockCity && (
      <div className="rail">
        {CITIES.map((c) => (
          <button key={c.slug} className={`chip ${c.slug === city ? "on" : ""}`} onClick={() => setCity(c.slug)} aria-pressed={c.slug === city}>
            {c.name}
          </button>
        ))}
      </div>
      )}
      <div className="show-grid pop" key={city}>
        {list.map((x) => (
          <Link key={x.id} href={`/specialists/${x.id}`} className="tech show">
            <span className="avatar" style={{ background: `hsl(${x.hue} 62% 42%)` }} aria-hidden="true">
              {initials(x.name)}
            </span>
            <span className="tech-body">
              <span className="tech-top">
                <b>{x.name}</b>
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
              <span className="tech-more">Profile and reviews ›</span>
            </span>
          </Link>
        ))}
      </div>
      <div className="show-foot">
        <Link className="btn" href={href}>
          Choose your specialist
        </Link>
        {DEMO_TECHNICIANS && <small className="muted">Sample profiles shown while specialists are being onboarded.</small>}
      </div>
    </div>
  );
}
