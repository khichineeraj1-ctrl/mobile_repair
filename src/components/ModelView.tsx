import Link from "next/link";
import {
  CITIES,
  DAMAGES,
  MODELS,
  SITE,
  TIERS,
  inr,
  modelFaqs,
  modelPath,
  quote,
  range,
  worthIt,
  type City,
  type Model,
} from "@/lib/data";
import Estimator from "./Estimator";
import Faq, { JsonLd } from "./Faq";
import { DESC_MAX, TITLE_MAX, fit } from "@/lib/seo";
import TechShowcase from "./TechShowcase";

export function modelMeta(model: Model, city?: City) {
  const place = city ? city.name : "India";
  const b = quote(model, "display", "budget", city);
  const a = quote(model, "display", "apple", city);
  return {
    title: {
      absolute: fit(
        [
          `${model.name} Screen Replacement Cost in ${place} (${SITE.year}) – from ${inr(b.lo)}`,
          `${model.name} Screen Replacement Cost in ${place} – from ${inr(b.lo)}`,
          `${model.name} Screen Replacement Cost in ${place} (${SITE.year})`,
          `${model.name} Screen Replacement Cost in ${place}`,
        ],
        TITLE_MAX
      ),
    },
    description: fit(
      [
        `${model.name} screen replacement at your doorstep in ${place}: ${inr(b.lo)} to ${inr(a.lo)} by part quality. Choose your Apple specialist by rating. Pay after the repair.`,
        `${model.name} screen replacement at your doorstep in ${place}: ${inr(b.lo)} to ${inr(a.lo)}. Choose your Apple specialist by rating. Pay after repair.`,
        `${model.name} screen replacement in ${place}: ${inr(b.lo)} to ${inr(a.lo)}. Choose your Apple specialist. Pay after repair.`,
      ],
      DESC_MAX
    ),
    alternates: { canonical: modelPath(model, city) },
  };
}

export default function ModelView({ model, city }: { model: Model; city?: City }) {
  const place = city ? city.name : "India";
  const apple = quote(model, "display", "apple", city);
  const premium = quote(model, "display", "premium", city);
  const budget = quote(model, "display", "budget", city);
  const w = worthIt(model);
  const related = MODELS.filter((x) => x.series === model.series && x.slug !== model.slug);
  const bars = [
    { t: TIERS[0], q: apple },
    { t: TIERS[1], q: premium },
    { t: TIERS[2], q: budget },
  ];

  return (
    <main className="wrap page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <Link href="/screen-replacement/apple">iPhone prices</Link> /{" "}
        {city ? <Link href={modelPath(model)}>{model.name}</Link> : <span>{model.name}</span>}
        {city && <> / <span>{city.name}</span></>}
      </nav>

      <div className="two-col">
        <div>
          <h1>
            {model.name} screen replacement cost in {place}
          </h1>
          <p className="muted updated">Updated {SITE.updated} · Indicative prices</p>
          <ul className="door-strip">
            <li>You choose your specialist</li>
            <li>Replaced at your doorstep</li>
            <li>About 45 min</li>
            <li>Pay after repair</li>
          </ul>

          {/* Answer-first block: the paragraph AI engines and featured snippets lift. */}
          <div className="answer">
            <small className="tag">Quick answer</small>
            <p>
              <strong>{model.name}</strong> screen replacement in {place} costs <strong>{range(budget)}</strong> with a budget aftermarket display,{" "}
              <strong>{range(premium)}</strong> with a premium OEM-grade display, and about <strong>{inr(apple.lo)}</strong> at an Apple Authorised Service
              Provider. With {SITE.name}, you choose your own Apple specialist and they fit the premium or budget screen at your doorstep in about 45 minutes; Apple takes same day to 3 days at a
              service centre.
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
            <h2>Price by repair option</h2>
            <div className="bars">
              {bars.map(({ t, q }) => (
                <div className="bar-row" key={t.id}>
                  <div className="bar-head">
                    <span>{t.label}</span>
                    <b>{range(q)}</b>
                  </div>
                  <div className="bar">
                    <i className={`bar-${t.id}`} style={{ width: `${Math.max(8, (q.hi / apple.hi) * 100)}%` }} />
                  </div>
                  <small className="muted">
                    {t.where} · {t.part} · {t.warranty}
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
                    <th>Damage</th>
                    {TIERS.map((t) => (
                      <th key={t.id}>{t.short}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAMAGES.map((d) => (
                    <tr key={d.id}>
                      <th>{d.label}</th>
                      {TIERS.map((t) => (
                        <td key={t.id}>{range(quote(model, d.id, t.id, city))}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted small">
              Apple replaces the full display assembly even when only the glass is cracked, so its glass and display prices are the same.
            </p>
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
                <span>{w.pct}% of phone value</span>
              </div>
              <div className="meter">
                <i style={{ width: `${Math.min(100, w.pct)}%` }} />
              </div>
              <p>
                A premium display is about {inr(w.cost)} against a resale value of roughly {inr(model.used)}. {w.line}
              </p>
            </div>
          </section>

          {city && (
            <section className="section">
              <h2>Where to repair in {city.name}</h2>
              <p>
                The easiest option is doorstep repair: a technician comes to your home or office anywhere in {city.name} and replaces the screen in front of
                you.
              </p>
              <p>
                Apart from Apple Authorised Service Providers, the main repair hubs in {city.name} are {city.markets}. Compare the part grade and the written
                warranty, not just the headline price, and ask the shop to show the old part being removed.
              </p>
            </section>
          )}

          <Faq items={modelFaqs(model, city)} title={`${model.name} screen repair: common questions`} />

          <section className="section">
            <h2>{city ? `${model.name} prices in other cities` : `${model.name} screen price by city`}</h2>
            <div className="links">
              {CITIES.filter((c) => c.slug !== city?.slug).map((c) => (
                <Link key={c.slug} className="pill" href={modelPath(model, c)}>
                  <span className="sr">{model.name} screen replacement in </span>
                  {c.name}
                </Link>
              ))}
            </div>
            {related.length > 0 && (
              <>
                <h3>Other iPhone {model.series} models</h3>
                <div className="links">
                  {related.map((x) => (
                    <Link key={x.slug} className="pill" href={modelPath(x, city)}>
                      {x.name}
                      <span className="sr"> screen replacement{city ? ` in ${city.name}` : " cost"}</span>
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
          <small>{model.name} · at your doorstep from</small>
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
              name: `${model.name} screen replacement`,
              serviceType: "Doorstep mobile phone screen replacement",
              areaServed: city ? { "@type": "City", name: city.name } : { "@type": "Country", name: "India" },
              provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
              offers: {
                "@type": "AggregateOffer",
                priceCurrency: "INR",
                lowPrice: budget.lo,
                highPrice: apple.hi,
                offerCount: TIERS.length,
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { name: "Home", item: SITE.url + "/" },
                { name: "iPhone screen replacement", item: SITE.url + "/screen-replacement/apple" },
                { name: model.name, item: SITE.url + modelPath(model) },
                ...(city ? [{ name: city.name, item: SITE.url + modelPath(model, city) }] : []),
              ].map((x, i) => ({ "@type": "ListItem", position: i + 1, ...x })),
            },
          ],
        }}
      />
    </main>
  );
}
