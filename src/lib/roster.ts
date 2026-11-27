import { promises as fs } from "fs";
import path from "path";
import { TECHNICIANS, type Technician } from "./technicians";

// The working list of technicians: the profiles in technicians.ts plus anyone
// onboarded in the admin, with admin pauses applied. Changes are appended to
// data/technicians.jsonl and replayed on read.
type RosterEvent = { at: string; add?: Technician; id?: string; paused?: boolean };
const FILE = path.join(process.cwd(), "data", "technicians.jsonl");

async function write(e: Omit<RosterEvent, "at">) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.appendFile(FILE, JSON.stringify({ ...e, at: new Date().toISOString() }) + "\n", "utf8");
}

export async function roster(): Promise<Technician[]> {
  const list: Technician[] = TECHNICIANS.map((t) => ({ ...t }));
  try {
    for (const l of (await fs.readFile(FILE, "utf8")).split("\n").filter(Boolean)) {
      const e = JSON.parse(l) as RosterEvent;
      if (e.add && !list.some((t) => t.id === e.add!.id)) list.push({ ...e.add, added: true });
      const t = e.id ? list.find((x) => x.id === e.id) : undefined;
      if (t && typeof e.paused === "boolean") t.paused = e.paused;
    }
  } catch {}
  return list;
}

export async function addTechnician(t: Omit<Technician, "id" | "hue" | "jobs" | "rating">) {
  const id = "t" + Date.now().toString(36).slice(-6);
  const tech: Technician = { ...t, id, jobs: 0, rating: null, hue: (id.charCodeAt(3) * 47 + id.charCodeAt(5) * 13) % 360 };
  await write({ add: tech });
  return tech;
}

export const pauseTechnician = (id: string, paused: boolean) => write({ id, paused });
