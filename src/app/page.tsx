import Link from "next/link";
import Estimator from "@/components/Estimator";
import HeroInteractive from "@/components/HeroInteractive";
import { Compare } from "@/components/Marketplace";
import ReviewStrip from "@/components/ReviewStrip";
import TechShowcase from "@/components/TechShowcase";
import Faq, { JsonLd } from "@/components/Faq";
import PhoneArt from "@/components/PhoneArt";
import { CITIES, DEVICES, HOME_FAQS, MODELS, SITE, TIERS, inr, modelPath, quote } from "@/lib/data";

const POPULAR = ["iphone-15", "iphone-13", "iphone-14", "iphone-16", "iphone-11", "iphone-15-pro-max", "iphone-12", "iphone-16-pro"];

export default function Home() {
  const popular = POPULAR.map((s) => MODELS.find((m) => m.slug === s)!);
  return (
    <main>
      <section className="hero">
        <div className="wrap hero-in">
          <div className="hero-copy">
            <span className="eyebrow">
              <i className="live-dot" />
              Apple repair marketplace · {CITIES.length} cities
            </span>
            <h1>
              iPhone screen replaced <em>at your doorstep.</em>
            </h1>
            <p className="usp-line">
              <b>Not another repair company.</b> You pick your Apple specialist.
            </p>
            <HeroInteractive />
          </div>
          <div className="card est-card">
            <Estimator />
          </div>
        </div>
      </section>

      <div className="wrap">
        <section className="section">
          <small className="tag">The marketplace</small>
          <h2>Choose your Apple specialist</h2>
          <p className="muted lead">
            Other services send whoever is free. Here you see who is coming before you book, ranked by the ratings customers gave them after each repair.
          </p>
          <TechShowcase />
        </section>

        <ReviewStrip />

        <section className="section">
          <h2>What is different here</h2>
          <Compare />
        </section>

        <section className="section">
          <h2>How doorstep repair works</h2>
          <div className="door">
            <div className="track">
              <svg viewBox="0 0 320 190" role="img" aria-label="Illustration of a technician travelling to your address">
                <g className="track-grid">
                  <path d="M0 50H320M0 110H320M0 160H320M60 0V190M140 0V190M230 0V190" />
                </g>
                <path id="route" className="track-route" d="M34 150 C 90 150, 84 78, 150 84 S 236 140, 280 54" />
                <circle cx="34" cy="150" r="6" className="track-start" />
                <g transform="translate(280 54)">
                  <circle r="20" className="track-halo" />
                  <path d="M-11 2 L0 -9 L11 2 V11 H-11 Z" className="track-home" />
                </g>
                <circle r="7" className="track-rider">
                  <animateMotion dur="5s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.8;1" calcMode="linear">
                    <mpath href="#route" />
                  </animateMotion>
                </circle>
              </svg>
              <div className="track-chip">
                <i className="live-dot" />
                Technician on the way
              </div>
              <div className="track-foot">
                <b>Your address</b>
                <span>Screen and tools arrive in a sealed kit</span>
              </div>
            </div>
            <ol className="steps">
              <li>
                <b>See your price</b>
                <span>Pick your iPhone and screen grade. The price is fixed before you book.</span>
              </li>
              <li>
                <b>Pick a slot and your specialist</b>
                <span>Home or office, at a time that suits you, with the person you choose.</span>
              </li>
              <li>
                <b>Your specialist comes to you</b>
                <span>ID-verified, skill-tested, and carrying the exact screen you chose.</span>
              </li>
              <li>
                <b>Fixed in front of you</b>
                <span>About 45 minutes. Test touch, display and Face ID, then pay.</span>
              </li>
            </ol>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>Popular right now</h2>
            <Link href="/screen-replacement/apple">All prices ›</Link>
          </div>
          <div className="rail cards">
            {popular.map((m) => (
              <Link key={m.slug} href={modelPath(m)} className="model-card">
                <PhoneArt variant="fixed" />
                <b>{m.name}</b>
                <small className="muted">Doorstep from</small>
                <span className="from">{inr(quote(m, "display", "budget").lo)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <Link href="/diagnose" className="banner">
            <div>
              <small className="tag">60-second check</small>
              <h2>Glass only, or the whole display?</h2>
              <p>Answer 4 questions and find out which repair you actually need.</p>
              <span className="btn btn-sm">Diagnose my screen</span>
            </div>
            <PhoneArt variant="display" />
          </Link>
        </section>

        <section className="section">
          <h2>Choose your screen</h2>
          <div className="tiers">
            {TIERS.map((t, i) => (
              <article key={t.id} className={`tier tier-${t.id}`}>
                <span className="tier-n">0{i + 1}</span>
                <h3>{t.label}</h3>
                <p>{t.note}</p>
                <ul>
                  <li className="where">{t.where}</li>
                  <li>{t.part}</li>
                  <li>{t.time}</li>
                  <li>{t.warranty}</li>
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Doorstep repair in your city</h2>
          <div className="links">
            {CITIES.map((c) => (
              <Link key={c.slug} className="pill" href={`/screen-replacement/apple/iphone-15/${c.slug}`}>
                {c.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Every Apple device, one marketplace</h2>
          <div className="brands">
            {DEVICES.map((d) =>
              d.live ? (
                <Link key={d.slug} href={d.href} className="brand live">
                  <b>{d.name}</b>
                  <small>{d.note}</small>
                </Link>
              ) : (
                <div key={d.slug} className="brand">
                  <b>{d.name}</b>
                  <small>Coming soon</small>
                </div>
              )
            )}
          </div>
        </section>

        <section className="section">
          <Link href="/partners" className="banner partner-banner">
            <div>
              <small className="tag">For technicians</small>
              <h2>Repair phones? Get doorstep jobs.</h2>
              <p>We bring the customer and the sealed screen. You get paid every week.</p>
              <span className="btn btn-sm">Become a partner</span>
            </div>
          </Link>
        </section>

        <Faq items={HOME_FAQS} title="Choosing a specialist and doorstep repair: what people ask" />
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE.name,
          url: SITE.url,
          description: SITE.tagline,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE.name,
          url: SITE.url,
          logo: `${SITE.url}/icon.svg`,
          description: "A marketplace of independent Apple repair specialists in India. Customers choose their specialist and get doorstep repair.",
          areaServed: CITIES.map((c) => ({ "@type": "City", name: c.name })),
        }}
      />
    </main>
  );
}
