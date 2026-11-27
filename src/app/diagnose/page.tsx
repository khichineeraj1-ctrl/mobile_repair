import { JsonLd } from "@/components/Faq";
import { breadcrumbs } from "@/lib/seo";
import Diagnose from "@/components/Diagnose";

export const metadata = {
  title: "iPhone Screen Damage Checker: Glass or Display?",
  description: "Answer 4 quick questions to find out whether your cracked iPhone needs a glass-only repair or a full display replacement, and what it should cost in India.",
  alternates: { canonical: "/diagnose" },
};

export default function Page() {
  return (
    <main className="wrap page narrow">
      <h1>What does your screen actually need?</h1>
      <p className="muted">Four questions. No login. Tells you which repair to ask for, so nobody upsells you.</p>
      <Diagnose />
      <section className="section">
        <h2>How to tell glass damage from display damage</h2>
        <p>
          An iPhone screen is a stack: toughened glass on top, a touch layer, and the OLED or LCD panel that makes the picture. If the picture is perfect and touch
          works everywhere, only the glass is broken. Coloured lines, black or purple blotches, flicker and dead touch zones all mean the panel underneath is
          damaged, and the whole display assembly has to be replaced.
        </p>
      </section>
      <JsonLd data={breadcrumbs([["Damage checker", "/diagnose"]])} />
    </main>
  );
}
