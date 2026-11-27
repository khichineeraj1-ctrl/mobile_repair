import { notFound } from "next/navigation";
import AutoRefresh from "@/components/AutoRefresh";
import JobCode from "@/components/JobCode";
import { MAX_CODE_FAILS, listBookings } from "@/lib/bookings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your job", robots: { index: false, follow: false } };

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
const visitDay = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
};

// The technician's page for one job. The link is private to them. It shows
// what they need for the visit, never the customer's phone number.
export default async function Page({ params }: { params: Promise<{ id: string; key: string }> }) {
  const { id, key } = await params;
  const b = (await listBookings()).find((x) => x.id === id.toUpperCase());
  if (!b || b.techKey !== key) notFound();
  const locked = (b.codeFails ?? 0) >= MAX_CODE_FAILS;
  const step = b.status === "completed" ? 3 : b.status === "started" ? 2 : 1;

  return (
    <main className="wrap page narrow jobpage">
      <AutoRefresh seconds={15} />
      <small className="tag">Job {b.id}</small>
      <h1>{b.modelName}</h1>
      <p className="muted">
        {b.damage} repair · {b.tier} part · for {b.name.split(" ")[0]}
      </p>

      <div className="card jobfacts">
        <div>
          <small>Visit</small>
          <b>
            {visitDay(b.day)} · {b.slot}
          </b>
        </div>
        <div>
          <small>Address</small>
          <b>
            {b.address}, {b.city} {b.pincode}
          </b>
        </div>
      </div>

      <ol className="jobsteps">
        <li className={step > 1 ? "done" : "on"}>
          <b>Start the job</b>
          <span>{b.startedAt ? `Started at ${time(b.startedAt)}` : "Ask the customer for their start code before you open the device."}</span>
        </li>
        <li className={step > 2 ? "done" : step === 2 ? "on" : ""}>
          <b>Repair in front of the customer</b>
          <span>Let them test the device when you are done.</span>
        </li>
        <li className={step > 2 ? "done" : ""}>
          <b>Finish the job</b>
          <span>{b.endedAt ? `Finished at ${time(b.endedAt)}` : "The customer gives you the end code once they are happy."}</span>
        </li>
      </ol>

      {b.status === "cancelled" ? (
        <div className="card">This booking was cancelled. Do not visit.</div>
      ) : step === 3 ? (
        <div className="card success">
          <h2>Job finished</h2>
          <p className="muted">The customer pays ScreenSahi. Your payout follows once the payment is in.</p>
        </div>
      ) : locked ? (
        <div className="card">
          <p className="callout warn">Too many wrong codes. Call ScreenSahi support to unlock this job.</p>
        </div>
      ) : (
        <div className="card">
          <JobCode id={b.id} jobKey={key} phase={step === 1 ? "start" : "end"} />
        </div>
      )}

      <p className="muted small jobrule">The customer pays ScreenSahi, never you. Asking for direct payment ends your listing.</p>
    </main>
  );
}
