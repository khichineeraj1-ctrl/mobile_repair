import { breadcrumbs } from "@/lib/seo";
import EarningsEstimator from "@/components/EarningsEstimator";
import Faq, { JsonLd } from "@/components/Faq";
import PartnerForm from "@/components/PartnerForm";
import { CITIES, SITE, type QA } from "@/lib/data";
import { PARTNER_FEE_EXAMPLE } from "@/lib/partners";

export const metadata = {
  title: "Become a Repair Technician Partner",
  description: `Join ${SITE.name} as a phone repair technician. Get doorstep screen replacement jobs in your city, with sealed parts supplied. Apply in 2 minutes.`,
  alternates: { canonical: "/partners" },
};

const BENEFITS = [
  { n: "01", h: "We bring the customers", p: "People find us on Google and AI search, pick a slot and choose you. No marketing, no shop rent, no waiting for walk-ins." },
  { n: "02", h: "We bring the screen", p: "The exact screen for each job reaches you in a sealed kit. You never spend your own money on stock." },
  { n: "03", h: "Paid for every job", p: "A fixed fee for each completed repair, sent to your bank account every week. No chasing customers for money." },
];

const RULES = [
  { t: "Customers pay ScreenSahi, not you", s: "Never take cash or UPI directly. We collect, then pay you.", d: "M3 7h18v12H3zM3 11h18M7 15h4" },
  { t: "Use only the screen in the kit", s: "It is what the customer chose and what the warranty covers.", d: "M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8" },
  { t: "Repair in front of the customer", s: "The phone stays in their sight from start to finish.", d: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
  { t: "Ask for a rating before you leave", s: "The customer rates you on their own phone, and we ask them again privately the next day. Higher ratings put you first in the list and bring more bookings.", d: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" },
  { t: "You stand behind your work", s: "If a repair fails because of the fitting, you redo it free.", d: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zm-3 9l2 2 4-4" },
];

const FAQS: QA[] = [
  {
    q: "Who pays me, and when?",
    a: "ScreenSahi pays you. The customer pays us after the repair, and we send your fee for every completed job to your bank account each week.",
  },
  {
    q: "How do I get more bookings?",
    a: "Through your rating. Customers see technicians in order of the ratings earlier customers gave them, so a higher rating puts you nearer the top and brings more bookings. New technicians start in the middle of the list, not at the bottom.",
  },
  {
    q: "Do I need my own shop?",
    a: "No. All repairs happen at the customer’s home or office. You need repair experience, a phone with WhatsApp, and a way to travel in your city.",
  },
  {
    q: "Who provides the screen?",
    a: "We do. The screen the customer chose is supplied to you in a sealed kit before the visit, so you never buy stock yourself.",
  },
  {
    q: "What happens after I apply?",
    a: "We call you to fix a time to meet. You replace a screen on a practice phone, we check your ID in person, you do a few trial jobs, and then your profile goes live for customers to choose.",
  },
  {
    q: "Can I keep my current shop or job?",
    a: "Yes. You choose the slots and days you are free, and you only get jobs in those times.",
  },
];

export default function Page() {
  return (
    <main>
      <section className="phero">
        <div className="wrap">
          <span className="eyebrow">
            <i className="live-dot" />
            For phone repair technicians · {CITIES.length} cities
          </span>
          <h1>
            You repair the phone. <em>We bring the customers.</em>
          </h1>
          <p>Get doorstep screen replacement jobs near you. We send the customer, the address and the sealed screen. You do the repair and get paid every week.</p>
          <a className="btn" href="#apply">
            Apply in 2 minutes
          </a>
        </div>
      </section>

      <div className="wrap">
        <section className="section">
          <h2>Why technicians join</h2>
          <div className="tiers">
            {BENEFITS.map((b) => (
              <article key={b.n} className="tier tier-premium">
                <span className="tier-n">{b.n}</span>
                <h3>{b.h}</h3>
                <p>{b.p}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>What could you earn?</h2>
          <EarningsEstimator fee={PARTNER_FEE_EXAMPLE} />
        </section>

        <section className="section">
          <h2>How a job works</h2>
          <ol className="steps">
            <li>
              <b>A customer chooses you</b>
              <span>They see your profile, rating and experience, and pick you for their slot.</span>
            </li>
            <li>
              <b>You get the job on WhatsApp</b>
              <span>Phone model, repair, address and time. Accept it, and collect the sealed screen kit.</span>
            </li>
            <li>
              <b>Repair at the doorstep</b>
              <span>About 45 minutes, in front of the customer. They test the phone before you leave.</span>
            </li>
            <li>
              <b>Customer pays ScreenSahi, we pay you</b>
              <span>Your fee for the job is added to your weekly payout.</span>
            </li>
          </ol>
        </section>

        <section className="section">
          <h2>The five rules</h2>
          <p className="muted">These keep customers trusting the platform, which keeps jobs coming to you.</p>
          <ul className="assure">
            {RULES.map((r) => (
              <li key={r.t}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={r.d} />
                </svg>
                <div>
                  <b>{r.t}</b>
                  <span>{r.s}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="section narrow-col" id="apply">
          <h2>Apply to join</h2>
          <PartnerForm />
        </section>

        <Faq items={FAQS} title="Questions technicians ask" />
      </div>
      <JsonLd data={breadcrumbs([["Become a technician partner", "/partners"]])} />
    </main>
  );
}
