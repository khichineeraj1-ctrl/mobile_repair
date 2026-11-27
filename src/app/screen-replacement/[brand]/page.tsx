import Link from "next/link";
import { DeviceSwitch } from "@/components/DevicePages";
import { JsonLd } from "@/components/Faq";
import { breadcrumbs } from "@/lib/seo";
import { ChooseStrip } from "@/components/Marketplace";
import { MODELS, SERIES, SITE, inr, modelPath, quote, range } from "@/lib/data";

export const dynamicParams = false;
export const generateStaticParams = () => [{ brand: "apple" }];

export const metadata = {
  title: { absolute: `iPhone Screen Replacement Price List, India ${SITE.year}` },
  description: `Screen replacement cost for every iPhone from 11 to 17 in India. Compare Apple, premium and budget display prices, repaired at your doorstep.`,
  alternates: { canonical: "/screen-replacement/apple" },
};

export default function Page() {
  return (
    <main className="wrap page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <span>iPhone prices</span>
      </nav>
      <h1>iPhone screen replacement price list, India {SITE.year}</h1>
      <p className="muted updated">Updated {SITE.updated} · Indicative prices for a full display replacement</p>
      <DeviceSwitch current="iphone" />

      <div className="answer">
        <small className="tag">Quick answer</small>
        <p>
          iPhone screen replacement in India costs between <strong>{inr(Math.min(...MODELS.map((m) => quote(m, "display", "budget").lo)))}</strong> and{" "}
          <strong>{inr(Math.max(...MODELS.map((m) => m.apple)))}</strong>. The price depends on the model and on whether you choose a genuine Apple display, a
          premium OEM-grade display or a budget aftermarket display. On {SITE.name} you choose your own Apple specialist, and they fit the premium or budget
          screen at your doorstep.
        </p>
      </div>
      <ChooseStrip />

      {SERIES.map((s) => (
        <section className="section" key={s}>
          <h2>iPhone {s} {s === "SE" ? "" : "series"}</h2>
          <div className="price-list">
            {MODELS.filter((m) => m.series === s).map((m) => (
              <Link key={m.slug} href={modelPath(m)} className="price-row">
                <div>
                  <b>{m.name}</b>
                  <small className="muted">
                    {m.size} {m.panel}
                  </small>
                </div>
                <dl>
                  <div>
                    <dt>Budget</dt>
                    <dd>{range(quote(m, "display", "budget"))}</dd>
                  </div>
                  <div>
                    <dt>Premium</dt>
                    <dd>{range(quote(m, "display", "premium"))}</dd>
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

      <JsonLd data={breadcrumbs([["iPhone screen replacement", "/screen-replacement/apple"]])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "iPhone screen replacement prices in India",
          itemListElement: MODELS.map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${m.name} screen replacement`,
            url: SITE.url + modelPath(m),
          })),
        }}
      />
    </main>
  );
}
