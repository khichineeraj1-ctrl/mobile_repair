import { breadcrumbs } from "@/lib/seo";
import Link from "next/link";
import Faq, { JsonLd } from "@/components/Faq";
import { Compare } from "@/components/Marketplace";
import TechShowcase from "@/components/TechShowcase";
import { HOME_FAQS, SITE, type QA } from "@/lib/data";

export const metadata = {
  title: { absolute: `How ${SITE.name} Works: Choose Your Apple Repair Specialist` },
  description: `${SITE.name} is a marketplace, not a repair company. Choose an Apple repair specialist by rating, get a doorstep repair, and pay after it is done.`,
  alternates: { canonical: "/how-it-works" },
};

const ROLES = [
  { n: "You", h: "Choose and decide", p: "Pick the repair, the part grade, the time and the specialist. Watch the repair, test the device, then pay.", c: "tier-budget" },
  { n: "The specialist", h: "Repairs at your doorstep", p: "An independent Apple repair technician. Their place in the list depends on what customers say about them.", c: "tier-premium" },
  { n: SITE.name, h: "Runs the marketplace", p: "Checks every specialist’s ID and skills, fixes the price before the visit, collects payment after the repair, and stands behind the warranty.", c: "" },
];

const FAQS: QA[] = [
  {
    q: `Is ${SITE.name} a repair company?`,
    a: `No. ${SITE.name} is a marketplace. Independent Apple repair specialists list on it, and you choose which one repairs your device. ${SITE.name} verifies them, fixes the price, collects payment after the repair and backs the warranty.`,
  },
  ...HOME_FAQS.filter((f) => /choose who|ranked|authorised/.test(f.q)),
  {
    q: "Why pay the marketplace and not the technician?",
    a: `Paying ${SITE.name} is what activates your warranty and puts the repair on record. If a specialist asks you to pay them directly or offers a discount for cash, the repair is not covered, and you can tell us in the private follow-up the next day.`,
  },
];

export default function Page() {
  return (
    <main className="wrap page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <span>How it works</span>
      </nav>
      <h1>A marketplace, not a repair company</h1>

      <div className="answer">
        <small className="tag">In one paragraph</small>
        <p>
          <strong>{SITE.name} is a marketplace of independent Apple repair specialists.</strong> You choose one by customer rating and experience. They repair
          your iPhone, iPad, MacBook or Apple Watch at your doorstep, in front of you. You pay {SITE.name} after the repair, and you rate the specialist, which decides who
          gets the next booking.
        </p>
      </div>

      <section className="section">
        <h2>Four steps</h2>
        <ol className="steps">
          <li>
            <b>You choose who comes</b>
            <span>See the specialists free in your area, ranked by customer ratings.</span>
          </li>
          <li>
            <b>They repair in front of you</b>
            <span>At your home or office. Your device never leaves your sight.</span>
          </li>
          <li>
            <b>You pay {SITE.name}, after the repair</b>
            <span>Not the technician. Paying us is what starts your warranty.</span>
          </li>
          <li>
            <b>You rate them, twice</b>
            <span>At the door, and privately the next day. The private rating is the one that counts.</span>
          </li>
        </ol>
      </section>

      <section className="section">
        <h2>Who does what</h2>
        <div className="tiers">
          {ROLES.map((r) => (
            <article key={r.n} className={`tier ${r.c}`}>
              <span className="tier-n">{r.n}</span>
              <h3>{r.h}</h3>
              <p>{r.p}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>What is different here</h2>
        <Compare />
      </section>

      <section className="section">
        <h2>Meet the specialists</h2>
        <TechShowcase />
      </section>

      <Faq items={FAQS} title="Questions about the marketplace" />
      <JsonLd data={breadcrumbs([["How it works", "/how-it-works"]])} />
    </main>
  );
}
