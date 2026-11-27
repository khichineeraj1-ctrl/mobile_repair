"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, adminAccess, adminToken, dayDate, safeEqual } from "@/lib/admin";
import { BOOKING_STATUS, PAY_METHODS, SLOT_IDS, addBookingEvent, listBookings, type BookingStatus } from "@/lib/bookings";
import { CITIES, inr } from "@/lib/data";
import { PARTNER_STATUS, listPartners, setPartnerStatus, type PartnerStatus } from "@/lib/partners";
import { addTechnician, pauseTechnician, roster } from "@/lib/roster";
import { publicReviews, setReviewHidden } from "@/lib/reviews";
import { addReply, clean, getTicket, setTicketStatus } from "@/lib/tickets";

const str = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").replace(/\s+/g, " ").trim().slice(0, max);

async function guard() {
  const a = await adminAccess();
  if (a !== "ok" && a !== "open") throw new Error("Not signed in");
}
const done = () => revalidatePath("/admin", "layout");
const booking = async (fd: FormData) => (await listBookings()).find((b) => b.id === str(fd, "id", 12));

export async function login(fd: FormData) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) redirect("/admin");
  if (!safeEqual(adminToken(str(fd, "password", 200)), adminToken(pw))) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    redirect("/admin/login?error=1");
  }
  (await cookies()).set(ADMIN_COOKIE, adminToken(pw), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).set(ADMIN_COOKIE, "", { path: "/admin", maxAge: 0 });
  redirect("/admin/login");
}

export async function setStatus(fd: FormData) {
  await guard();
  const b = await booking(fd);
  const status = str(fd, "status") as BookingStatus;
  if (!b || !(status in BOOKING_STATUS) || b.status === status) return;
  await addBookingEvent(b.id, `Marked ${BOOKING_STATUS[status].toLowerCase()}`, { status });
  done();
}

export async function assign(fd: FormData) {
  await guard();
  const b = await booking(fd);
  const t = (await roster()).find((x) => x.id === str(fd, "technicianId", 12) && !x.paused);
  if (!b || !t || t.id === b.technicianId) return;
  await addBookingEvent(b.id, `Technician changed from ${b.technicianName} to ${t.name}`, { technicianId: t.id, technicianName: t.name });
  done();
}

export async function reschedule(fd: FormData) {
  await guard();
  const b = await booking(fd);
  const day = str(fd, "day", 10);
  const slot = str(fd, "slot", 20);
  if (!b || !/^\d{4}-\d{2}-\d{2}$/.test(day) || !SLOT_IDS.includes(slot) || (day === b.day && slot === b.slot)) return;
  const label = `${dayDate(day).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · ${slot[0].toUpperCase()}${slot.slice(1)}`;
  await addBookingEvent(b.id, `Visit moved to ${label}`, { day, slot, when: label });
  done();
}

export async function payment(fd: FormData) {
  await guard();
  const b = await booking(fd);
  const amount = Math.round(Number(str(fd, "amount", 10)));
  const method = str(fd, "method", 20);
  if (!b || !Number.isFinite(amount) || amount < 1 || amount > 500000 || !PAY_METHODS.includes(method)) return;
  await addBookingEvent(b.id, `Payment of ${inr(amount)} received by ${method}`, {
    finalPrice: amount,
    paidMethod: method,
    paidAt: new Date().toISOString(),
    status: b.status === "cancelled" ? b.status : "completed",
  });
  done();
}

export async function note(fd: FormData) {
  await guard();
  const b = await booking(fd);
  const text = str(fd, "text", 300);
  if (!b || text.length < 2) return;
  await addBookingEvent(b.id, `Note: ${text}`);
  done();
}

// Marks every paid, completed job of one technician as paid out.
export async function payout(fd: FormData) {
  await guard();
  const id = str(fd, "technicianId", 12);
  const at = new Date().toISOString();
  for (const b of await listBookings())
    if (b.technicianId === id && b.status === "completed" && b.paidAt && !b.payoutAt) await addBookingEvent(b.id, "Technician payout sent", { payoutAt: at });
  done();
}

export async function applicationStatus(fd: FormData) {
  await guard();
  const a = (await listPartners()).find((x) => x.id === str(fd, "id", 12));
  const status = str(fd, "status") as PartnerStatus;
  if (!a || !(status in PARTNER_STATUS) || a.status === status) return;
  await setPartnerStatus(a.id, status);
  // Approving puts the person on the technician list, if their city is covered.
  const city = CITIES.find((c) => c.name === a.city);
  if (status === "approved" && city) {
    const parts = a.name.split(" ");
    await addTechnician({
      name: parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0],
      city: city.slug,
      years: parseInt(a.years.replace("Under ", "")) || 1,
      langs: ["Hindi"],
      slots: a.slots.map((x) => x.toLowerCase()),
    });
  }
  done();
}

export async function technicianAdd(fd: FormData) {
  await guard();
  const name = str(fd, "name", 40);
  const city = CITIES.find((c) => c.slug === str(fd, "city", 30));
  const years = Math.round(Number(str(fd, "years", 3)));
  const langs = str(fd, "langs", 80).split(",").map((x) => x.trim()).filter(Boolean).slice(0, 4);
  const slots = SLOT_IDS.filter((x) => fd.get(`slot-${x}`) === "on");
  if (name.length < 2 || !city || !(years >= 0 && years <= 60) || !slots.length) return;
  await addTechnician({ name, city: city.slug, years, langs: langs.length ? langs : ["Hindi"], slots });
  done();
}

export async function technicianPause(fd: FormData) {
  await guard();
  const t = (await roster()).find((x) => x.id === str(fd, "id", 12));
  if (!t) return;
  await pauseTechnician(t.id, fd.get("paused") === "1");
  done();
}

// Clears the wrong-code count so the technician can try again.
export async function unlockCodes(fd: FormData) {
  await guard();
  const b = await booking(fd);
  if (!b || !b.codeFails) return;
  await addBookingEvent(b.id, "Wrong-code count reset by admin", { codeFails: 0 });
  done();
}

// ----- Support tickets -----
export async function ticketReply(fd: FormData) {
  await guard();
  const t = await getTicket(str(fd, "id", 12));
  const text = clean(fd.get("text"), 1500);
  if (!t || text.length < 2) return;
  await addReply(t.id, "support", text, fd.get("resolve") === "1");
  done();
}

export async function ticketStatus(fd: FormData) {
  await guard();
  const t = await getTicket(str(fd, "id", 12));
  const status = str(fd, "status");
  if (!t || (status !== "open" && status !== "resolved") || t.status === status) return;
  await setTicketStatus(t.id, status, status === "resolved" ? "Ticket closed by ScreenSahi support." : "Ticket reopened by ScreenSahi support.");
  done();
}

// Takes a door review off the public site, or puts it back. Its stars still count.
export async function reviewVisibility(fd: FormData) {
  await guard();
  const id = str(fd, "bookingId", 12);
  if (!(await publicReviews(true)).some((r) => r.bookingId === id)) return;
  await setReviewHidden(id, fd.get("hidden") === "1");
  done();
}
