import { notFound } from "next/navigation";
import RateForm from "@/components/RateForm";
import { listBookings } from "@/lib/bookings";
import { listRatings } from "@/lib/ratings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rate your repair", robots: { index: false, follow: false } };

type P = { params: Promise<{ id: string }> };

// The link sent to the customer after a repair. Shows only the technician's
// name and the device, never the address or phone number.
export default async function Page({ params }: P) {
  const id = (await params).id.toUpperCase();
  const booking = (await listBookings()).find((b) => b.id === id);
  if (!booking) notFound();
  const already = (await listRatings()).some((r) => r.bookingId === id);

  return (
    <main className="wrap page narrow">
      <h1>Rate your repair</h1>
      <p className="muted">Booking {booking.id}. It takes 20 seconds, and it decides who gets the next booking.</p>
      {already ? (
        <div className="card inbox-empty">This repair has already been rated. Thank you.</div>
      ) : (
        <RateForm bookingId={booking.id} techName={booking.technicianName} device={booking.modelName} />
      )}
    </main>
  );
}
