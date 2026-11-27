import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { CITIES } from "./data";

// Technician applications are appended to data/partners.jsonl, the same way
// bookings are. Set PARTNER_WEBHOOK_URL to also push each one to a sheet/CRM.
// ID documents are deliberately NOT collected here; that check is in person.

export const PARTNER_OPTIONS = {
  years: ["Under 2 years", "2–5 years", "5–10 years", "10+ years"],
  work: ["Own shop", "Work at a shop", "Freelance"],
  skills: ["iPhone screens", "iPhone back glass", "Battery", "Android screens", "Board-level repair"],
  slots: ["Morning", "Afternoon", "Evening"],
  days: ["Weekdays", "Weekends", "All week"],
};

// Example payout used only by the earnings estimator on the partner page.
// !! PLACEHOLDER !!  Replace with the real per-job fee once it is decided.
export const PARTNER_FEE_EXAMPLE = 700;

export type PartnerApplication = {
  id: string;
  createdAt: string;
  status: PartnerStatus;
  name: string;
  phone: string;
  city: string;
  pincode: string;
  years: string;
  work: string;
  skills: string[];
  bike: boolean;
  tools: boolean;
  slots: string[];
  days: string;
};

export type PartnerStatus = "new" | "contacted" | "approved" | "rejected";
export const PARTNER_STATUS: Record<PartnerStatus, string> = { new: "New", contacted: "Contacted", approved: "Approved", rejected: "Rejected" };

const FILE = path.join(process.cwd(), "data", "partners.jsonl");
// Status changes made in the admin, appended and replayed like booking events.
const EVENTS = path.join(process.cwd(), "data", "partner-events.jsonl");

export async function setPartnerStatus(id: string, status: PartnerStatus) {
  await fs.mkdir(path.dirname(EVENTS), { recursive: true });
  await fs.appendFile(EVENTS, JSON.stringify({ id, status, at: new Date().toISOString() }) + "\n", "utf8");
}

const text = (v: unknown, max: number) =>
  typeof v === "string"
    ? v
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max)
    : "";
const pickMany = (v: unknown, allowed: string[]) => (Array.isArray(v) ? allowed.filter((a) => v.includes(a)) : []);

type Parsed = { ok: true; application: PartnerApplication } | { ok: false; error: string };

export function parsePartner(raw: unknown): Parsed {
  const b = (raw ?? {}) as Record<string, unknown>;
  const name = text(b.name, 80);
  const phone = text(b.phone, 10);
  const cityIn = text(b.city, 40);
  const city = CITIES.find((c) => c.name === cityIn)?.name ?? (cityIn === "Other city" ? "Other city" : "");
  const pincode = text(b.pincode, 6);
  const years = text(b.years, 20);
  const work = text(b.work, 20);
  const skills = pickMany(b.skills, PARTNER_OPTIONS.skills);
  const slots = pickMany(b.slots, PARTNER_OPTIONS.slots);
  const days = text(b.days, 20);

  if (name.length < 2) return { ok: false, error: "Please enter your name." };
  if (!/^[6-9]\d{9}$/.test(phone)) return { ok: false, error: "Please enter a valid 10-digit mobile number." };
  if (!city) return { ok: false, error: "Please choose your city." };
  if (!/^[1-9]\d{5}$/.test(pincode)) return { ok: false, error: "Please enter your 6-digit pincode." };
  if (!PARTNER_OPTIONS.years.includes(years)) return { ok: false, error: "Please choose your experience." };
  if (!PARTNER_OPTIONS.work.includes(work)) return { ok: false, error: "Please choose how you work today." };
  if (!skills.length) return { ok: false, error: "Please choose at least one repair you do." };
  if (!slots.length) return { ok: false, error: "Please choose when you can take jobs." };
  if (!PARTNER_OPTIONS.days.includes(days)) return { ok: false, error: "Please choose which days you can work." };
  if (b.consent !== true) return { ok: false, error: "Please allow us to contact you about this application." };

  return {
    ok: true,
    application: {
      id: "SP-" + randomBytes(4).toString("hex").slice(0, 6).toUpperCase(),
      createdAt: new Date().toISOString(),
      status: "new",
      name,
      phone,
      city,
      pincode,
      years,
      work,
      skills,
      bike: b.bike === true,
      tools: b.tools === true,
      slots,
      days,
    },
  };
}

export async function savePartner(a: PartnerApplication) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.appendFile(FILE, JSON.stringify(a) + "\n", "utf8");
}

export async function listPartners(): Promise<PartnerApplication[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const list = raw
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as PartnerApplication)
      .reverse();
    try {
      for (const l of (await fs.readFile(EVENTS, "utf8")).split("\n").filter(Boolean)) {
        const e = JSON.parse(l) as { id: string; status: PartnerStatus };
        const a = list.find((x) => x.id === e.id);
        if (a) a.status = e.status;
      }
    } catch {}
    return list;
  } catch {
    return [];
  }
}

export async function forwardPartner(a: PartnerApplication) {
  const url = process.env.PARTNER_WEBHOOK_URL;
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(a),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error(`[partners] webhook returned ${res.status} for ${a.id}`);
  } catch (err) {
    console.error(`[partners] webhook failed for ${a.id}`, err);
  }
}
