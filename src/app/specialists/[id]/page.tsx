import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/Faq";
import { CITIES, SITE } from "@/lib/data";
import { liveTechnicians, listRatings } from "@/lib/ratings";
import { publicReviews } from "@/lib/reviews";
import { roster } from "@/lib/roster";
import { breadcrumbs } from "@/lib/seo";
import { DEMO_TECHNICIANS, initials } from "@/lib/technicians";

export const dynamic = "force-dynamic";

type P = { params: Promise<{ id: string }> };
const find = async (id: string) => (await roster()).find((t) => t.id === id && !t.paused);

export async function generateMetadata({ params }: P) {
  const t = await find((await params).id);
  if (!t) return {};
  const city = CITIES.find((c) => c.slug === t.city)?.name ?? "";
  return {
    title: `${t.name}, Apple Repair Specialist in ${city}`,
    description: `${t.name} repairs iPhone, iPad, MacBook and Apple Watch at your doorstep in ${city}. Read customer reviews and book through ${SITE.name}.`,
    alternates: { canonical: `/specialists/${t.id}` },
    // Sample profiles are invented people, so they stay out of search engines.
    robots: t.added ? undefined : { index: false, follow: true },
  };
}

const date = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// A specialist's public profile: who they are, and what customers said at the
// door. The private next-day feedback is never shown here.
export default async function Page({ params }: P) {
  const base = await find((await params).id);
  if (!base) notFound();
  const city = CITIES.find((c) => c.slug === base.city)!;
  const ranked = await liveTechnicians(city.slug, undefined, undefined, 99);
  const pos = ranked.findIndex((x) => x.id === base.id);
  const t = ranked[pos] ?? { ...base, rank: 0 };
  const first = t.name.split(" ")[0];

  const mine = (await listRatings()).filter((r) => r.technicianId === t.id); // every door rating, for the counts
  const reviews = (await publicReviews()).filter((r) => r.techId === t.id);
  const counts = [5, 4, 3, 2, 1].map((n) => ({ n, c: mine.filter((r) => r.stars === n).length }));
  const tagCounts = [...new Set(reviews.flatMap((r) => r.tags))].map((tag) => ({ tag, c: reviews.filter((r) => r.tags.includes(tag)).length })).sort((a, b) => b.c - a.c);
  const sample = DEMO_TECHNICIANS && !t.added;

  return (
    <main className="wrap page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <Link href="/how-it-works">Specialists</Link> / <span>{t.name}</span>
      </nav>

      <div className="profile">
        <div className="profile-main">
          <header className="card profile-head">
            <span className="avatar xl" style={{ background: `hsl(${t.hue} 62% 42%)` }} aria-hidden="true">
              {initials(t.name)}
            </span>
            <div>
              <h1>{t.name}</h1>
              <p className="muted">
                Apple repair specialist in {city.name}
                {pos >= 0 ? ` · ranked #${pos + 1} of ${ranked.length} by customer ratings` : ""}
              </p>
              <div className="tech-tags">
                <i className="ok">✓ ID verified</i>
                <i className="ok">✓ Skill tested</i>
                <i>{t.langs.join(", ")}</i>
              </div>
            </div>
          </header>

          <div className="profile-stats">
            <div className="card">
              <b>{t.rating ? `★ ${t.rating.toFixed(1)}` : "New"}</b>
              <small>{t.rating ? "average rating" : "no ratings yet"}</small>
            </div>
            <div className="card">
              <b>{t.jobs}</b>
              <small>repairs with {SITE.name}</small>
            </div>
            <div className="card">
              <b>{t.years} yrs</b>
              <small>repair experience</small>
            </div>
          </div>
          {sample && (
            <p className="callout">
              This is a sample profile shown while specialists are being onboarded. The rating and repair count above are placeholders; the reviews below are
              real ones from bookings.
            </p>
          )}

          <section className="section">
            <h2>
              Customer reviews <span className="muted">({mine.length})</span>
            </h2>
            {mine.length === 0 ? (
              <p className="muted">No reviews yet. {first} is new on {SITE.name}; every specialist is ID-verified and skill-tested before their first booking.</p>
            ) : (
              <>
                <div className="card rv-summary">
                  <div className="rv-bars">
                    {counts.map((x) => (
                      <div key={x.n}>
                        <span>{x.n} ★</span>
                        <i>
                          <u style={{ width: `${(x.c / mine.length) * 100}%` }} />
                        </i>
                        <b>{x.c}</b>
                      </div>
                    ))}
                  </div>
                  {tagCounts.length > 0 && (
                    <div className="rv-tags">
                      <small>Customers mention</small>
                      <div className="tech-tags">
                        {tagCounts.map((x) => (
                          <i key={x.tag}>
                            {x.tag} · {x.c}
                          </i>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="rv-list">
                  {reviews.map((r) => (
                    <article key={r.bookingId} className="card review">
                      <div className="rv-stars" aria-label={`${r.stars} out of 5`}>
                        {"★".repeat(r.stars)}
                        <span>{"★".repeat(5 - r.stars)}</span>
                      </div>
                      {r.comment && <p>“{r.comment}”</p>}
                      {r.tags.length > 0 && (
                        <div className="tech-tags">
                          {r.tags.map((x) => (
                            <i key={x}>{x}</i>
                          ))}
                        </div>
                      )}
                      <small>
                        <b>{r.name}</b>
                        {r.device ? ` · ${r.device}` : ""} · {date(r.at)}
                      </small>
                    </article>
                  ))}
                </div>
              </>
            )}
            <p className="muted small">
              Only customers with a completed booking can review, once per booking. {SITE.name} does not edit reviews; it removes only abuse or personal details.
            </p>
          </section>
        </div>

        <aside className="card profile-cta">
          <h2>Book {first}</h2>
          <p className="muted">
            {first} comes to your home or office in {city.name} and repairs your device in front of you. You pay {SITE.name} after the repair.
          </p>
          <Link className="btn wide" href={`/book?tech=${t.id}`}>
            Book with {first}
          </Link>
          <Link className="btn ghost wide" href="/how-it-works">
            How {SITE.name} works
          </Link>
        </aside>
      </div>
      <JsonLd data={breadcrumbs([[t.name, `/specialists/${t.id}`]])} />
    </main>
  );
}
