import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import Nav from "@/components/Nav";
import { SITE } from "@/lib/data";
import "./globals.css";

const display = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `iPhone Screen Replacement at Your Doorstep | ${SITE.name}`,
    template: `%s | ${SITE.name}`,
  },
  description: `Choose a verified Apple repair specialist by rating and get your iPhone screen replaced at your doorstep. Upfront prices for every iPhone in India.`,
  alternates: { canonical: "/" },
  // "./" resolves to each page's own address.
  openGraph: { siteName: SITE.name, type: "website", locale: "en_IN", url: "./" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0D2A2C",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={display.variable}>
      <body>
        <Nav />
        {children}
        <footer className="foot">
          <div className="wrap">
            <b>{SITE.name}</b>
            <p className="foot-lead">
              A marketplace of independent Apple repair specialists. You choose who repairs your device. <Link href="/how-it-works">How it works</Link>
            </p>
            <p>
              Prices are indicative estimates, last updated {SITE.updated}. Final quotes depend on the shop, part availability and the condition of your phone.{" "}
              {SITE.name} is an independent marketplace and is not affiliated with or authorised by Apple Inc. Specialists on {SITE.name} are independent technicians. Apple, iPhone, iPad, MacBook, Apple Watch and AirPods are trademarks of Apple Inc.
            </p>
            <p>
              <Link href="/screen-replacement/apple">iPhone prices</Link> · <Link href="/ipad-repair">iPad repair</Link> ·{" "}
              <Link href="/macbook-repair">MacBook repair</Link> · <Link href="/apple-watch-repair">Apple Watch repair</Link> · <Link href="/diagnose">Damage checker</Link> ·{" "}
              <Link href="/book">Book doorstep repair</Link> · <Link href="/help">Help and support</Link> · <Link href="/partners">Become a technician partner</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
