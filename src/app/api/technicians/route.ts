import { getCity } from "@/lib/data";
import { liveTechnicians } from "@/lib/ratings";

export const dynamic = "force-dynamic";

// Technicians for a city (optionally a day + slot), ordered by customer rating.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const city = getCity(q.get("city") ?? "");
  if (!city) return Response.json({ error: "Unknown city." }, { status: 400 });
  const day = q.get("day") ?? undefined;
  const slot = q.get("slot") ?? undefined;
  return Response.json({ technicians: await liveTechnicians(city.slug, day, slot) });
}
