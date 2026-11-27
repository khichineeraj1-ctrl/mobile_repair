import Link from "next/link";
import { payout } from "../actions";
import { adminGate, when } from "@/lib/admin";
import { PAYOUT_PER_JOB, board, sum } from "@/lib/adminview";
import { inr } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payments · Admin" };

export default async function Page() {
  await adminGate();
  const rows = await board();
  const paid = rows.filter((x) => x.b.paidAt).sort((a, b) => b.b.paidAt!.localeCompare(a.b.paidAt!));
  const unpaid = rows.filter((x) => x.b.status === "completed" && !x.b.paidAt);
  const due = rows.filter((x) => x.payoutDue);
  const sent = rows.filter((x) => x.b.payoutAt);
  const collected = sum(paid.map((x) => x.b.finalPrice ?? 0));

  const techs = [...new Set(due.map((x) => x.b.technicianId))].map((id) => {
    const jobs = due.filter((x) => x.b.technicianId === id);
    return { id, name: jobs[0].b.technicianName, city: jobs[0].b.city, jobs, collected: sum(jobs.map((x) => x.b.finalPrice ?? 0)) };
  });

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Payments</h1>
          <p>Money collected from customers and what is owed to technicians.</p>
        </div>
      </header>

      <p className="adm-note">
        Technician payout is shown as a flat {inr(PAYOUT_PER_JOB)} per job. That is the example figure from the partner page, not a decided rate; it changes
        once the partner terms are set. Payments are recorded by hand here, there is no online payment yet.
      </p>

      <div className="adm-stats">
        <div className="adm-stat">
          <small>Collected</small>
          <b>{inr(collected)}</b>
          <span>
            {paid.length} paid job{paid.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className={`adm-stat ${unpaid.length ? "warn" : ""}`}>
          <small>Awaiting payment</small>
          <b>{unpaid.length}</b>
          <span>completed, not paid</span>
        </div>
        <div className={`adm-stat ${due.length ? "warn" : ""}`}>
          <small>Payouts due</small>
          <b>{inr(due.length * PAYOUT_PER_JOB)}</b>
          <span>
            {techs.length} technician{techs.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="adm-stat">
          <small>Paid out</small>
          <b>{inr(sent.length * PAYOUT_PER_JOB)}</b>
          <span>{sent.length} jobs</span>
        </div>
        <div className="adm-stat">
          <small>Kept by ScreenSahi</small>
          <b>{inr(Math.max(0, collected - paid.length * PAYOUT_PER_JOB))}</b>
          <span>before parts cost</span>
        </div>
      </div>

      <h2 className="adm-h2">Payouts due</h2>
      <div className="adm-table po">
        <div className="adm-th">
          <span>Technician</span>
          <span>City</span>
          <span>Jobs</span>
          <span>Collected</span>
          <span>Payout due</span>
          <span></span>
        </div>
        {techs.length === 0 && <div className="adm-empty">No payouts due. A payout becomes due when a completed job is marked as paid.</div>}
        {techs.map((t) => (
          <div key={t.id} className="adm-row adm-cells">
            <span data-l="Technician">
              <b>{t.name}</b>
              <small>{t.jobs.map((x) => x.b.id).join(", ")}</small>
            </span>
            <span data-l="City">{t.city}</span>
            <span data-l="Jobs" className="adm-n">
              {t.jobs.length}
            </span>
            <span data-l="Collected" className="adm-n">
              {inr(t.collected)}
            </span>
            <span data-l="Payout due" className="adm-n">
              {inr(t.jobs.length * PAYOUT_PER_JOB)}
            </span>
            <span data-l="Action">
              <form action={payout}>
                <input type="hidden" name="technicianId" value={t.id} />
                <button className="adm-btn" type="submit">
                  Mark payout sent
                </button>
              </form>
            </span>
          </div>
        ))}
      </div>

      <h2 className="adm-h2">Payments received</h2>
      <div className="adm-table pm">
        <div className="adm-th">
          <span>Booking</span>
          <span>Customer</span>
          <span>Amount</span>
          <span>Paid by</span>
          <span>Received</span>
          <span>Technician</span>
          <span>Payout</span>
        </div>
        {paid.length === 0 && <div className="adm-empty">No payments recorded yet. Open a booking and use “Record payment”.</div>}
        {paid.map(({ b }) => (
          <Link key={b.id} href={`/admin/bookings/${b.id}`} className="adm-row adm-cells">
            <span data-l="Booking">
              <b>{b.id}</b>
              <small>{b.modelName}</small>
            </span>
            <span data-l="Customer">{b.name}</span>
            <span data-l="Amount" className="adm-n">
              {inr(b.finalPrice ?? 0)}
            </span>
            <span data-l="Paid by">{b.paidMethod}</span>
            <span data-l="Received">{when(b.paidAt!)}</span>
            <span data-l="Technician">{b.technicianName}</span>
            <span data-l="Payout">
              <em className={`adm-badge ${b.payoutAt ? "completed" : "due"}`}>{b.payoutAt ? "Sent" : "Due"}</em>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
