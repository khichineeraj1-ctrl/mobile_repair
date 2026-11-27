// ---------------------------------------------------------------------------
// iPad, MacBook and Apple Watch catalogue. iPhone lives in data.ts.
//
// !! PRICES ARE PLACEHOLDERS !!  `apple` (Apple's out-of-warranty reference
// price for a display repair) and `used` (resale value) are rough estimates,
// and the multipliers below are a stand-in pricing model. Replace with
// verified numbers before launch.
// ---------------------------------------------------------------------------
import { SITE, an, inr, range, type City, type QA, type Quote, type TierId } from "./data";

export type Kind = "ipad" | "mac" | "watch";

export type DModel = {
  slug: string;
  name: string;
  kind: Kind;
  family: string;
  year: number;
  size: string;
  panel: string;
  apple: number;
  used: number;
};

export type Repair = { id: string; label: string; desc: string; noun: string; m: Record<TierId, [number, number]> };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const d = (kind: Kind, family: string, name: string, year: number, size: string, panel: string, apple: number, used: number): DModel => ({
  slug: slugify(name),
  name,
  kind,
  family,
  year,
  size,
  panel,
  apple,
  used,
});

export const DMODELS: DModel[] = [
  d("ipad", "iPad Pro", "iPad Pro 13-inch (M4)", 2024, "13″", "OLED", 75000, 95000),
  d("ipad", "iPad Pro", "iPad Pro 11-inch (M4)", 2024, "11″", "OLED", 55000, 70000),
  d("ipad", "iPad Pro", "iPad Pro 12.9-inch (6th gen)", 2022, "12.9″", "mini-LED", 60000, 65000),
  d("ipad", "iPad Pro", "iPad Pro 11-inch (4th gen)", 2022, "11″", "LCD", 42000, 48000),
  d("ipad", "iPad Air", "iPad Air 13-inch (M2)", 2024, "13″", "LCD", 42000, 55000),
  d("ipad", "iPad Air", "iPad Air 11-inch (M2)", 2024, "11″", "LCD", 36000, 42000),
  d("ipad", "iPad Air", "iPad Air (5th gen)", 2022, "10.9″", "LCD", 33000, 34000),
  d("ipad", "iPad", "iPad (10th gen)", 2022, "10.9″", "LCD", 24000, 24000),
  d("ipad", "iPad", "iPad (9th gen)", 2021, "10.2″", "LCD", 19000, 17000),
  d("ipad", "iPad mini", "iPad mini (A17 Pro)", 2024, "8.3″", "LCD", 30000, 36000),
  d("ipad", "iPad mini", "iPad mini (6th gen)", 2021, "8.3″", "LCD", 28000, 27000),
  d("mac", "MacBook Air", "MacBook Air 13-inch (M4)", 2025, "13.6″", "Liquid Retina", 45000, 82000),
  d("mac", "MacBook Air", "MacBook Air 15-inch (M3)", 2024, "15.3″", "Liquid Retina", 52000, 95000),
  d("mac", "MacBook Air", "MacBook Air 13-inch (M3)", 2024, "13.6″", "Liquid Retina", 45000, 75000),
  d("mac", "MacBook Air", "MacBook Air 13-inch (M2)", 2022, "13.6″", "Liquid Retina", 45000, 62000),
  d("mac", "MacBook Air", "MacBook Air (M1)", 2020, "13.3″", "Retina", 38000, 45000),
  d("mac", "MacBook Pro", "MacBook Pro 14-inch (M4)", 2024, "14.2″", "Liquid Retina XDR", 70000, 135000),
  d("mac", "MacBook Pro", "MacBook Pro 16-inch (M3 Pro)", 2023, "16.2″", "Liquid Retina XDR", 80000, 170000),
  d("mac", "MacBook Pro", "MacBook Pro 14-inch (M3)", 2023, "14.2″", "Liquid Retina XDR", 70000, 120000),
  d("mac", "MacBook Pro", "MacBook Pro 14-inch (M1 Pro)", 2021, "14.2″", "Liquid Retina XDR", 68000, 85000),
  d("mac", "MacBook Pro", "MacBook Pro 13-inch (M2)", 2022, "13.3″", "Retina", 42000, 65000),
  d("mac", "MacBook Pro", "MacBook Pro 13-inch (M1)", 2020, "13.3″", "Retina", 40000, 50000),
  d("watch", "Apple Watch Ultra", "Apple Watch Ultra 3", 2025, "49 mm", "OLED", 46000, 68000),
  d("watch", "Apple Watch Ultra", "Apple Watch Ultra 2", 2023, "49 mm", "OLED", 45000, 52000),
  d("watch", "Apple Watch Ultra", "Apple Watch Ultra", 2022, "49 mm", "OLED", 42000, 38000),
  d("watch", "Apple Watch Series", "Apple Watch Series 11", 2025, "46 mm", "OLED", 31000, 38000),
  d("watch", "Apple Watch Series", "Apple Watch Series 10", 2024, "46 mm", "OLED", 30000, 30000),
  d("watch", "Apple Watch Series", "Apple Watch Series 9", 2023, "45 mm", "OLED", 28000, 24000),
  d("watch", "Apple Watch Series", "Apple Watch Series 8", 2022, "45 mm", "OLED", 26000, 19000),
  d("watch", "Apple Watch Series", "Apple Watch Series 7", 2021, "45 mm", "OLED", 24000, 15000),
  d("watch", "Apple Watch Series", "Apple Watch Series 6", 2020, "44 mm", "OLED", 22000, 11000),
  d("watch", "Apple Watch SE", "Apple Watch SE (2nd gen)", 2022, "44 mm", "OLED", 18000, 13000),
  d("watch", "Apple Watch SE", "Apple Watch SE (1st gen)", 2020, "44 mm", "OLED", 16000, 8000),
];

