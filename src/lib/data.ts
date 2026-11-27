// ---------------------------------------------------------------------------
// Single source of truth for the whole site. Every page, table, FAQ, JSON-LD
// block, sitemap entry and llms.txt line is generated from this file.
//
// !! PRICES ARE PLACEHOLDERS !!  The `apple` and `used` figures below are rough
// estimates entered to make the prototype work. Replace them with verified
// numbers (Apple India service pricing + real partner quotes) before launch.
// ---------------------------------------------------------------------------

export const SITE = {
  name: "ScreenSahi", // working name — change here, updates everywhere
  url: "https://www.example.com", // set to the real domain before launch
  tagline: "A marketplace of verified Apple repair specialists. Choose yours, and they fix your iPhone at your doorstep",
  updated: "November 2026",
  year: 2026,
};

export type TierId = "apple" | "premium" | "budget";
export type DamageId = "glass" | "display" | "back";

export type Model = {
  slug: string;
  name: string;
  series: string;
  year: number;
  size: string;
  panel: "OLED" | "LCD";
  apple: number; // Apple out-of-warranty screen price (placeholder)
  used: number; // typical used-phone resale value (placeholder)
};

const m = (
  name: string,
  series: string,
  year: number,
  size: string,
  panel: "OLED" | "LCD",
  apple: number,
  used: number
): Model => ({
  slug: name.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "-"),
  name,
  series,
  year,
  size,
  panel,
  apple,
  used,
});

export const MODELS: Model[] = [
  m("iPhone 17 Pro Max", "17", 2025, "6.9″", "OLED", 41900, 115000),
  m("iPhone 17 Pro", "17", 2025, "6.3″", "OLED", 37900, 100000),
  m("iPhone Air", "17", 2025, "6.5″", "OLED", 37900, 85000),
  m("iPhone 17", "17", 2025, "6.3″", "OLED", 29900, 62000),
  m("iPhone 16 Pro Max", "16", 2024, "6.9″", "OLED", 41900, 90000),
  m("iPhone 16 Pro", "16", 2024, "6.3″", "OLED", 37900, 78000),
  m("iPhone 16 Plus", "16", 2024, "6.7″", "OLED", 33900, 58000),
  m("iPhone 16", "16", 2024, "6.1″", "OLED", 29900, 52000),
  m("iPhone 16e", "16", 2025, "6.1″", "OLED", 25900, 40000),
  m("iPhone 15 Pro Max", "15", 2023, "6.7″", "OLED", 41900, 72000),
  m("iPhone 15 Pro", "15", 2023, "6.1″", "OLED", 37900, 62000),
  m("iPhone 15 Plus", "15", 2023, "6.7″", "OLED", 33900, 46000),
  m("iPhone 15", "15", 2023, "6.1″", "OLED", 29900, 42000),
  m("iPhone 14 Pro Max", "14", 2022, "6.7″", "OLED", 41900, 58000),
  m("iPhone 14 Pro", "14", 2022, "6.1″", "OLED", 37900, 50000),
  m("iPhone 14 Plus", "14", 2022, "6.7″", "OLED", 33900, 38000),
  m("iPhone 14", "14", 2022, "6.1″", "OLED", 29900, 34000),
  m("iPhone 13 Pro Max", "13", 2021, "6.7″", "OLED", 37900, 45000),
  m("iPhone 13 Pro", "13", 2021, "6.1″", "OLED", 33900, 40000),
  m("iPhone 13", "13", 2021, "6.1″", "OLED", 29900, 29000),
  m("iPhone 13 mini", "13", 2021, "5.4″", "OLED", 25900, 24000),
  m("iPhone 12 Pro Max", "12", 2020, "6.7″", "OLED", 33900, 34000),
  m("iPhone 12", "12", 2020, "6.1″", "OLED", 25900, 21000),
  m("iPhone 12 mini", "12", 2020, "5.4″", "OLED", 23900, 16000),
  m("iPhone 11 Pro Max", "11", 2019, "6.5″", "OLED", 29900, 24000),
  m("iPhone 11", "11", 2019, "6.1″", "LCD", 17900, 15000),
  m("iPhone SE (3rd gen)", "SE", 2022, "4.7″", "LCD", 13900, 14000),
];

