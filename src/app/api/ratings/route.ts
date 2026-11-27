import { parseRating, saveRating } from "@/lib/ratings";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    const raw = await req.text();
    if (raw.length > 4000) return Response.json({ error: "Request too large." }, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = await parseRating(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 422 });

  try {
    await saveRating(parsed.rating);
  } catch (err) {
    console.error("[ratings] could not save", err);
    return Response.json({ error: "We couldn’t save your rating. Please try again." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
