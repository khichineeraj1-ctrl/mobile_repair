import { MAX_CUSTOMER_MOVES, RESCHEDULE_DAYS_AHEAD, SLOT_IDS, addBookingEvent, listBookings } from "@/lib/bookings";
import { CITIES } from "@/lib/data";
import { liveTechnicians } from "@/lib/ratings";

export const dynamic = "force-dynamic";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// The customer moves their own visit from their booking page. With
// `check: true` nothing is saved: it only reports who is free in that slot.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 600) return Response.json({ error: "Request too large." }, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id.slice(0, 12) : "";
  const day = typeof body.day === "string" ? body.day.slice(0, 10) : "";
  const slot = typeof body.slot === "string" ? body.slot.slice(0, 20) : "";
  const want = typeof body.technician === "string" ? body.technician.slice(0, 12) : "";

  const b = (await listBookings()).find((x) => x.id === id);
  if (!b || !b.customerKey || body.key !== b.customerKey) return Response.json({ error: "This booking link is not valid." }, { status: 404 });
  if (b.status !== "new" && b.status !== "confirmed")
    return Response.json({ error: b.status === "started" ? "The repair has already started." : "This booking can no longer be changed." }, { status: 409 });
  if ((b.customerMoves ?? 0) >= MAX_CUSTOMER_MOVES)
    return Response.json({ error: "This visit has been moved the maximum number of times. Please raise a ticket on the Help page." }, { status: 409 });

  const now = new Date();
  const first = iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
  const last = iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + RESCHEDULE_DAYS_AHEAD));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day < first || day > last || !SLOT_IDS.includes(slot)) return Response.json({ error: "Please choose a day and a time." }, { status: 422 });
  if (day === b.day && slot === b.slot) return Response.json({ error: "That is your current visit time. Choose a different one." }, { status: 422 });

  const city = CITIES.find((c) => c.name === b.city);
  if (!city) return Response.json({ error: "This booking can’t be changed online. Please raise a ticket on the Help page." }, { status: 409 });
  const free = await liveTechnicians(city.slug, day, slot, 99); // ranked by rating, paused ones left out
  const currentFree = free.some((t) => t.id === b.technicianId);
  const options = free.slice(0, 3).map((t) => ({ id: t.id, name: t.name, rating: t.rating, years: t.years, jobs: t.jobs, hue: t.hue }));

  if (body.check === true) return Response.json({ currentFree, technicians: options });

  const tech = want ? free.find((t) => t.id === want) : currentFree ? free.find((t) => t.id === b.technicianId) : undefined;
  if (!tech) return Response.json({ error: `${b.technicianName} is not free then. Please choose another specialist.`, currentFree, technicians: options }, { status: 409 });

  const [y, m, d] = day.split("-").map(Number);
  const label = `${new Date(y, m - 1, d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · ${slot[0].toUpperCase()}${slot.slice(1)}`;
  const changed = tech.id !== b.technicianId;
  await addBookingEvent(b.id, `Customer moved the visit to ${label}${changed ? `; technician changed from ${b.technicianName} to ${tech.name}` : ""} (the technician needs to be told)`, {
    day,
    slot,
    when: label,
    technicianId: tech.id,
    technicianName: tech.name,
    status: "new", // back to "to confirm": the technician has to be told the new time
    customerMoves: (b.customerMoves ?? 0) + 1,
  });
  return Response.json({ ok: true, when: label, technician: tech.name });
}