export const SERIES = [...new Set(MODELS.map((x) => x.series))];
export const getModel = (slug: string) => MODELS.find((x) => x.slug === slug);

// Apple devices the marketplace covers. Only iPhone is live today.
export const DEVICES = [
  { slug: "iphone", name: "iPhone", note: "Screen, back glass", live: true, href: "/screen-replacement/apple" },
  { slug: "ipad", name: "iPad", note: "Screen, battery", live: true, href: "/ipad-repair" },
  { slug: "macbook", name: "MacBook", note: "Display, battery, keyboard", live: true, href: "/macbook-repair" },
  { slug: "apple-watch", name: "Apple Watch", note: "Screen, glass, battery", live: true, href: "/apple-watch-repair" },
  { slug: "airpods", name: "AirPods", note: "Battery, case", live: false, href: "" },
];

export const TIERS: {
  id: TierId;
  label: string;
  short: string;
  part: string;
  where: string;
  time: string;
  warranty: string;
  note: string;
}[] = [
  {
    id: "apple",
    label: "Apple Authorised Service",
    short: "Apple",
    part: "Genuine Apple display",
    where: "Apple service centre",
    time: "Same day – 3 days",
    warranty: "90 days (Apple)",
    note: "Genuine part, True Tone and Face ID fully retained, no “Unknown Part” message. The safest and most expensive route.",
  },
  {
    id: "premium",
    label: "Premium OEM-grade",
    short: "Premium",
    part: "Original-pulled / soft OLED",
    where: "At your doorstep",
    time: "About 45 min",
    warranty: "6 months",
    note: "Closest to original brightness and touch. iOS may list the display as an “Unknown Part” in Settings. Ask the shop to transfer True Tone data.",
  },
  {
    id: "budget",
    label: "Budget aftermarket",
    short: "Budget",
    part: "In-cell LCD / hard OLED",
    where: "At your doorstep",
    time: "About 45 min",
    warranty: "3 months",
    note: "Cheapest way to get a working phone. Expect lower brightness, slightly thicker bezel and higher battery draw than the original panel.",
  },
];
export const getTier = (id: TierId) => TIERS.find((t) => t.id === id)!;

export const DAMAGES: { id: DamageId; label: string; desc: string }[] = [
  { id: "glass", label: "Cracked glass", desc: "Display & touch still work" },
  { id: "display", label: "Display damaged", desc: "Lines, spots or black screen" },
  { id: "back", label: "Back glass", desc: "Rear panel cracked" },
];
export const getDamage = (id: DamageId) => DAMAGES.find((d) => d.id === id)!;

// Price = Apple screen price × [low, high] multiplier. Placeholder model —
// swap for real partner quotes per model when the supply side exists.
const MATRIX: Record<DamageId, Record<TierId, [number, number]>> = {
  glass: { apple: [1, 1], premium: [0.38, 0.5], budget: [0.2, 0.3] },
  display: { apple: [1, 1], premium: [0.5, 0.66], budget: [0.22, 0.34] },
  back: { apple: [0.5, 0.5], premium: [0.14, 0.2], budget: [0.06, 0.1] },
};

export type City = { slug: string; name: string; mult: number; markets: string; pin: string };
export const CITIES: City[] = [
  { slug: "delhi", name: "Delhi", mult: 0.96, markets: "Nehru Place and Gaffar Market", pin: "110" },
  { slug: "mumbai", name: "Mumbai", mult: 1.04, markets: "Lamington Road and Heera Panna", pin: "400" },
  { slug: "bengaluru", name: "Bengaluru", mult: 1.03, markets: "SP Road and National Market", pin: "560" },
  { slug: "hyderabad", name: "Hyderabad", mult: 1.0, markets: "Jagdish Market and Chenoy Trade Centre", pin: "500" },
  { slug: "chennai", name: "Chennai", mult: 0.99, markets: "Ritchie Street", pin: "600" },
  { slug: "pune", name: "Pune", mult: 1.0, markets: "Tilak Road and Budhwar Peth", pin: "411" },
  { slug: "kolkata", name: "Kolkata", mult: 0.95, markets: "Chandni Chowk Market and Fancy Market", pin: "700" },
  { slug: "ahmedabad", name: "Ahmedabad", mult: 0.97, markets: "Relief Road", pin: "380" },
];
export const getCity = (slug: string) => CITIES.find((c) => c.slug === slug);
export const cityByPin = (pin: string) => CITIES.find((c) => pin.startsWith(c.pin));