export const getDModel = (slug: string) => DMODELS.find((x) => x.slug === slug);

export type KindInfo = {
  kind: Kind;
  path: string;
  name: string;
  time: string;
  parts: { premium: string; budget: string };
  appleNote: string;
  repairs: Repair[];
};

export const KINDS: Record<Kind, KindInfo> = {
  ipad: {
    kind: "ipad",
    path: "/ipad-repair",
    name: "iPad",
    time: "45–75 min",
    parts: { premium: "OEM-grade / original-pulled part", budget: "Aftermarket part" },
    appleNote: "Genuine Apple service. For screen damage Apple usually replaces the whole iPad for a flat fee instead of fitting a new screen.",
    repairs: [
      { id: "display", label: "Display damaged", desc: "Lines, spots or black screen", noun: "screen replacement", m: { apple: [1, 1], premium: [0.45, 0.6], budget: [0.25, 0.38] } },
      { id: "glass", label: "Cracked glass", desc: "Picture & touch still work", noun: "glass replacement", m: { apple: [1, 1], premium: [0.3, 0.42], budget: [0.18, 0.28] } },
      { id: "battery", label: "Battery", desc: "Drains fast or won’t charge", noun: "battery replacement", m: { apple: [0.4, 0.4], premium: [0.14, 0.2], budget: [0.09, 0.13] } },
    ],
  },
  mac: {
    kind: "mac",
    path: "/macbook-repair",
    name: "MacBook",
    time: "60–90 min",
    parts: { premium: "OEM-grade / original-pulled part", budget: "Aftermarket part" },
    appleNote: "Genuine Apple service. Apple replaces the full display assembly or top case with genuine parts.",
    repairs: [
      { id: "display", label: "Display damaged", desc: "Cracks, lines or black screen", noun: "screen replacement", m: { apple: [1, 1], premium: [0.5, 0.68], budget: [0.32, 0.45] } },
      { id: "battery", label: "Battery", desc: "Service warning or short life", noun: "battery replacement", m: { apple: [0.42, 0.42], premium: [0.14, 0.2], budget: [0.09, 0.13] } },
      { id: "keyboard", label: "Keyboard", desc: "Keys stuck or not typing", noun: "keyboard replacement", m: { apple: [0.7, 0.7], premium: [0.2, 0.3], budget: [0.12, 0.18] } },
    ],
  },
  watch: {
    kind: "watch",
    path: "/apple-watch-repair",
    name: "Apple Watch",
    time: "60–90 min",
    parts: { premium: "OEM-grade / original-pulled part", budget: "Aftermarket part" },
    appleNote: "Genuine Apple service. Apple usually replaces the whole watch for a flat fee instead of fitting a new screen.",
    repairs: [
      { id: "display", label: "Display damaged", desc: "Lines, spots or black screen", noun: "screen replacement", m: { apple: [1, 1], premium: [0.45, 0.6], budget: [0.26, 0.38] } },
      { id: "glass", label: "Cracked glass", desc: "Picture & touch still work", noun: "glass replacement", m: { apple: [1, 1], premium: [0.28, 0.4], budget: [0.16, 0.26] } },
      { id: "battery", label: "Battery", desc: "Dies before the day ends", noun: "battery replacement", m: { apple: [0.36, 0.36], premium: [0.14, 0.2], budget: [0.09, 0.13] } },
    ],
  },
};

