import { randomBytes, randomInt } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { findItem, priceOf, repairsOf } from "./catalog";
import { cityByPin, type TierId } from "./data";
import { TECHNICIANS, availableFor, type Technician } from "./technicians";

// Bookings are appended to data/bookings.jsonl (one JSON object per line).
// This works on a normal server or locally. On serverless hosts the disk is not
// permanent, so set BOOKING_WEBHOOK_URL and treat the webhook target (Google
// Sheet, CRM, Slack...) as the system of record.

export type Booking = {
  id: string;
  createdAt: string;
  status: BookingStatus;
  model: string;
  modelName: string;
  device: string;
  damage: string;
  tier: TierId;
  priceLo: number;
  priceHi: number;
  pincode: string;
  city: string;
  address: string;
  day: string;
  slot: string;
  when: string;
  technicianId: string;
  technicianName: string;
  name: string;
  phone: string;
  // Filled in by the admin after the booking is made (see BookingEvent).
  finalPrice?: number;
  paidMethod?: string;
  paidAt?: string;
  payoutAt?: string;
  // Door codes. The customer reads the start code to the technician before
  // the repair and the end code after testing the device; the technician
  // types each one on their job page, which records when the job started
  // and ended. The keys make the customer and technician links unguessable.
  startCode?: string;
  endCode?: string;
  customerKey?: string;
  techKey?: string;
  startedAt?: string;
  endedAt?: string;
  customerMoves?: number; // times the customer rescheduled from their booking page
  codeFails?: number; // wrong codes entered in a row; the job page locks at MAX_CODE_FAILS
  history?: { at: string; text: string }[];
};

export type BookingStatus = "new" | "confirmed" | "started" | "completed" | "cancelled";
export const BOOKING_STATUS: Record<BookingStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  started: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};
export const MAX_CODE_FAILS = 5;
// !! ASSUMED RULES !!  A customer can move their own visit this many times,
// to any day from tomorrow up to this many days ahead. Change to suit.
export const MAX_CUSTOMER_MOVES = 3;
export const RESCHEDULE_DAYS_AHEAD = 10;
const code = () => String(randomInt(0, 10000)).padStart(4, "0");
const key = () => randomBytes(9).toString("base64url");
// Start and end codes always differ, so one can never be used for the other.
export function newCodes() {
  const startCode = code();
  let endCode = code();
  while (endCode === startCode) endCode = code();
  return { startCode, endCode, customerKey: key(), techKey: key() };
}
export const SLOT_IDS = ["morning", "afternoon", "evening"];
export const PAY_METHODS = ["UPI", "Card", "Cash", "Bank transfer"];

// Admin changes are never written over the original booking. Each one is
// appended to data/booking-events.jsonl and replayed when bookings are read,
// which also gives every booking a history.
export type BookingEvent = {
  bookingId: string;
  at: string;
  text: string;
  set: Partial<Pick<Booking, "status" | "technicianId" | "technicianName" | "day" | "slot" | "when" | "finalPrice" | "paidMethod" | "paidAt" | "payoutAt" | "startCode" | "endCode" | "customerKey" | "techKey" | "startedAt" | "endedAt" | "codeFails" | "customerMoves">>;
};
const EVENTS = path.join(process.cwd(), "data", "booking-events.jsonl");

export async function addBookingEvent(bookingId: string, text: string, set: BookingEvent["set"] = {}) {
  const e: BookingEvent = { bookingId, at: new Date().toISOString(), text, set };
  await fs.mkdir(path.dirname(EVENTS), { recursive: true });
  await fs.appendFile(EVENTS, JSON.stringify(e) + "\n", "utf8");
}

async function readEvents(): Promise<BookingEvent[]> {
  try {
    return (await fs.readFile(EVENTS, "utf8"))
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as BookingEvent);
  } catch {
    return [];
  }
}

const FILE = path.join(process.cwd(), "data", "bookings.jsonl");
const SLOTS = SLOT_IDS;
const DOOR_TIERS = ["premium", "budget"];

const text = (v: unknown, max: number) =>
  typeof v === "string"
    ? v
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max)
    : "";

