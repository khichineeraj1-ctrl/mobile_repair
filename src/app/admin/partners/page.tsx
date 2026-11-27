import Link from "next/link";
import { applicationStatus } from "../actions";
import { adminGate, when, type AdminParams } from "@/lib/admin";
import { CITIES } from "@/lib/data";
import { PARTNER_STATUS, listPartners, type PartnerStatus } from "@/lib/partners";

export const dynamic = "force-dynamic";
export const metadata = { title: "Applications · Admin" };

const NEXT: Record<PartnerStatus, { status: PartnerStatus; label: string; ghost?: boolean }[]> = {
  new: [
    { status: "contacted", label: "Mark contacted" },
    { status: "rejected", label: "Reject", ghost: true },
  ],
  contacted: [
    { status: "approved", label: "Approve" },
    { status: "rejected", label: "Reject", ghost: true },
  ],
  approved: [],
  rejected: [{ status: "new", label: "Reopen", ghost: true }],
};
const BADGE: Record<PartnerStatus, string> = { new: "new", contacted: "due", approved: "completed", rejected: "cancelled" };

export default async function Page({ searchParams }: { searchParams: AdminParams }) {
  const { s, link } = await adminGate(searchParams);
  const apps = await listPartners();
  const view = s.view && s.view in PARTNER_STATUS ? (s.view as PartnerStatus) : undefined;
  const shown = view ? apps.filter((a) => a.status === view) : apps;

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Technician applications</h1>
          <p>People who applied from the Partners page. Approving one adds them to the technician list.</p>
        </div>
        <Link className="adm-btn" href="/partners" target="_blank">
          Open signup page ↗
        </Link>
      </header>

      <div className="adm-stats">
        {(Object.keys(PARTNER_STATUS) as PartnerStatus[]).map((k) => (
          <div key={k} className={`adm-stat ${k === "new" && apps.some((a) => a.status === "new") ? "warn" : ""}`}>
            <small>{PARTNER_STATUS[k]}</small>
            <b>{apps.filter((a) => a.status === k).length}</b>
            <span>{k === "new" ? "to call" : k === "contacted" ? "ID and skill check" : k === "approved" ? "on the technician list" : "not a fit"}</span>
          </div>
        ))}
      </div>

      <div className="adm-tabs">
        <Link href="/admin/partners" className={view ? "" : "on"}>
          All <i>{apps.length}</i>
        </Link>
        {(Object.keys(PARTNER_STATUS) as PartnerStatus[]).map((k) => (
          <Link key={k} href={link("/admin/partners", { view: k })} className={view === k ? "on" : ""}>
            {PARTNER_STATUS[k]} <i>{apps.filter((a) => a.status === k).length}</i>
          </Link>
        ))}
      </div>

      <div className="adm-table ap">
        <div className="adm-th">
          <span>Application</span>
          <span>Name</span>
          <span>Location</span>
          <span>Experience</span>
          <span>Repairs</span>
          <span>Available</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {shown.length === 0 && <div className="adm-empty">{apps.length ? "Nothing in this view." : "No applications yet. Submit one from the Partners page and it will appear here."}</div>}
        {shown.map((a) => (
          <div key={a.id} className="adm-row adm-cells">
            <span data-l="Application">
              <b>{a.id}</b>
              <small>{when(a.createdAt)}</small>
            </span>
            <span data-l="Name">
              <b>{a.name}</b>
              <small>+91 {a.phone}</small>
            </span>
            <span data-l="Location">
              {a.city} <small>{a.pincode}</small>
            </span>
            <span data-l="Experience">
              {a.years}
              <small>
                {a.work} · {[a.bike && "two-wheeler", a.tools && "tool kit"].filter(Boolean).join(", ") || "no vehicle or tools"}
              </small>
            </span>
            <span data-l="Repairs" className="adm-tags">
              {a.skills.map((x) => (
                <i key={x}>{x}</i>
              ))}
            </span>
            <span data-l="Available">
              {a.slots.join(", ")} <small>{a.days}</small>
            </span>
            <span data-l="Status">
              <em className={`adm-badge ${BADGE[a.status]}`}>{PARTNER_STATUS[a.status]}</em>
              {a.status === "approved" && !CITIES.some((c) => c.name === a.city) && <small>City not covered, not listed</small>}
            </span>
            <span data-l="Actions" className="adm-actions">
              {NEXT[a.status].map((n) => (
                <form key={n.status} action={applicationStatus}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="status" value={n.status} />
                  <button className={`adm-btn ${n.ghost ? "ghost" : ""}`} type="submit">
                    {n.label}
                  </button>
                </form>
              ))}
              <a className="adm-btn ghost" href={`https://wa.me/91${a.phone}`} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
              <a className="adm-btn ghost" href={`tel:+91${a.phone}`}>
                Call
              </a>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