export type Quote = { lo: number; hi: number };
const r100 = (n: number) => Math.round(n / 100) * 100;

export function quote(model: Model, damage: DamageId, tier: TierId, city?: City): Quote {
  const [a, b] = MATRIX[damage][tier];
  const k = tier === "apple" ? 1 : city?.mult ?? 1;
  return { lo: r100(model.apple * a * k), hi: r100(model.apple * b * k) };
}

// "an iPhone", "an iPad", "a MacBook".
export const an = (name: string) => `${/^[aeiou]/i.test(name) ? "an" : "a"} ${name}`;
export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
export const range = (q: Quote) => (q.lo === q.hi ? inr(q.lo) : `${inr(q.lo)}–${inr(q.hi)}`);

export const modelPath = (model: Model, city?: City) =>
  `/screen-replacement/apple/${model.slug}${city ? `/${city.slug}` : ""}`;

// Repair-vs-replace verdict: premium display repair as a share of resale value.
export function worthIt(model: Model) {
  const q = quote(model, "display", "premium");
  const cost = (q.lo + q.hi) / 2;
  const pct = Math.round((cost / model.used) * 100);
  const verdict =
    pct <= 28
      ? { tone: "good", title: "Repair it", line: "The repair is a small fraction of what the phone is worth." }
      : pct <= 48
      ? { tone: "mid", title: "Repair, but choose the tier carefully", line: "A premium repair still makes sense; an Apple repair may not." }
      : { tone: "bad", title: "Consider budget repair or trade-in", line: "A premium screen costs close to half the phone's resale value." };
  return { pct, cost: r100(cost), ...verdict };
}

export type QA = { q: string; a: string };

export function modelFaqs(model: Model, city?: City): QA[] {
  const place = city ? city.name : "India";
  const a = quote(model, "display", "apple", city);
  const p = quote(model, "display", "premium", city);
  const b = quote(model, "display", "budget", city);
  const g = quote(model, "glass", "premium", city);
  const w = worthIt(model);
  return [
    {
      q: `How much does ${model.name} screen replacement cost in ${place}?`,
      a: `In ${place}, ${model.name} screen replacement costs roughly ${range(b)} with a budget aftermarket display, ${range(p)} with a premium OEM-grade display, and about ${inr(a.lo)} at an Apple Authorised Service Provider. Prices are indicative as of ${SITE.updated}.`,
    },
    {
      q: `Can I choose who repairs my ${model.name}?`,
      a: `Yes. ${SITE.name} is a marketplace: after you pick a time, you see the Apple repair specialists free in ${place === "India" ? "your area" : place}, ranked by customer ratings, and you choose which one comes to your doorstep.`,
    },
    {
      q: `Can only the glass be replaced on ${an(model.name)}?`,
      a: `Yes, if the picture and touch are perfect and only the top glass is cracked, specialist shops can replace just the glass for about ${range(g)}. Apple does not offer glass-only repair; it replaces the full display assembly.`,
    },
    {
      q: `Is it worth repairing ${an(model.name)} screen in ${SITE.year}?`,
      a: `${w.title}. A premium display costs about ${inr(w.cost)}, which is around ${w.pct}% of the phone's typical resale value of ${inr(model.used)}. ${w.line}`,
    },
    {
      q: `Will Face ID and True Tone work after a third-party ${model.name} screen replacement?`,
      a: `Face ID keeps working as long as the original front sensor assembly is moved to the new screen undamaged. True Tone is lost unless the shop copies the display's calibration data to the new panel, so ask for this before the repair. iOS may also show an “Unknown Part” entry for the display in Settings.`,
    },
    {
      q: `How long does ${model.name} screen replacement take?`,
      a: `A doorstep replacement takes about 45 minutes, done in front of you at your home or office. Apple Authorised Service Providers range from same-day to about 3 working days depending on part availability.`,
    },
    {
      q: `What is the difference between ${model.panel === "OLED" ? "OLED and LCD" : "original and aftermarket LCD"} replacement screens?`,
      a:
        model.panel === "OLED"
          ? `${model.name} ships with an OLED panel. Budget replacements are often in-cell LCD or hard OLED: they work, but are dimmer, thicker and use more battery. Soft OLED or original-pulled panels cost more and look close to the factory display.`
          : `${model.name} ships with an LCD panel. Aftermarket LCDs vary mostly in brightness, colour accuracy and touch response; higher-grade panels are close to the factory display at a moderate premium.`,
    },
    ...(city
      ? [
          {
            q: `Where do people get iPhone screens repaired in ${city.name}?`,
            a: `Beyond Apple Authorised Service Providers, the best-known repair hubs in ${city.name} are ${city.markets}. Quality varies shop to shop, so compare the part grade and written warranty, not just the price.`,
          },
        ]
      : []),
  ];
}

