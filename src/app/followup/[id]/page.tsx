import { notFound } from "next/navigation";
import FollowupForm from "@/components/FollowupForm";
import { listBookings } from "@/lib/bookings";
import { listFollowups } from "@/lib/followups";

export const dynamic = "force-dynamic";
export const metadata = { title: "How is your repair?", robots: { index: false, follow: false } };

type P = { params: Promise<{ id: string }> };

// The private link sent to the customer the day after the repair.
export default async function Page({ params }: P) {
  const id = (await params).id.toUpperCase();
  const booking = (await listBookings()).find((b) => b.id === id);
  if (!booking) notFound();
  const already = (await listFollowups()).some((f) => f.bookingId === id);

  return (
    <main className="wrap page narrow">
      <h1>How is your repair, {booking.name.split(" ")[0]}?</h1>
      <p className="muted">Four quick questions about your {booking.modelName}. Booking {booking.id}.</p>
      {already ? (
        <div className="card inbox-empty">We already have your feedback for this repair. Thank you.</div>
      ) : (
        <FollowupForm bookingId={booking.id} techName={booking.technicianName} device={booking.modelName} />
      )}
    </main>
  );
}
