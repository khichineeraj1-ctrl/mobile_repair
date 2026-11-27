import { promises as fs } from "fs";
import path from "path";
import { listBookings } from "./bookings";
import { listFollowups } from "./followups";
import { roster } from "./roster";
import { availableFor, type Technician } from "./technicians";

// Customer ratings, one per booking, appended to data/ratings.jsonl.
// Ratings drive the order technicians are shown in, so two things guard
// against a technician rating themselves:
//   1. the rater must know the last 4 digits of the customer's phone number
//   2. a booking can be rated only once, and not before the visit day

export const GOOD_TAGS = ["On time", "Polite", "Explained the repair", "Neat work", "Screen looks perfect"];
export const BAD_TAGS = ["Late", "Rude", "Rushed", "Problem not fixed", "Asked for cash"];

export type Rating = {
  bookingId: string;
  technicianId: string;
  stars: number;
  tags: string[];
  paidPlatform: boolean; // false = customer says they paid the technician directly
  comment: string;
  createdAt: string;
};

const FILE = path.join(process.cwd(), "data", "ratings.jsonl");

export async function listRatings(): Promise<Rating[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as Rating);
  } catch {
    return [];
  }
}

type Parsed = { ok: true; rating: Rating } | { ok: false; error: string };

export async function parseRating(raw: unknown): Promise<Parsed> {
  const b = (raw ?? {}) as Record<string, unknown>;
  const id = typeof b.bookingId === "string" ? b.bookingId.trim().toUpperCase().slice(0, 12) : "";
  const booking = (await listBookings()).find((x) => x.id === id);
  if (!booking) return { ok: false, error: "We couldn’t find this booking." };
  if (typeof b.last4 !== "string" || b.last4 !== booking.phone.slice(-4))
    return { ok: false, error: "Those digits don’t match the phone number used for this booking." };
  if ((await listRatings()).some((r) => r.bookingId === id)) return { ok: false, error: "This booking has already been rated. Thank you." };

  // Not before the visit day (skipped while developing so the flow can be tested).
  const [y, m, d] = booking.day.split("-").map(Number);
  if (process.env.NODE_ENV === "production" && new Date() < new Date(y, m - 1, d)) return { ok: false, error: "You can rate this repair after the visit." };

  const stars = Number(b.stars);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return { ok: false, error: "Please choose 1 to 5 stars." };
  if (typeof b.paidPlatform !== "boolean") return { ok: false, error: "Please tell us who you paid." };

  const allowed = [...GOOD_TAGS, ...BAD_TAGS];
  const tags = Array.isArray(b.tags) ? allowed.filter((t) => (b.tags as unknown[]).includes(t)) : [];
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
    rating: { bookingId: id, technicianId: booking.technicianId, stars, tags, paidPlatform: b.paidPlatform, comment, createdAt: new Date().toISOString() },
  };
}

export async function saveRating(r: Rating) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.appendFile(FILE, JSON.stringify(r) + "\n", "utf8");
}

// How the list is ordered. A plain average would bury every new technician
// behind one lucky 5-star and let one bad day sink a veteran, so each
// technician starts from a neutral prior (PRIOR_STARS over PRIOR_COUNT
// imaginary ratings) that real ratings gradually outweigh.
const PRIOR_STARS = 4.5;
const PRIOR_COUNT = 10;

export type RankedTechnician = Technician & { rank: number };

// `limit` is how many to return; customers see the top 3, the admin sees all.
// `withPaused` keeps technicians the admin has paused (admin only).
export async function liveTechnicians(city: string, day?: string, slot?: string, limit = 3, withPaused = false): Promise<RankedTechnician[]> {
  // One score per booking. The private next-day score, given away from the
  // technician, replaces the at-the-door score when both exist.
  const effective = new Map<string, { tech: string; stars: number }>();
  for (const r of await listRatings()) effective.set(r.bookingId, { tech: r.technicianId, stars: r.stars });
  for (const f of await listFollowups()) effective.set(f.bookingId, { tech: f.technicianId, stars: f.stars });
  const scores = [...effective.values()];
  const all = (await roster()).filter((t) => withPaused || !t.paused);
  const pool = day && slot ? availableFor(city, day, slot, all) : all.filter((t) => t.city === city);

  return pool
    .map((t) => {
      const mine = scores.filter((r) => r.tech === t.id);
      const baseCount = t.rating ? t.jobs : 0; // sample profiles: treat past jobs as rated at their listed average
      const sum = (t.rating ?? 0) * baseCount + mine.reduce((n, r) => n + r.stars, 0);
      const count = baseCount + mine.length;
      return {
        ...t,
        jobs: t.jobs + mine.length,
        rating: count ? Math.round((sum / count) * 10) / 10 : null,
        rank: (PRIOR_STARS * PRIOR_COUNT + sum) / (PRIOR_COUNT + count),
      };
    })
    .sort((a, b) => b.rank - a.rank)
    .slice(0, limit);
}
