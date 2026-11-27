import { clean, getTicket } from "@/lib/tickets";

export const dynamic = "force-dynamic";

// Reopens a ticket page from the ticket number and the last 4 digits of the
// mobile number it was raised with.
export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try {
    b = JSON.parse((await req.text()).slice(0, 500));
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const t = await getTicket(clean(b.id, 12).replace(/\s/g, ""));
  if (!t || typeof b.last4 !== "string" || b.last4 !== t.phone.slice(-4)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return Response.json({ error: "We couldn’t find a ticket with that number and those digits." }, { status: 404 });
  }
  return Response.json({ url: `/help/ticket/${t.id}/${t.key}` });
}
