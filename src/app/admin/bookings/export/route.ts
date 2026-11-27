import { adminAccess } from "@/lib/admin";
import { board } from "@/lib/adminview";

export const dynamic = "force-dynamic";

// A spreadsheet of every booking. Values starting with = + - @ are prefixed
// so a spreadsheet never runs customer-typed text as a formula.
const cell = (v: unknown) => {
  const s = String(v ?? "");
  return `"${(/^[=+\-@]/.test(s) ? "'" + s : s).replace(/"/g, '""')}"`;
};

export async function GET() {
  const a = await adminAccess();
  if (a !== "ok" && a !== "open") return new Response("Not found", { status: 404 });
  const head = ["ID", "Received", "Status", "Customer", "Phone", "City", "Pincode", "Address", "Device", "Repair", "Part", "Quote low", "Quote high", "Visit day", "Slot", "Technician", "Job started", "Job ended", "Amount paid", "Paid by", "Paid at", "Payout sent", "Door rating", "Next-day rating", "Flagged"];
  const lines = (await board()).map(({ b, r, f, flagged }) =>
    [b.id, b.createdAt, b.status, b.name, b.phone, b.city, b.pincode, b.address, b.modelName, b.damage, b.tier, b.priceLo, b.priceHi, b.day, b.slot, b.technicianName, b.startedAt ?? "", b.endedAt ?? "", b.finalPrice ?? "", b.paidMethod ?? "", b.paidAt ?? "", b.payoutAt ?? "", r?.stars ?? "", f?.stars ?? "", flagged ? "yes" : ""].map(cell).join(",")
  );
  return new Response("﻿" + [head.map(cell).join(","), ...lines].join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="bookings-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
