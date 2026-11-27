import { addReply, clean, getTicket, setTicketStatus } from "@/lib/tickets";

export const dynamic = "force-dynamic";

// The customer writes back on their ticket page, or says the answer solved it.
export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 4000) return Response.json({ error: "Request too large." }, { status: 413 });
    b = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const t = await getTicket(clean(b.id, 12));
  if (!t || t.key !== b.key) return Response.json({ error: "This ticket link is not valid." }, { status: 404 });

  if (b.solved === true) {
    if (t.status !== "resolved") await setTicketStatus(t.id, "resolved", "Marked as solved by the customer.");
    return Response.json({ ok: true });
  }
  const text = clean(b.text, 1000);
  if (text.length < 2) return Response.json({ error: "Please write your message." }, { status: 422 });
  if (t.messages.filter((m) => m.from === "customer").length >= 40) return Response.json({ error: "This ticket has too many messages. Please raise a new one." }, { status: 429 });
  await addReply(t.id, "customer", text);
  return Response.json({ ok: true });
}
