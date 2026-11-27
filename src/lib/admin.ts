import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

// Admin access.
// - ADMIN_PASSWORD set: every admin page and action needs a signed-in cookie.
// - Not set, while developing: open, so the admin can be tried locally.
// - Not set, in production: the admin does not exist (404).
// One shared password, no per-person accounts. Replace with real accounts
// before more than a couple of people use it.
export const ADMIN_COOKIE = "ss_admin";
export const adminToken = (password: string) => createHmac("sha256", password).update("screensahi-admin-v1").digest("hex");
export const safeEqual = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function adminAccess(): Promise<"open" | "ok" | "login" | "off"> {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return process.env.NODE_ENV === "production" ? "off" : "open";
  const cookie = (await cookies()).get(ADMIN_COOKIE)?.value ?? "";
  return safeEqual(cookie, adminToken(pw)) ? "ok" : "login";
}

export type AdminParams = Promise<Record<string, string | undefined>>;

// Call at the top of every admin page. Returns the query values and a helper
// for building admin links with query values.
export async function adminGate(searchParams?: AdminParams) {
  const access = await adminAccess();
  if (access === "off") notFound();
  if (access === "login") redirect("/admin/login");
  const s = (await searchParams) ?? {};
  const link = (path: string, params: Record<string, string | undefined> = {}) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    const str = q.toString();
    return str ? `${path}?${str}` : path;
  };
  return { s, link, access };
}

export const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);
export const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
export const dayDate = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const dayLabel = (day: string) => dayDate(day).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
export const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