type Parsed = { ok: true; booking: Booking } | { ok: false; error: string };

// Never trust the browser: every field is re-checked and the price is
// recalculated here from the model, damage, tier and pincode.
// `roster` is the list of technicians currently taking bookings.
export function parseBooking(raw: unknown, roster: Technician[] = TECHNICIANS): Parsed {
  const b = (raw ?? {}) as Record<string, unknown>;
  const model = findItem(text(b.model, 60));
  const damage = text(b.damage, 20);
  const tier = text(b.tier, 20);
  const pincode = text(b.pincode, 6);
  const city = /^[1-9]\d{5}$/.test(pincode) ? cityByPin(pincode) : undefined;
  const address = text(b.address, 200);
  const day = text(b.day, 10);
  const slot = text(b.slot, 20);
  const name = text(b.name, 80);
  const phone = text(b.phone, 10);

  if (!model) return { ok: false, error: "Please choose your device model." };
  if (!repairsOf(model.kind).some((r) => r.id === damage)) return { ok: false, error: "Please choose what is damaged." };
  if (!DOOR_TIERS.includes(tier)) return { ok: false, error: "Please choose a screen option." };
  if (!city) return { ok: false, error: "We don’t cover this pincode yet." };
  if (address.length < 6) return { ok: false, error: "Please enter your full address." };
  if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(day) || !SLOTS.includes(slot)) return { ok: false, error: "Please choose a day and time." };
  // The technician must be one we would actually have offered for this city and slot.
  const tech = availableFor(city.slug, day, slot, roster).find((x) => x.id === text(b.technician, 12));
  if (!tech) return { ok: false, error: "That technician is no longer free for this slot. Please choose again." };
  if (name.length < 2) return { ok: false, error: "Please enter your name." };
  if (!/^[6-9]\d{9}$/.test(phone)) return { ok: false, error: "Please enter a valid 10-digit mobile number." };

  const q = priceOf(model.slug, damage, tier as TierId, city)!;
  return {
    ok: true,
    booking: {
      id: "SS-" + randomBytes(4).toString("hex").slice(0, 6).toUpperCase(),
      createdAt: new Date().toISOString(),
      status: "new",
      model: model.slug,
      modelName: model.name,
      device: model.kind,
      damage,
      tier: tier as TierId,
      priceLo: q.lo,
      priceHi: q.hi,
      pincode,
      city: city.name,
      address,
      day,
      slot,
      when: text(b.when, 60),
      technicianId: tech.id,
      technicianName: tech.name,
      name,
      phone,
      ...newCodes(),
    },
  };
}

export async function saveBooking(booking: Booking) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.appendFile(FILE, JSON.stringify(booking) + "\n", "utf8");
}

const backfilled = new Map<string, ReturnType<typeof newCodes>>();

export async function listBookings(): Promise<Booking[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const list = raw
      .split("\n")
      .filter(Boolean)
      .map((line) => ({ ...(JSON.parse(line) as Booking), history: [] as { at: string; text: string }[] }))
      .reverse();
    const byId = new Map(list.map((b) => [b.id, b]));
    for (const e of await readEvents()) {
      const b = byId.get(e.bookingId);
      if (!b) continue;
      Object.assign(b, e.set);
      if (e.text) b.history.push({ at: e.at, text: e.text });
    }
    // Bookings made before door codes existed get theirs the first time they are read.
    for (const b of list)
      if (!b.startCode || !b.techKey) {
        // Several reads can run at once; they must all agree on one set of codes.
        const known = backfilled.get(b.id);
        const set = known ?? newCodes();
        Object.assign(b, set);
        if (!known) {
          backfilled.set(b.id, set);
          await addBookingEvent(b.id, "", set);
        }
      }
    return list;
  } catch {
    return [];
  }
}

// Optional: push each booking to an external tool. Failure here must never
// lose the booking, so it is logged and swallowed.
export async function forwardBooking(booking: Booking) {
  const url = process.env.BOOKING_WEBHOOK_URL;
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(booking),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error(`[bookings] webhook returned ${res.status} for ${booking.id}`);
  } catch (err) {
    console.error(`[bookings] webhook failed for ${booking.id}`, err);
  }
}
