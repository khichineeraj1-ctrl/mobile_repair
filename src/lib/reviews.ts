import { promises as fs } from "fs";
import path from "path";
import { listBookings } from "./bookings";
import { listRatings } from "./ratings";
import { roster } from "./roster";

// Reviews shown to the public. Only the rating given at the door is ever
// shown: the next-day follow-up was promised to be private. A customer is
// named by first name only, and the "Asked for cash" tag is dealt with by the
// team, not published. The admin can hide a review (abuse, personal details);
// its stars still count towards the technician's average.
const PRIVATE_TAGS = ["Asked for cash"];
const HIDDEN = path.join(process.cwd(), "data", "review-hidden.jsonl");

export type PublicReview = {
  bookingId: string;
  at: string;
  stars: number;
  tags: string[];
  comment: string;
  name: string;
  device: string;
  city: string;
  techId: string;
  techName: string;
  hidden: boolean;
};

export async function setReviewHidden(bookingId: string, hidden: boolean) {
  await fs.mkdir(path.dirname(HIDDEN), { recursive: true });
  await fs.appendFile(HIDDEN, JSON.stringify({ bookingId, hidden, at: new Date().toISOString() }) + "\n", "utf8");
}

async function hiddenSet() {
  const set = new Set<string>();
  try {
    for (const l of (await fs.readFile(HIDDEN, "utf8")).split("\n").filter(Boolean)) {
      const e = JSON.parse(l) as { bookingId: string; hidden: boolean };
      if (e.hidden) set.add(e.bookingId);
      else set.delete(e.bookingId);
    }
  } catch {}
  return set;
}

// Newest first. `withHidden` is for the admin only.
export async function publicReviews(withHidden = false): Promise<PublicReview[]> {
  const [ratings, bookings, hidden, techs] = await Promise.all([listRatings(), listBookings(), hiddenSet(), roster()]);
  return ratings
    .map((r) => {
      const b = bookings.find((x) => x.id === r.bookingId);
      return {
        bookingId: r.bookingId,
        at: r.createdAt,
        stars: r.stars,
        tags: r.tags.filter((t) => !PRIVATE_TAGS.includes(t)),
        comment: r.comment,
        name: b ? b.name.split(" ")[0] : "Customer",
        device: b?.modelName ?? "",
        city: b?.city ?? "",
        techId: r.technicianId,
        // The technician who was rated, even if the booking was later moved to someone else.
        techName: techs.find((t) => t.id === r.technicianId)?.name ?? "",
        hidden: hidden.has(r.bookingId),
      };
    })
    .filter((r) => withHidden || !r.hidden)
    .sort((a, b) => b.at.localeCompare(a.at));
}
