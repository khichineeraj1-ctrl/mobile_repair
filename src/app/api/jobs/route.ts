import { timingSafeEqual } from "crypto";
import { MAX_CODE_FAILS, addBookingEvent, listBookings } from "@/lib/bookings";

export const dynamic = "force-dynamic";

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

// The technician's job page posts the code the customer read out. The first
// correct code starts the job, the second one ends it. Wrong codes are
// counted and the page locks, so a 4-digit code cannot be guessed.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 500) return Response.json({ error: "Request too large." }, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id.slice(0, 12) : "";
  const key = typeof body.key === "string" ? body.key.slice(0, 40) : "";
  const code = typeof body.code === "string" ? body.code.replace(/\D/g, "").slice(0, 4) : "";

  const b = (await listBookings()).find((x) => x.id === id);
  if (!b || !b.techKey || !same(key, b.techKey)) return Response.json({ error: "This job link is not valid." }, { status: 404 });
  if (b.status === "cancelled") return Response.json({ error: "This booking was cancelled." }, { status: 409 });
  if (b.status === "completed") return Response.json({ error: "This job is already finished." }, { status: 409 });
  const fails = b.codeFails ?? 0;
  if (fails >= MAX_CODE_FAILS) return Response.json({ error: "Too many wrong codes. Call ScreenSahi support to unlock this job." }, { status: 423 });
  if (code.length !== 4) return Response.json({ error: "Enter the 4-digit code." }, { status: 422 });

  const ending = b.status === "started";
  if (!same(code, ending ? b.endCode! : b.startCode!)) {
    const n = fails + 1;
    await addBookingEvent(b.id, n >= MAX_CODE_FAILS ? `Job page locked after ${MAX_CODE_FAILS} wrong codes` : "", { codeFails: n });
    const left = MAX_CODE_FAILS - n;
    return Response.json(
      { error: left > 0 ? `That code is not right. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many wrong codes. Call ScreenSahi support to unlock this job." },
      { status: 422 }
    );
  }

  const at = new Date().toISOString();
  if (ending) await addBookingEvent(b.id, "Job finished: technician entered the end code", { status: "completed", endedAt: at, codeFails: 0 });
  else await addBookingEvent(b.id, "Job started: technician entered the start code", { status: "started", startedAt: at, codeFails: 0 });
  return Response.json({ status: ending ? "completed" : "started" });
}
