import type { QA } from "@/lib/data";

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// Native <details> so answers are in the HTML for crawlers and AI engines,
// with FAQPage structured data alongside.
export default function Faq({ items, title = "Common questions" }: { items: QA[]; title?: string }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      <div className="faq">
        {items.map((x, i) => (
          <details key={x.q} open={i === 0}>
            <summary>{x.q}</summary>
            <p>{x.a}</p>
          </details>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((x) => ({
            "@type": "Question",
            name: x.q,
            acceptedAnswer: { "@type": "Answer", text: x.a },
          })),
        }}
      />
    </section>
  );
}