export const HOME_FAQS: QA[] = [
  {
    q: "Can I choose who repairs my iPhone?",
    a: "Yes. After you pick a time, ScreenSahi shows the Apple repair specialists who are free in your area for that slot, with their rating, experience and number of repairs. You choose one, and that person comes to your doorstep.",
  },
  {
    q: "How are specialists ranked on ScreenSahi?",
    a: "By customer ratings. After every repair the customer rates the specialist from 1 to 5 stars on their own phone, and higher-rated specialists are shown first and receive more bookings. The next day ScreenSahi also asks the customer privately, away from the specialist, and that private score is the one that counts. A specialist cannot see, edit or submit a rating themselves.",
  },
  {
    q: "Are ScreenSahi technicians authorised by Apple?",
    a: "No. They are independent Apple repair specialists whose ID and repair skills are checked by ScreenSahi; they are not Apple Authorised Service Providers and do not fit genuine Apple parts. They fit premium OEM-grade or budget aftermarket screens. If you want a genuine Apple part, or your iPhone is under warranty or AppleCare+, use an Apple Authorised Service Provider.",
  },
  {
    q: "Can an iPhone screen be replaced at home?",
    a: "Yes. A trained technician brings the display and tools to your home or office and replaces the screen in front of you. The job takes about 45 minutes and needs only a table and good light.",
  },
  {
    q: "Is doorstep iPhone screen repair safe for my data?",
    a: "The phone never leaves your sight, which is the main advantage over leaving it at a shop. The technician does not need your passcode to fit the screen; you unlock the phone yourself afterwards to test touch, display and Face ID.",
  },
  {
    q: "What is the cheapest way to replace an iPhone screen in India?",
    a: "A budget aftermarket display from an independent repair shop is the cheapest option, typically 20–35% of Apple's price. It restores a working screen but with lower brightness and no True Tone.",
  },
  {
    q: "Does AppleCare+ cover a cracked iPhone screen in India?",
    a: "Yes. AppleCare+ covers accidental screen damage for a fixed service fee per incident, which is far lower than the out-of-warranty price. Check your coverage in Settings → General → AppleCare & Warranty before paying for a repair.",
  },
  {
    q: "Does a third-party screen replacement void the iPhone warranty?",
    a: "Apple can refuse warranty service for damage caused by a third-party repair, and it will not service a non-genuine display. If your iPhone is still under warranty or AppleCare+, an Apple Authorised Service Provider is usually the better choice.",
  },
  {
    q: "How do I know if I need glass-only repair or a full display?",
    a: "If the picture is perfect and touch works everywhere, only the glass is broken. Lines, black or purple blotches, flicker, or dead touch zones mean the display panel itself is damaged and the full assembly must be replaced.",
  },
];
