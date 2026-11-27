import { promises as fs } from "fs";
import path from "path";
import { listBookings } from "./bookings";

// The private next-day check-in, appended to data/followups.jsonl.
// It is answered away from the technician, so it is the trusted source for
// "who did you pay" and it replaces the at-the-door star rating in ranking.

export type Followup = {
  bookingId: string;
  technicianId: string;
  working: boolean; // is the repaired device still fine?
  paidPlatform: boolean; // false = paid the technician directly
  askedDirect: boolean; // technician asked for direct payment / offered a cash discount
  stars: number;
  comment: string;
  createdAt: string;
};

const FILE = path.join(process.cwd(), "data", "followups.jsonl");

export async function listFollowups(): Promise<Followup[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as Followup);
  } catch {
    return [];
  }
}

// The day after the visit, in the server's local time.
export function followupDue(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d + 1);
}

type Parsed = { ok: true; followup: Followup } | { ok: false; error: string };

export async function parseFollowup(raw: unknown): Promise<Parsed> {
  const b = (raw ?? {}) as Record<string, unknown>;
  const id = typeof b.bookingId === "string" ? b.bookingId.trim().toUpperCase().slice(0, 12) : "";
  const booking = (await listBookings()).find((x) => x.id === id);
  if (!booking) return { ok: false, error: "We couldn’t find this booking." };
  if (typeof b.last4 !== "string" || b.last4 !== booking.phone.slice(-4))
    return { ok: false, error: "Those digits don’t match the phone number used for this booking." };
  if ((await listFollowups()).some((f) => f.bookingId === id)) return { ok: false, error: "We already have your feedback for this repair. Thank you." };
  // Not before the day after the visit (skipped while developing so it can be tested).
  if (process.env.NODE_ENV === "production" && new Date() < followupDue(booking.day)) return { ok: false, error: "This opens the day after your repair." };

  const stars = Number(b.stars);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return { ok: false, error: "Please choose 1 to 5 stars." };
  for (const k of ["working", "paidPlatform", "askedDirect"]) if (typeof b[k] !== "boolean") return { ok: false, error: "Please answer every question." };

  const comment =
    typeof b.comment === "string"
      ? b.comment
          .replace(/[\u0000-\u001f\u007f]/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 500)
      : "";

  return {
    ok: true,
    followup: {
      bookingId: id,
      technicianId: booking.technicianId,
      working: b.working as boolean,
      paidPlatform: b.paidPlatform as boolean,
      askedDirect: b.askedDirect as boolean,
      stars,
      comment,
      createdAt: new Date().toISOString(),
    },
  };
}

export async function saveFollowup(f: Followup) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.appendFile(FILE, JSON.stringify(f) + "\n", "utf8");
}
