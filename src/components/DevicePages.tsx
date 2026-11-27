import Link from "next/link";
import { DEVICE_TABS } from "@/lib/catalog";
import { CITIES, SITE, TIERS, an, inr, range, type City, type QA } from "@/lib/data";
import { DMODELS, KINDS, dFaqs, dPath, dWorth, dquote, type DModel, type Kind } from "@/lib/devices";
import Estimator from "./Estimator";
import Faq, { JsonLd } from "./Faq";
import { DESC_MAX, TITLE_MAX, breadcrumbs, fit } from "@/lib/seo";
import { ChooseStrip } from "./Marketplace";
import TechShowcase from "./TechShowcase";

// Pills that jump between the iPhone, iPad and MacBook price lists.
export function DeviceSwitch({ current }: { current: string }) {
  return (
    <div className="links switch">
      {DEVICE_TABS.map((d) => (
        <Link key={d.kind} href={d.hub} className={`pill ${d.kind === current ? "on" : ""}`} aria-current={d.kind === current ? "page" : undefined}>
          {d.name}
        </Link>
      ))}
    </div>
  );
}

const ofKind = (kind: Kind) => DMODELS.filter((m) => m.kind === kind);
const families = (kind: Kind) => [...new Set(ofKind(kind).map((m) => m.family))];
const tierName = (id: string) => (id === "apple" ? "Apple" : id === "premium" ? "Premium" : "Budget");

// ----------------------------------------------------------------- hub page
export function hubMeta(kind: Kind) {
  const k = KINDS[kind];
  return {
    title: { absolute: fit([`${k.name} Screen Replacement & Repair Price List, India ${SITE.year}`, `${k.name} Screen Repair Price List, India ${SITE.year}`], TITLE_MAX) },
    description: fit(
      [
        `${k.name} screen and battery repair at your doorstep, by an Apple specialist you choose. Prices for every ${k.name} model in India. Pay after the repair.`,
        `${k.name} screen and battery repair at your doorstep. Prices for every ${k.name} model in India. Pay after the repair.`,
      ],
      DESC_MAX
    ),
    alternates: { canonical: k.path },
  };
}

function hubFaqs(kind: Kind): QA[] {
  const k = KINDS[kind];
  const list = ofKind(kind);
  const lo = Math.min(...list.map((m) => dquote(m, "display", "budget")!.lo));
  const hi = Math.max(...list.map((m) => m.apple));
  return [
    {
      q: `How much does ${k.name} screen replacement cost in India?`,
      a: `${k.name} screen replacement in India costs between ${inr(lo)} and ${inr(hi)}, depending on the model and whether you choose a budget aftermarket display, a premium OEM-grade display or Apple service. Prices are indicative as of ${SITE.updated}.`,
    },
    {
      q: `Can ${an(k.name)} be repaired at my home or office?`,
      a: `Yes. On ${SITE.name} you choose an Apple repair specialist by rating and experience, and they repair your ${k.name} at your doorstep in front of you. Most screen and battery jobs take ${k.time}.`,
    },
    {
      q: `Which ${k.name} repairs can be done at the doorstep?`,
      a: `${k.repairs.map((r) => r.noun).join(", ")}. Board-level faults and liquid damage need a workshop and are not done at the doorstep.`,
    },
    {
      q: `Are these genuine Apple parts?`,
      a: `No. Specialists on ${SITE.name} are independent and fit premium OEM-grade or budget aftermarket parts. For a genuine Apple part, or a device under warranty or AppleCare+, use an Apple Authorised Service Provider.`,
    },
  ];
}

