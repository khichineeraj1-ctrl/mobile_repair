"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DEVICE_TABS, defaultItem, findItem, groupsOf, itemsOf, priceOf, repairsOf, tierInfo, type DeviceKind } from "@/lib/catalog";
import { TIERS, getCity, inr, type TierId } from "@/lib/data";
import DeviceArt from "./DeviceArt";
import { ChooseStrip } from "./Marketplace";

function useCountUp(target: number) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = from.current;
    if (start === target) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 420);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round((start + (target - start) * eased) / 100) * 100);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // rAF is paused in background tabs — make sure the final number still lands.
    const done = setTimeout(() => setValue(target), 500);
    from.current = target;
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
  }, [target]);
  return value;
}

// kind: lock to one device (hub pages). lockedModel: lock to one model (model pages).
// Neither: show device tabs (home page).
type Props = { kind?: DeviceKind; lockedModel?: string; citySlug?: string };

export default function Estimator({ kind: fixedKind, lockedModel, citySlug }: Props) {
  const city = citySlug ? getCity(citySlug) : undefined;
  const locked = lockedModel ? findItem(lockedModel) : undefined;
  const [kind, setKind] = useState<DeviceKind>(locked?.kind ?? fixedKind ?? "iphone");
  const [slug, setSlug] = useState(locked?.slug ?? defaultItem(locked?.kind ?? fixedKind ?? "iphone").slug);
  const item = findItem(slug)!;
  const [group, setGroup] = useState(item.group);
  const [repair, setRepair] = useState("display");
  const [tier, setTier] = useState<TierId>("premium");

  const t = tierInfo(kind, tier);
  const q = priceOf(slug, repair, tier, city)!;
  const shown = useCountUp(q.lo);
  const saving = priceOf(slug, repair, "apple", city)!.lo - q.hi;

  const pickKind = (k: DeviceKind) => {
    const it = defaultItem(k);
    setKind(k);
    setSlug(it.slug);
    setGroup(it.group);
    setRepair("display");
  };
  const pickGroup = (g: string) => {
    setGroup(g);
    setSlug(itemsOf(kind).find((x) => x.group === g)!.slug);
  };

  let n = 0;
  return (
    <div className="est">
      <div className="est-controls">
      {!locked && (
        <>
          {!fixedKind && (
            <div className="seg kind-tabs" role="tablist" aria-label="Device">
              {DEVICE_TABS.map((d) => (
                <button key={d.kind} className={d.kind === kind ? "on" : ""} onClick={() => pickKind(d.kind)} role="tab" aria-selected={d.kind === kind}>
                  {d.tab}
                </button>
              ))}
            </div>
          )}
          <div className="step">
            <span className="num">{++n}</span>Pick your {DEVICE_TABS.find((d) => d.kind === kind)!.name}
          </div>
          <div className="rail">
            {groupsOf(kind).map((g) => (
              <button key={g.id} className={`chip ${g.id === group ? "on" : ""}`} onClick={() => pickGroup(g.id)}>
                {g.label}
              </button>
            ))}
          </div>
          <div className="rail">
            {itemsOf(kind)
              .filter((x) => x.group === group)
              .map((x) => (
                <button key={x.slug} className={`chip chip-model ${x.slug === slug ? "on" : ""}`} onClick={() => setSlug(x.slug)}>
                  {x.short}
                </button>
              ))}
          </div>
        </>
      )}

      <div className="step">
        <span className="num">{++n}</span>What needs fixing?
      </div>
      <div className="dmg-grid">
        {repairsOf(kind).map((d) => (
          <button key={d.id} className={`dmg ${d.id === repair ? "on" : ""}`} onClick={() => setRepair(d.id)} aria-pressed={d.id === repair}>
            <DeviceArt kind={kind} repair={d.id} />
            <b>{d.label}</b>
            <small>{d.desc}</small>
          </button>
        ))}
      </div>

      <div className="step">
        <span className="num">{++n}</span>Part quality
      </div>
      <div className="seg">
        {TIERS.map((x) => (
          <button key={x.id} className={x.id === tier ? "on" : ""} onClick={() => setTier(x.id)} aria-pressed={x.id === tier}>
            {x.short}
          </button>
        ))}
      </div>

      </div>

      <div className="result" aria-live="polite">
        <small className="result-label">
          Indicative price · {item.name}
          {city ? ` · ${city.name}` : ""}
        </small>
        <div className="price">
          {inr(shown)}
          {q.hi !== q.lo && <span> – {inr(q.hi)}</span>}
        </div>
        {saving > 0 && <div className="save">Save up to {inr(saving)} vs Apple</div>}
        <ul className="facts">
          <li>
            <small>Where</small>
            {t.where}
          </li>
          <li>
            <small>Part</small>
            {t.part}
          </li>
          <li>
            <small>Time</small>
            {t.time}
          </li>
          <li>
            <small>Warranty</small>
            {t.warranty}
          </li>
        </ul>
        <p className="note">{t.note}</p>
        {tier !== "apple" && <ChooseStrip city={city} dark />}
        <div className="cta-row">
          {tier === "apple" ? (
            <button className="btn" onClick={() => setTier("premium")}>
              See doorstep options
            </button>
          ) : (
            <Link className="btn" href={`/book?model=${slug}&damage=${repair}&tier=${tier}${city ? `&city=${city.slug}` : ""}`}>
              Book doorstep repair
            </Link>
          )}
          {!locked && (
            <Link className="btn ghost" href={item.path}>
              Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
