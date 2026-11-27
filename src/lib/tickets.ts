import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { listBookings } from "./bookings";

// Support runs in writing, with no phone calls: the customer raises a ticket,
// gets a ticket number and a private page, and every reply and the final
// "resolved" appear on that page. Tickets are stored like bookings: one file
// for new tickets, one for everything that happens to them afterwards.

export const TOPICS = [
  { id: "booking", label: "My booking or visit", hint: "Change the time, the address, or cancel", urgent: false },
  { id: "payment", label: "Payment or bill", hint: "What to pay, how to pay, a receipt", urgent: false },
  { id: "warranty", label: "Problem after the repair", hint: "The screen, touch, battery or anything else is not right", urgent: true },
  { id: "technician", label: "About the technician", hint: "Late, rude, or asked you to pay them directly", urgent: true },
  { id: "other", label: "Something else", hint: "Anything not covered above", urgent: false },
] as const;
export type TopicId = (typeof TOPICS)[number]["id"];
export const topicLabel = (id: string) => TOPICS.find((t) => t.id === id)?.label ?? "Other";

export type TicketStatus = "open" | "answered" | "resolved";
export const TICKET_STATUS: Record<TicketStatus, string> = { open: "Open", answered: "Waiting for customer", resolved: "Resolved" };
// What the customer sees for the same three states.
export const TICKET_STATUS_PUBLIC: Record<TicketStatus, string> = { open: "We are on it", answered: "We replied", resolved: "Resolved" };

export type TicketMessage = { at: string; from: "customer" | "support" | "system"; text: string };
export type Ticket = {
  id: string;
  key: string; // makes the customer's ticket link unguessable
  createdAt: string;
  topic: TopicId;
  bookingId: string;
  name: string;
  phone: string;
  status: TicketStatus;
  urgent: boolean;
  resolvedAt?: string;
  messages: TicketMessage[];
};
type TicketEvent = { ticketId: string; at: string; message?: TicketMessage; status?: TicketStatus };

const FILE = path.join(process.cwd(), "data", "tickets.jsonl");
const EVENTS = path.join(process.cwd(), "data", "ticket-events.jsonl");

export const clean = (v: unknown, max: number) =>
  typeof v === "string"
    ? v
        .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, max)
    : "";

async function readLines<T>(file: string): Promise<T[]> {
  try {
    return (await fs.readFile(file, "utf8"))
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as T);
  } catch {
    return [];
  }
}
async function append(file: string, row: object) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.appendFile(file, JSON.stringify(row) + "\n", "utf8");
}

export async function listTickets(): Promise<Ticket[]> {
  const list = (await readLines<Ticket>(FILE)).reverse();
  const byId = new Map(list.map((t) => [t.id, t]));
  for (const e of await readLines<TicketEvent>(EVENTS)) {
    const t = byId.get(e.ticketId);
    if (!t) continue;
    if (e.message) t.messages.push(e.message);
    if (e.status) {
      t.status = e.status;
      t.resolvedAt = e.status === "resolved" ? e.at : undefined;
    }
  }
  return list;
}
export const getTicket = async (id: string) => (await listTickets()).find((t) => t.id === id.toUpperCase());

// A reply from either side. A customer reply reopens the ticket; a support
// reply hands it back to the customer, or closes it when `resolve` is set.
export async function addReply(ticketId: string, from: "customer" | "support", text: string, resolve = false) {
  const at = new Date().toISOString();
  await append(EVENTS, { ticketId, at, message: { at, from, text }, status: from === "customer" ? "open" : resolve ? "resolved" : "answered" });
}
export async function setTicketStatus(ticketId: string, status: TicketStatus, note: string) {
  const at = new Date().toISOString();
  await append(EVENTS, { ticketId, at, message: { at, from: "system", text: note }, status });
}

// The automatic first reply, so the customer knows what happens next without
// anyone having to call them.
const FIRST_REPLY: Record<TopicId, string> = {
  booking: "We have your request. We will confirm the change on this page. Your current booking stays as it is until we do.",
  payment: "We have your question. You pay ScreenSahi only after the repair, never the technician. We will reply on this page.",
  warranty: "Sorry about that. Your repair is covered by the warranty. We will reply here with the next step; you do not need to pay anything for a covered fault.",
  technician: "Thank you for telling us. The technician does not see this ticket. We will look into it and reply on this page.",
  other: "We have your message and will reply on this page.",
};

type Parsed = { ok: true; ticket: Ticket } | { ok: false; error: string };

export async function parseTicket(raw: unknown): Promise<Parsed> {
  const b = (raw ?? {}) as Record<string, unknown>;
  if (b.website) return { ok: false, error: "Something went wrong. Please try again." }; // filled only by bots
  const topic = TOPICS.find((t) => t.id === b.topic);
  const name = clean(b.name, 80);
  const phone = clean(b.phone, 10);
  const text = clean(b.message, 1000);
  const bookingId = clean(b.bookingId, 12).toUpperCase();

  if (!topic) return { ok: false, error: "Please choose what you need help with." };
  if (text.length < 10) return { ok: false, error: "Please describe the problem in a sentence or two." };
  if (name.length < 2) return { ok: false, error: "Please enter your name." };
  if (!/^[6-9]\d{9}$/.test(phone)) return { ok: false, error: "Please enter a valid 10-digit mobile number." };
  if (bookingId) {
    const booking = (await listBookings()).find((x) => x.id === bookingId);
    // Same message for a wrong ID and a wrong number, so IDs cannot be tested.
    if (!booking || booking.phone !== phone) return { ok: false, error: "That booking reference and mobile number don’t match. Check both, or leave the reference empty." };
  }

  const at = new Date().toISOString();
  return {
    ok: true,
    ticket: {
      id: "HT-" + randomBytes(4).toString("hex").slice(0, 6).toUpperCase(),
      key: randomBytes(9).toString("base64url"),
      createdAt: at,
      topic: topic.id,
      bookingId,
      name,
      phone,
      status: "open",
      urgent: topic.urgent,
      messages: [
        { at, from: "customer", text },
        { at, from: "system", text: FIRST_REPLY[topic.id] },
      ],
    },
  };
}
export const saveTicket = (t: Ticket) => append(FILE, t);
