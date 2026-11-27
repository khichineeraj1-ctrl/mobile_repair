"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";

const ITEMS = [
  { href: "/admin", label: "Dashboard", d: "M4 13h7V4H4zM13 20h7v-9h-7zM4 20h7v-5H4zM13 4v5h7V4z" },
  { href: "/admin/bookings", label: "Bookings", d: "M5 6h14v14H5zM5 10h14M9 3v4M15 3v4" },
  { href: "/admin/support", label: "Support", d: "M4 5h16v11H9l-5 4zM8 9h8M8 12h5" },
  { href: "/admin/payments", label: "Payments", d: "M3 7h18v11H3zM3 11h18M7 15h3" },
  { href: "/admin/customers", label: "Customers", d: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14a6 6 0 0 1 4 6" },
  { href: "/admin/reviews", label: "Reviews", d: "M12 4l2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8z" },
  { href: "/admin/technicians", label: "Technicians", d: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" },
  { href: "/admin/partners", label: "Applications", d: "M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5" },
];

// Sidebar on desktop, a top bar with scrolling tabs on phones.
export default function AdminSide({ counts, signedIn }: { counts: Record<string, number>; signedIn: boolean }) {
  const path = usePathname();
  return (
    <aside className="adm-side">
      <div className="adm-brand">
        <span className="logo-mark" aria-hidden="true" />
        <span>
          Screen<b>Sahi</b>
        </span>
        <em>Admin</em>
      </div>
      <nav aria-label="Admin">
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href} className={(i.href === "/admin" ? path === "/admin" : path.startsWith(i.href)) ? "on" : ""}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={i.d} />
            </svg>
            {i.label}
            {counts[i.href] ? <i>{counts[i.href]}</i> : null}
          </Link>
        ))}
      </nav>
      <div className="adm-foot">
        <a href="/" target="_blank" rel="noreferrer">
          View website ↗
        </a>
        {signedIn && (
          <form action={logout}>
            <button type="submit">Sign out</button>
          </form>
        )}
      </div>
    </aside>
  );
}
