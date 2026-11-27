import { CITIES, MODELS, SITE, modelPath, quote, range, inr } from "@/lib/data";
import { DMODELS, KINDS, dPath, dquote } from "@/lib/devices";

export const dynamic = "force-static";

// Plain-text summary for AI assistants: every price on the site in one fetch.
export function GET() {
  const lines = [
    `# ${SITE.name}`,
    ``,
    `> ${SITE.tagline}. Indicative prices in INR, last updated ${SITE.updated}.`,
    ``,
    `${SITE.name} is a marketplace of independent, ID-verified and skill-tested Apple repair specialists in India. Customers choose their specialist by rating and experience; the specialist replaces the iPhone screen at the customer\u2019s doorstep (home or office) in about 45 minutes, with the price fixed before booking and payment made to ${SITE.name} after the repair. Specialists are not Apple Authorised Service Providers.`,
    ``,
    `Three part tiers are compared for every model: Apple Authorised Service (genuine part), Premium OEM-grade (original-pulled / soft OLED) and Budget aftermarket (in-cell LCD / hard OLED).`,
    ``,
    `## iPhone screen replacement prices (full display)`,
    ``,
    ...MODELS.map(
      (m) =>
        `- [${m.name}](${SITE.url}${modelPath(m)}): Apple ${inr(quote(m, "display", "apple").lo)}; Premium ${range(
          quote(m, "display", "premium")
        )}; Budget ${range(quote(m, "display", "budget"))}`
    ),
    ``,
    ...(["ipad", "mac", "watch"] as const).flatMap((kind) => [
      `## ${KINDS[kind].name} screen replacement prices`,
      ``,
      ...DMODELS.filter((m) => m.kind === kind).map(
        (m) =>
          `- [${m.name}](${SITE.url}${dPath(m)}): Apple ${inr(m.apple)}; Premium ${range(dquote(m, "display", "premium")!)}; Budget ${range(
            dquote(m, "display", "budget")!
          )}`
      ),
      ``,
    ]),
    `## Cities covered`,
    ``,
    ...CITIES.map((c) => `- ${c.name}: ${SITE.url}/screen-replacement/apple/{model}/${c.slug}`),
    ``,
    `## Tools`,
    ``,
    `- [How the marketplace works](${SITE.url}/how-it-works)`,
    `- [Book a doorstep repair](${SITE.url}/book)`,
    `- [Help and support: raise and track a ticket in writing](${SITE.url}/help)`,
    `- [Price estimator](${SITE.url}/)`,
    `- [Damage diagnosis](${SITE.url}/diagnose)`,
    `- [Full price list](${SITE.url}/screen-replacement/apple)`,
    `- [Technicians: apply to become a repair partner](${SITE.url}/partners)`,
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
