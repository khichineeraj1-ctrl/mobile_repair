"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/data";

const TABS = [
  { href: "/", label: "Home", match: (p: string) => p === "/", d: "M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" },
  {
    href: "/screen-replacement/apple",
    label: "Prices",
    match: (p: string) => /^\/(screen-replacement|ipad-repair|macbook-repair|apple-watch-repair)/.test(p),
    d: "M7 4h10M7 9h10M7 4c5 0 5 5 0 5m0 0l7 11M6 14h4",
  },
  {
    href: "/diagnose",
    label: "Diagnose",
    match: (p: string) => p.startsWith("/diagnose"),
    d: "M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm1 6l3 2-2 3 4 3",
  },
  { href: "/book", label: "Book", match: (p: string) => p.startsWith("/book"), d: "M5 6h14v14H5zM5 10h14M9 3v4M15 3v4M9 15l2 2 4-4" },
];

export default function Nav() {
  const path = usePathname();
  if (/^\/(admin|job)/.test(path)) return null; // the admin and the technician job page have no public menu
  return (
    <>
      <header className="top">
        <div className="wrap top-in">
          <Link className="logo" href="/">
            <span className="logo-mark" aria-hidden="true" />
            Screen<b>Sahi</b>
            <span className="sr">{SITE.name} home</span>
          </Link>
          <nav className="top-links" aria-label="Main">
            {TABS.map((t) => (
              <Link key={t.href} href={t.href} className={t.match(path) ? "on" : ""}>
                {t.label}
              </Link>
            ))}
          </nav>
          <Link className="btn btn-sm" href="/book">
            Book repair
          </Link>
        </div>
      </header>
      {!/^\/($|admin|rate|followup|track|job|help|partners|how-it-works)/.test(path) && (
        <Link href="/how-it-works" className="promise">
          <span>
            Apple repair marketplace: <b>you choose your specialist</b>
          </span>
          <em>How it works ›</em>
        </Link>
      )}
      <nav className="tabbar" aria-label="App">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className={`tab ${t.match(path) ? "on" : ""}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={t.d} />
            </svg>
            <span>{t.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
