import { forwardPartner, parsePartner, savePartner } from "@/lib/partners";

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

  const parsed = parsePartner(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 422 });

  try {
    await savePartner(parsed.application);
  } catch (err) {
    console.error("[partners] could not save", err);
    return Response.json({ error: "We couldn’t save your application. Please try again." }, { status: 500 });
  }
  await forwardPartner(parsed.application);

  return Response.json({ id: parsed.application.id });
}
