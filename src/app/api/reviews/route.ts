import { publicReviews } from "@/lib/reviews";

export const dynamic = "force-dynamic";

// Recent public reviews that have something written in them, for the home page.
export async function GET(req: Request) {
  const limit = Math.min(12, Math.max(1, Number(new URL(req.url).searchParams.get("limit")) || 6));
  const list = (await publicReviews()).filter((r) => r.comment.length >= 3).slice(0, limit);
  return Response.json({ reviews: list.map(({ hidden: _h, bookingId: _b, ...r }) => r) });
}
