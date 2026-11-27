import Link from "next/link";
import { notFound } from "next/navigation";
import AutoRefresh from "@/components/AutoRefresh";
import Reschedule from "@/components/Reschedule";
import { MAX_CUSTOMER_MOVES, RESCHEDULE_DAYS_AHEAD, listBookings } from "@/lib/bookings";
import { SITE } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your repair", robots: { index: false, follow: false } };

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
const visitDay = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
};
const Digits = ({ code }: { code: string }) => (
  <div className="digits" aria-label={`Code ${code.split("").join(" ")}`}>
    {code.split("").map((c, i) => (
      <span key={i} aria-hidden="true">
        {c}
      </span>
    ))}
  </div>
);

// The customer's private page for one booking: status and the two door codes.
// The end code stays hidden until the technician has started the job.
export default async function Page({ params }: { params: Promise<{ id: string; key: string }> }) {
  const { id, key } = await params;
  const b = (await listBookings()).find((x) => x.id === id.toUpperCase());
  if (!b || b.customerKey !== key) notFound();
  const tech = b.technicianName.split(" ")[0];
  const step = b.status === "completed" ? 3 : b.status === "started" ? 2 : 1;

  return (
    <main className="wrap page narrow jobpage">
      <AutoRefresh />
      <small className="tag">Booking {b.id}</small>
      <h1>Your {b.modelName} repair</h1>
      <p className="muted">
        {b.technicianName} · {visitDay(b.day)} · {b.slot}
      </p>

      {b.status === "cancelled" ? (
        <div className="card">This booking was cancelled. No one will visit.</div>
      ) : step === 1 ? (
        <div className="card codecard">
          <small className="tag">Start code</small>
          <Digits code={b.startCode!} />
          <p>
            Read this to <b>{tech}</b> when they arrive, before they open your device.
          </p>
          <p className="muted small">It tells {SITE.name} the repair has started. Do not share it earlier, by call or message.</p>
        </div>
      ) : step === 2 ? (
        <div className="card codecard">
          <small className="tag live">Repair in progress since {time(b.startedAt!)}</small>
          <small className="tag">End code</small>
          <Digits code={b.endCode!} />
          <p>
            Give this to <b>{tech}</b> only after you have tested your device and are happy.
          </p>
          <p className="muted small">It closes the job. Then you pay {SITE.name}, not the technician.</p>
        </div>
      ) : (
        <div className="card success">
          <h2>Repair finished{b.endedAt ? ` at ${time(b.endedAt)}` : ""}</h2>
          <p className="muted">Pay {SITE.name} to start your 6-month warranty. Please do not pay the technician directly.</p>
          <Link className="btn wide" href={`/rate/${b.id}`}>
            Rate {tech}
          </Link>
        </div>
      )}

      {step === 1 &&
        b.status !== "cancelled" &&
        ((b.customerMoves ?? 0) < MAX_CUSTOMER_MOVES ? (
          <Reschedule
            id={b.id}
            bookingKey={key}
            day={b.day}
            slot={b.slot}
            techId={b.technicianId}
            techName={b.technicianName.split(" ")[0]}
            daysAhead={RESCHEDULE_DAYS_AHEAD}
            movesLeft={MAX_CUSTOMER_MOVES - (b.customerMoves ?? 0)}
          />
        ) : (
          <p className="muted small jobrule">
            This visit has been moved {MAX_CUSTOMER_MOVES} times. To change it again, <Link href={`/help?booking=${b.id}`}>raise a ticket</Link>.
          </p>
        ))}

      <ol className="jobsteps">
        <li className={step > 1 ? "done" : "on"}>
          <b>{tech} arrives</b>
          <span>{b.startedAt ? `Started at ${time(b.startedAt)}` : "You share the start code at your door."}</span>
        </li>
        <li className={step > 2 ? "done" : step === 2 ? "on" : ""}>
          <b>Repaired in front of you</b>
          <span>Your device never leaves your sight.</span>
        </li>
        <li className={step > 2 ? "done" : ""}>
          <b>You test it and share the end code</b>
          <span>{b.endedAt ? `Finished at ${time(b.endedAt)}` : "Only when everything works."}</span>
        </li>
      </ol>
      <p className="muted small jobrule">
        Need to change something, or is something wrong? <Link href={`/help?booking=${b.id}`}>Get help with this booking</Link>. We reply in writing, no calls.
      </p>
    </main>
  );
}