const r100 = (n: number) => Math.round(n / 100) * 100;

export function dquote(model: DModel, repairId: string, tier: TierId, city?: City): Quote | undefined {
  const rep = KINDS[model.kind].repairs.find((x) => x.id === repairId);
  if (!rep) return undefined;
  const [a, b] = rep.m[tier];
  const k = tier === "apple" ? 1 : city?.mult ?? 1;
  return { lo: r100(model.apple * a * k), hi: r100(model.apple * b * k) };
}

export const dPath = (model: DModel, city?: City) => `${KINDS[model.kind].path}/${model.slug}${city ? `/${city.slug}` : ""}`;

export function dWorth(model: DModel) {
  const q = dquote(model, "display", "premium")!;
  const cost = (q.lo + q.hi) / 2;
  const pct = Math.round((cost / model.used) * 100);
  const verdict =
    pct <= 28
      ? { tone: "good", title: "Repair it", line: "The repair is a small fraction of what the device is worth." }
      : pct <= 48
      ? { tone: "mid", title: "Repair, but choose the grade carefully", line: "A premium repair still makes sense; an Apple repair may not." }
      : { tone: "bad", title: "Consider a budget repair or trade-in", line: "A premium screen costs close to half the resale value." };
  return { pct, cost: r100(cost), ...verdict };
}

export function dFaqs(model: DModel, city?: City): QA[] {
  const k = KINDS[model.kind];
  const place = city ? city.name : "India";
  const q = (id: string, t: TierId) => dquote(model, id, t, city)!;
  const w = dWorth(model);
  return [
    {
      q: `How much does ${model.name} screen replacement cost in ${place}?`,
      a: `In ${place}, ${model.name} screen replacement costs roughly ${range(q("display", "budget"))} with a budget aftermarket display, ${range(q("display", "premium"))} with a premium OEM-grade display, and about ${inr(q("display", "apple").lo)} through Apple. Prices are indicative as of ${SITE.updated}.`,
    },
    {
      q: `Can ${an(model.name)} be repaired at home?`,
      a: `Yes. A ${SITE.name} specialist you choose comes to your home or office and does the ${k.name} repair in front of you. A screen or battery job takes ${k.time}, and needs only a table and good light.`,
    },
    {
      q: `How much does ${model.name} battery replacement cost?`,
      a: `${model.name} battery replacement costs about ${range(q("battery", "budget"))} with an aftermarket battery and ${range(q("battery", "premium"))} with a premium OEM-grade battery, fitted at your doorstep. Apple charges about ${inr(q("battery", "apple").lo)}.`,
    },
    {
      q: `Is it worth repairing ${an(model.name)} screen in ${SITE.year}?`,
      a: `${w.title}. A premium display costs about ${inr(w.cost)}, around ${w.pct}% of the typical resale value of ${inr(model.used)}. ${w.line}`,
    },
    {
      q: `Does Apple repair ${model.name} screens in India?`,
      a:
        model.kind === "ipad" || model.kind === "watch"
          ? `Apple and its authorised providers usually do not fit a new screen on ${model.kind === "ipad" ? "an iPad" : "an Apple Watch"}. For out-of-warranty screen damage they replace the whole unit for a flat fee, which is why Apple’s price is far higher than an independent screen replacement.`
          : `Yes. Apple and its authorised providers replace the full display assembly with a genuine part. It is the most expensive route and usually means leaving the MacBook at a service centre for a few days.`,
    },
    ...(city
      ? [
          {
            q: `Where can I get ${an(k.name)} repaired in ${city.name}?`,
            a: `The simplest option in ${city.name} is doorstep repair by a specialist you choose on ${SITE.name}. The well-known repair markets are ${city.markets}; quality there varies shop to shop, so compare the part grade and written warranty.`,
          },
        ]
      : []),
  ];
}
