import { forwardBooking, parseBooking, saveBooking } from "@/lib/bookings";
import { roster } from "@/lib/roster";

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

  const parsed = parseBooking(
    body,
    (await roster()).filter((t) => !t.paused)
  );
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 422 });

  try {
    await saveBooking(parsed.booking);
  } catch (err) {
    console.error("[bookings] could not save", err);
    return Response.json({ error: "We couldn’t save your booking. Please try again." }, { status: 500 });
  }
  await forwardBooking(parsed.booking);

  // The start code and private link go only to the person who made the booking.
  return Response.json({ id: parsed.booking.id, startCode: parsed.booking.startCode, track: `/track/${parsed.booking.id}/${parsed.booking.customerKey}` });
}
