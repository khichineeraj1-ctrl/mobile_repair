import Link from "next/link";
import Faq, { JsonLd } from "@/components/Faq";
import HelpForm from "@/components/HelpForm";
import { SITE, type QA } from "@/lib/data";
import { breadcrumbs } from "@/lib/seo";
import { TOPICS } from "@/lib/tickets";

export const metadata = {
  title: "Help and Support",
  description: `Get help with a ${SITE.name} doorstep repair: change a booking, payment questions, warranty claims. Raise a ticket and track it online, with no phone calls.`,
  alternates: { canonical: "/help" },
};

const FAQS: QA[] = [
  {
    q: "How do I change or cancel my booking?",
    a: "To move the visit, open your booking page and choose “Change day or time”. You can pick a new day and time yourself, and keep your specialist if they are free. To cancel or change the address, raise a ticket under “My booking or visit” with your booking reference.",
  },
  {
    q: "When and how do I pay?",
    a: `You pay ${SITE.name} only after the repair is done and you have tested your device. Do not pay the technician directly: a repair paid for directly is not covered by the warranty.`,
  },
  {
    q: "Something is wrong after the repair. What do I do?",
    a: "Raise a ticket under “Problem after the repair” and describe what you see. Faults in the part or the repair are covered for 6 months, and you pay nothing for a covered fault.",
  },
  {
    q: "What are the start code and end code?",
    a: "Two 4-digit codes on your booking page. You read the start code to the technician when they arrive, before they open your device, and the end code only after you have tested the repair. They tell us when the job started and finished.",
  },
  {
    q: "The technician asked me to pay them directly. Is that allowed?",
    a: `No. Raise a ticket under “About the technician”. The technician never sees your ticket, and what you report affects whether they stay on ${SITE.name}.`,
  },
  {
    q: "How will I know my ticket is resolved?",
    a: "Your ticket page shows every reply and changes to “Resolved” when the issue is closed. You can open it any time with your ticket number and the last 4 digits of your mobile number. If the fix did not work, write back on the same page and the ticket reopens.",
  },
];

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const booking = ((await searchParams).booking ?? "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 12);
  return (
    <main className="wrap page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <span>Help</span>
      </nav>
      <h1>Help and support</h1>
      <p className="muted lead">Tell us in writing. You get a ticket number, we reply on your ticket page, and you can see when it is resolved. No calls.</p>

      <div className="helpgrid">
        <HelpForm topics={TOPICS.map((t) => ({ id: t.id, label: t.label, hint: t.hint }))} bookingId={booking} />
        <div>
          <ol className="steps helpsteps">
            <li>
              <b>Raise a ticket</b>
              <span>Pick a topic and describe the problem. It takes a minute.</span>
            </li>
            <li>
              <b>Get your ticket number</b>
              <span>Your private ticket page opens straight away.</span>
            </li>
            <li>
              <b>Read our reply there</b>
              <span>Write back on the same page if you need to.</span>
            </li>
            <li>
              <b>See it resolved</b>
              <span>The page shows “Resolved” when the issue is closed.</span>
            </li>
          </ol>
          <Faq items={FAQS} title="Quick answers" />
        </div>
      </div>
      <JsonLd data={breadcrumbs([["Help and support", "/help"]])} />
    </main>
  );
}
