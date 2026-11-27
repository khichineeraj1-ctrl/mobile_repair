"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CITIES, getCity } from "@/lib/data";
import { DEMO_TECHNICIANS, TECHNICIANS, initials, type Technician } from "@/lib/technicians";
import BeforeAfter from "./BeforeAfter";
import PincodeCheck from "./PincodeCheck";

// The hero's "show, don't tell": drag the phone to repair it, tap a face to
// choose who comes. Entering a pincode switches the faces to that city.
export default function HeroInteractive() {
  const [city, setCity] = useState(CITIES[0].slug);
  const [live, setLive] = useState<{ city: string; list: Technician[] } | null>(null);
  const [picked, setPicked] = useState("");

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
  const sel = list.find((t) => t.id === picked) ?? list[0];

  return (
    <>
      <div className="stage2">
        <BeforeAfter />
        <div className="pick">
          <small className="pick-h">Tap to choose who comes · {getCity(city)!.name}</small>
          <div className="pick-list pop" key={city}>
            {list.map((t) => (
              <button key={t.id} className={`pick-row ${t.id === sel.id ? "on" : ""}`} onClick={() => setPicked(t.id)} aria-pressed={t.id === sel.id}>
                <span className="avatar sm" style={{ background: `hsl(${t.hue} 62% 42%)` }} aria-hidden="true">
                  {initials(t.name)}
                </span>
                <span>
                  <b>{t.name}</b>
                  <small>{t.rating ? `★ ${t.rating.toFixed(1)} · ${t.jobs} repairs` : `New · ${t.years} yrs experience`}</small>
                </span>
              </button>
            ))}
          </div>
          <Link className="btn btn-sm" href={`/book?tech=${sel.id}`}>
            Book with {sel.name.split(" ")[0]}
          </Link>
          <Link className="pick-more" href={`/specialists/${sel.id}`}>
            {sel.name.split(" ")[0]}’s reviews ›
          </Link>
          {DEMO_TECHNICIANS && <small className="pick-note">Sample profiles</small>}
        </div>
      </div>

      <ul className="hero-pills">
        <li>Apple devices only</li>
        <li>Pay after repair</li>
        <li>Up to 6-month warranty</li>
      </ul>

      <PincodeCheck onCity={setCity} />
    </>
  );
}
