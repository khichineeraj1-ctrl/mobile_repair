import Link from "next/link";
import PhoneArt from "@/components/PhoneArt";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="wrap page narrow notfound">
      <PhoneArt variant="glass" />
      <h1>This page is broken. Your phone doesn’t have to be.</h1>
      <p className="muted">We couldn’t find that page. Try one of these instead.</p>
      <div className="links">
        <Link className="pill" href="/">
          Home
        </Link>
        <Link className="pill" href="/screen-replacement/apple">
          iPhone prices
        </Link>
        <Link className="pill" href="/ipad-repair">
          iPad repair
        </Link>
        <Link className="pill" href="/macbook-repair">
          MacBook repair
        </Link>
        <Link className="pill" href="/apple-watch-repair">
          Apple Watch repair
        </Link>
        <Link className="pill" href="/diagnose">
          Damage checker
        </Link>
        <Link className="pill" href="/help">
          Help
        </Link>
      </div>
      <Link className="btn wide" href="/book">
        Book a doorstep repair
      </Link>
    </main>
  );
}
