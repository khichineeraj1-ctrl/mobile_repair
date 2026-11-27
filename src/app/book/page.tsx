import { JsonLd } from "@/components/Faq";
import { breadcrumbs } from "@/lib/seo";
import BookingFlow from "@/components/BookingFlow";

export const metadata = {
  title: "Book a Doorstep Apple Device Repair",
  description: "Book an iPhone, iPad, MacBook or Apple Watch repair at your home or office. Choose your Apple specialist; they repair it in front of you.",
  alternates: { canonical: "/book" },
};

type P = { searchParams: Promise<Record<string, string | undefined>> };

export default async function Page({ searchParams }: P) {
  const s = await searchParams;
  return (
    <main className="wrap page">
      <h1>Book your doorstep repair</h1>
      <p className="muted">Takes under a minute. The specialist you choose comes to you and does the repair in front of you.</p>
      <BookingFlow model={s.model} damage={s.damage} tier={s.tier} city={s.city} tech={s.tech} />
      <JsonLd data={breadcrumbs([["Book a repair", "/book"]])} />
    </main>
  );
}
