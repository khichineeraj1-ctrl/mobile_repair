// One view over every device the marketplace repairs, so the estimator, the
// booking flow and the booking API do not care whether it is an iPhone, an
// iPad or a MacBook.
import { DAMAGES, MODELS, TIERS, getModel, modelPath, quote, type City, type DamageId, type Quote, type TierId } from "./data";
import { DMODELS, KINDS, dPath, dquote, getDModel } from "./devices";

export type DeviceKind = "iphone" | "ipad" | "mac" | "watch";

// `tab` is the short label used on the device switcher inside cards.
export const DEVICE_TABS: { kind: DeviceKind; name: string; tab: string; hub: string }[] = [
  { kind: "iphone", name: "iPhone", tab: "iPhone", hub: "/screen-replacement/apple" },
  { kind: "ipad", name: "iPad", tab: "iPad", hub: KINDS.ipad.path },
  { kind: "mac", name: "MacBook", tab: "Mac", hub: KINDS.mac.path },
  { kind: "watch", name: "Apple Watch", tab: "Watch", hub: KINDS.watch.path },
];

export type Item = { slug: string; name: string; short: string; kind: DeviceKind; group: string; groupLabel: string; path: string };

const ITEMS: Item[] = [
  ...MODELS.map((m) => ({
    slug: m.slug,
    name: m.name,
    short: m.name.replace("iPhone ", ""),
    kind: "iphone" as const,
    group: m.series,
    groupLabel: m.series === "SE" ? "SE" : `${m.series} series`,
    path: modelPath(m),
  })),
  ...DMODELS.map((m) => ({
    slug: m.slug,
    name: m.name,
    short: m.kind === "watch" ? m.name.replace("Apple Watch ", "") : m.name.replace(m.family, "").trim().replace(/^\((.*)\)$/, "$1") || m.name,
    kind: m.kind as DeviceKind,
    group: m.family,
    groupLabel: m.family.replace("Apple Watch ", ""),
    path: dPath(m),
  })),
];

export const findItem = (slug: string) => ITEMS.find((x) => x.slug === slug);
export const itemsOf = (kind: DeviceKind) => ITEMS.filter((x) => x.kind === kind);
export const groupsOf = (kind: DeviceKind) => [...new Map(itemsOf(kind).map((x) => [x.group, x.groupLabel])).entries()].map(([id, label]) => ({ id, label }));
export const defaultItem = (kind: DeviceKind) => (kind === "iphone" ? findItem("iphone-15")! : itemsOf(kind)[0]);

export const repairsOf = (kind: DeviceKind): { id: string; label: string; desc: string }[] => (kind === "iphone" ? DAMAGES : KINDS[kind].repairs);

export function priceOf(slug: string, repair: string, tier: TierId, city?: City): Quote | undefined {
  const phone = getModel(slug);
  if (phone) return DAMAGES.some((x) => x.id === repair) ? quote(phone, repair as DamageId, tier, city) : undefined;
  const other = getDModel(slug);
  return other ? dquote(other, repair, tier, city) : undefined;
}

export const repairTime = (kind: DeviceKind) => (kind === "iphone" ? "about 45 minutes" : KINDS[kind].time.replace("min", "minutes"));

// Tier wording differs by device: an iPhone tier describes a screen, the
// others describe a part in general.
export function tierInfo(kind: DeviceKind, id: TierId) {
  const base = TIERS.find((t) => t.id === id)!;
  if (kind === "iphone") return base;
  const k = KINDS[kind];
  if (id === "apple") return { ...base, part: "Genuine Apple part", time: "3–7 days", note: k.appleNote };
  return {
    ...base,
    part: k.parts[id],
    time: k.time,
    note:
      id === "premium"
        ? "Closest to the original part in look and performance. Not a genuine Apple part."
        : "The lowest price for a working device. Expect small differences from the original part.",
  };
}
