import { dayDate } from "./admin";
import { listBookings, type Booking } from "./bookings";
import { followupDue, listFollowups, type Followup } from "./followups";
import { PARTNER_FEE_EXAMPLE } from "./partners";
import { listRatings, type Rating } from "./ratings";

// !! PLACEHOLDER !!  What a technician is paid per completed job. Uses the
// example fee from the partner page until the real terms are decided.
export const PAYOUT_PER_JOB = PARTNER_FEE_EXAMPLE;

export type Row = {
  b: Booking;
  r?: Rating;
  f?: Followup;
  visit: Date;
  due: Date; // when the private next-day follow-up can be sent
  leak: boolean; // paid, or was asked to pay, the technician directly
  broken: boolean; // customer reports a problem after the repair
  flagged: boolean;
  followDue: boolean;
  score?: number; // the rating that counts: next-day if given, else at the door
  payoutDue: boolean;
};

// Every booking joined with its ratings and the checks the admin cares about.
export async function board(): Promise<Row[]> {
  const [bookings, ratings, followups] = await Promise.all([listBookings(), listRatings(), listFollowups()]);
  const now = new Date();
  return bookings.map((b) => {
    const r = ratings.find((x) => x.bookingId === b.id);
    const f = followups.find((x) => x.bookingId === b.id);
    const due = followupDue(b.day);
    const leak = !!((r && (!r.paidPlatform || r.tags.includes("Asked for cash"))) || (f && (!f.paidPlatform || f.askedDirect)));
    const broken = f?.working === false;
    return {
      b,
      r,
      f,
      visit: dayDate(b.day),
      due,
      leak,
      broken,
      flagged: leak || broken,
      followDue: !f && b.status !== "cancelled" && now >= due,
      score: f?.stars ?? r?.stars,
      payoutDue: b.status === "completed" && !!b.paidAt && !b.payoutAt,
    };
  });
}

export const needsAction = (x: Row) => x.flagged || x.followDue || x.b.status === "new" || (x.b.status === "completed" && !x.b.paidAt);
export const sum = (list: number[]) => list.reduce((a, n) => a + n, 0);