export function DeviceHub({ kind }: { kind: Kind }) {
  const k = KINDS[kind];
  const list = ofKind(kind);
  const lo = Math.min(...list.map((m) => dquote(m, "display", "budget")!.lo));
  const hi = Math.max(...list.map((m) => m.apple));

  return (
    <main className="wrap page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <span>{k.name} repair</span>
      </nav>
      <h1>
        {k.name} repair at your doorstep: price list, India {SITE.year}
      </h1>
      <p className="muted updated">Updated {SITE.updated} · Indicative prices</p>
      <DeviceSwitch current={kind} />

      <div className="answer">
        <small className="tag">Quick answer</small>
        <p>
          {k.name} screen replacement in India costs between <strong>{inr(lo)}</strong> and <strong>{inr(hi)}</strong>, depending on the model and the part
          grade. On {SITE.name} you choose your own Apple specialist, and they repair the {k.name} at your doorstep in {k.time}.
        </p>
      </div>
      <ChooseStrip />

      <div className="two-col flip">
        <div>
          {families(kind).map((f) => (
            <section className="section" key={f}>
              <h2>{f}</h2>
              <div className="price-list">
                {list
                  .filter((m) => m.family === f)
                  .map((m) => (
                    <Link key={m.slug} href={dPath(m)} className="price-row">
                      <div>
                        <b>{m.name}</b>
                        <small className="muted">
                          {m.size} {m.panel} · screen
                        </small>
                      </div>
                      <dl>
                        <div>
                          <dt>Budget</dt>
                          <dd>{range(dquote(m, "display", "budget")!)}</dd>
                        </div>
                        <div>
                          <dt>Premium</dt>
                          <dd>{range(dquote(m, "display", "premium")!)}</dd>
                        </div>
                        <div>
                          <dt>Apple</dt>
                          <dd>{inr(m.apple)}</dd>
                        </div>
                      </dl>
                      <span className="chev" aria-hidden="true">›</span>
                    </Link>
                  ))}
              </div>
            </section>
          ))}
          <Faq items={hubFaqs(kind)} title={`${k.name} repair: common questions`} />
        </div>
        <aside className="side">
          <div className="card est-card">
            <h2 className="est-title">Your {k.name} price</h2>
            <Estimator kind={kind} />
          </div>
        </aside>
      </div>

      <JsonLd data={breadcrumbs([[`${k.name} repair`, k.path]])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${k.name} repair prices in India`,
          itemListElement: list.map((m, i) => ({ "@type": "ListItem", position: i + 1, name: `${m.name} repair`, url: SITE.url + dPath(m) })),
        }}
      />
    </main>
  );
}

// --------------------------------------------------------------- model page
export function dModelMeta(model: DModel, city?: City) {
  const place = city ? city.name : "India";
  const b = dquote(model, "display", "budget", city)!;
  return {
    title: {
      absolute: fit(
        [
          `${model.name} Screen Replacement Cost in ${place} (${SITE.year}) – from ${inr(b.lo)}`,
          `${model.name} Screen Replacement Cost in ${place} – from ${inr(b.lo)}`,
          `${model.name} Screen Replacement Cost in ${place} (${SITE.year})`,
          `${model.name} Screen Replacement Cost in ${place}`,
          `${model.name} Screen Repair Cost in ${place}`,
        ],
        TITLE_MAX
      ),
    },
    description: fit(
      [
        `${model.name} screen and battery repair at your doorstep in ${place}. Screen from ${inr(b.lo)}. Choose your Apple specialist by rating. Pay after the repair.`,
        `${model.name} screen and battery repair at your doorstep in ${place}. Screen from ${inr(b.lo)}. Choose your Apple specialist. Pay after repair.`,
        `${model.name} screen and battery repair in ${place}, at your doorstep. Screen from ${inr(b.lo)}. Pay after repair.`,
      ],
      DESC_MAX
    ),
    alternates: { canonical: dPath(model, city) },
  };
}

export function DeviceModelView({ model, city }: { model: DModel; city?: City }) {
  const k = KINDS[model.kind];
  const place = city ? city.name : "India";
  const q = (id: string, t: "apple" | "premium" | "budget") => dquote(model, id, t, city)!;
  const apple = q("display", "apple");
  const premium = q("display", "premium");
  const budget = q("display", "budget");
  const w = dWorth(model);
  const related = DMODELS.filter((x) => x.family === model.family && x.slug !== model.slug);
  const bars = [
    { t: TIERS[0], q: apple, part: "Genuine Apple part", where: "Apple service centre" },
    { t: TIERS[1], q: premium, part: k.parts.premium, where: "At your doorstep" },
    { t: TIERS[2], q: budget, part: k.parts.budget, where: "At your doorstep" },
  ];

  return (
    <main className="wrap page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <Link href={k.path}>{k.name} repair</Link> /{" "}
        {city ? <Link href={dPath(model)}>{model.name}</Link> : <span>{model.name}</span>}
        {city && <> / <span>{city.name}</span></>}
      </nav>

      <div className="two-col">
        <div>
          <h1>
            {model.name} screen replacement and repair cost in {place}
          </h1>
          <p className="muted updated">Updated {SITE.updated} · Indicative prices</p>
          <ul className="door-strip">
            <li>You choose your specialist</li>
            <li>Repaired at your doorstep</li>
            <li>{k.time}</li>
            <li>Pay after repair</li>
          </ul>

          <div className="answer">
            <small className="tag">Quick answer</small>
            <p>
              <strong>{model.name}</strong> screen replacement in {place} costs <strong>{range(budget)}</strong> with a budget aftermarket display,{" "}
              <strong>{range(premium)}</strong> with a premium OEM-grade display, and about <strong>{inr(apple.lo)}</strong> through Apple. With {SITE.name},
              an Apple specialist you choose fits the premium or budget part at your doorstep in {k.time}.
            </p>
          </div>

          <ul className="specs">
            <li>
              <small>Display</small>
              {model.size} {model.panel}
            </li>
            <li>
              <small>Launched</small>
              {model.year}
            </li>
            <li>
              <small>Resale value</small>~{inr(model.used)}
            </li>
          </ul>

          <section className="section">
            <h2>Screen price by repair option</h2>
            <div className="bars">
              {bars.map(({ t, q: bq, part, where }) => (
                <div className="bar-row" key={t.id}>
                  <div className="bar-head">
                    <span>{t.label}</span>
                    <b>{range(bq)}</b>
                  </div>
                  <div className="bar">
                    <i className={`bar-${t.id}`} style={{ width: `${Math.max(8, (bq.hi / apple.hi) * 100)}%` }} />
                  </div>
                  <small className="muted">
                    {where} · {part} · {t.warranty}
                  </small>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <h2>
              {model.name} repair price table{city ? `, ${city.name}` : ""}
            </h2>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Repair</th>
                    {TIERS.map((t) => (
                      <th key={t.id}>{tierName(t.id)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {k.repairs.map((r) => (
                    <tr key={r.id}>
                      <th>{r.label}</th>
                      {TIERS.map((t) => (
                        <td key={t.id}>{range(q(r.id, t.id))}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section">
            <small className="tag">The marketplace</small>
            <h2>
              Choose who repairs your {model.name}
              {city ? ` in ${city.name}` : ""}
            </h2>
            <p className="muted">Other services send whoever is free. Here you pick your specialist, ranked by what customers said after each repair.</p>
            <TechShowcase lockCity={city?.slug} href="#estimate" />
          </section>

          <section className="section">
            <h2>Is it worth repairing?</h2>
            <div className={`worth worth-${w.tone}`}>
              <div className="worth-top">
                <b>{w.title}</b>
                <span>{w.pct}% of device value</span>
              </div>
              <div className="meter">
                <i style={{ width: `${Math.min(100, w.pct)}%` }} />
              </div>
              <p>
                A premium display is about {inr(w.cost)} against a resale value of roughly {inr(model.used)}. {w.line}
              </p>
            </div>
          </section>

          <Faq items={dFaqs(model, city)} title={`${model.name} repair: common questions`} />

          <section className="section">
            <h2>{city ? `${model.name} prices in other cities` : `${model.name} repair price by city`}</h2>
            <div className="links">
              {CITIES.filter((c) => c.slug !== city?.slug).map((c) => (
                <Link key={c.slug} className="pill" href={dPath(model, c)}>
                  <span className="sr">{model.name} repair in </span>
                  {c.name}
                </Link>
              ))}
            </div>
            {related.length > 0 && (
              <>
                <h3>Other {model.family} models</h3>
                <div className="links">
                  {related.map((x) => (
                    <Link key={x.slug} className="pill" href={dPath(x, city)}>
                      {x.name}
                      <span className="sr"> repair{city ? ` in ${city.name}` : " cost"}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        <aside className="side" id="estimate">
          <div className="card est-card">
            <h2 className="est-title">Your doorstep price</h2>
            <Estimator lockedModel={model.slug} citySlug={city?.slug} />
          </div>
        </aside>
      </div>

      <div className="sticky-cta">
        <div>
          <small>Screen, at your doorstep from</small>
          <b>{inr(budget.lo)}</b>
        </div>
        <a className="btn" href="#estimate">
          Book now
        </a>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              name: `${model.name} screen replacement and repair`,
              serviceType: `Doorstep ${k.name} repair`,
              areaServed: city ? { "@type": "City", name: city.name } : { "@type": "Country", name: "India" },
              provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
              offers: { "@type": "AggregateOffer", priceCurrency: "INR", lowPrice: budget.lo, highPrice: apple.hi, offerCount: TIERS.length },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { name: "Home", item: SITE.url + "/" },
                { name: `${k.name} repair`, item: SITE.url + k.path },
                { name: model.name, item: SITE.url + dPath(model) },
                ...(city ? [{ name: city.name, item: SITE.url + dPath(model, city) }] : []),
              ].map((x, i) => ({ "@type": "ListItem", position: i + 1, ...x })),
            },
          ],
        }}
      />
    </main>
  );
}
