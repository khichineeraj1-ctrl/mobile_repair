import Link from "next/link";
import { SITE, type City } from "@/lib/data";
import { TECHNICIANS, initials } from "@/lib/technicians";

// Small, reusable pieces that carry the marketplace message into the places
// where a customer is looking at a price or about to book.

// Three overlapping faces + one line. Sits beside prices and calls to action.
export function ChooseStrip({ city, dark = false }: { city?: City; dark?: boolean }) {
  const faces = (city ? TECHNICIANS.filter((t) => t.city === city.slug) : [TECHNICIANS[0], TECHNICIANS[6], TECHNICIANS[12]]).slice(0, 3);
  return (
    <Link href="/how-it-works" className={`choose-strip ${dark ? "dark" : ""}`}>
      <span className="faces" aria-hidden="true">
        {faces.map((t) => (
          <i key={t.id} style={{ background: `hsl(${t.hue} 62% 42%)` }}>
            {initials(t.name)}
          </i>
        ))}
      </span>
      <span className="choose-text">
        <b>You choose who comes</b>
        <small>{city ? `Specialists in ${city.name}, ranked by customer ratings` : "Specialists ranked by customer ratings"}</small>
      </span>
      <span className="go" aria-hidden="true">›</span>
    </Link>
  );
}

const ROWS = [
  ["Who repairs it", "Whoever is assigned", "The specialist you choose"],
  ["What they repair", "Every brand", "Apple devices only"],
  ["What you know first", "A company name", "Name, rating, experience"],
];

export function Compare() {
  return (
    <div className="compare-grid">
      <div className="cmp-head">
        <span />
        <span>Usual doorstep repair</span>
        <span className="us">{SITE.name}</span>
      </div>
      {ROWS.map(([k, them, us]) => (
        <div className="cmp-row" key={k}>
          <b>{k}</b>
          <span>{them}</span>
          <span className="us">{us}</span>
        </div>
      ))}
    </div>
  );
}
