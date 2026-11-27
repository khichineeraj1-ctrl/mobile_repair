import AdminSide from "@/components/AdminSide";
import { adminAccess } from "@/lib/admin";
import { board, needsAction } from "@/lib/adminview";
import { listPartners } from "@/lib/partners";
import { listTickets } from "@/lib/tickets";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// The admin has its own shell: the public header, tab bar and footer are
// hidden on /admin (see Nav.tsx and the .adm rules in globals.css).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await adminAccess();
  if (access !== "ok" && access !== "open") return <div className="adm adm-out">{children}</div>;

  const [rows, apps, tickets] = await Promise.all([board(), listPartners(), listTickets()]);
  const counts = {
    "/admin/bookings": rows.filter(needsAction).length,
    "/admin/support": tickets.filter((t) => t.status === "open").length,
    "/admin/payments": new Set(rows.filter((x) => x.payoutDue).map((x) => x.b.technicianId)).size,
    "/admin/partners": apps.filter((a) => a.status === "new").length,
  };
  return (
    <div className="adm">
      <AdminSide counts={counts} signedIn={access === "ok"} />
      <main className="adm-main">{children}</main>
    </div>
  );
}
