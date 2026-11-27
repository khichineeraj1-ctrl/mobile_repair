import Link from "next/link";
import { adminGate, stars, when, type AdminParams } from "@/lib/admin";
import { reviewVisibility } from "../actions";
import { board, sum } from "@/lib/adminview";
import { publicReviews } from "@/lib/reviews";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reviews · Admin" };

const VIEWS = [
  { id: "all", label: "All" },
  { id: "low", label: "3 stars or less" },
  { id: "flagged", label: "Flagged" },
];

export default async function Page({ searchParams }: { searchParams: AdminParams }) {
  const { s, link } = await adminGate(searchParams);
  const view = VIEWS.some((v) => v.id === s.view) ? s.view! : "all";
  const rows = await board();
  const hidden = new Set((await publicReviews(true)).filter((r) => r.hidden).map((r) => r.bookingId));

  // One line per piece of feedback: the rating at the door and the private
  // next-day answer are separate entries.
  const all = rows
    .flatMap((x) => [
      x.r && {
        at: x.r.createdAt,
        kind: "At the door",
        stars: x.r.stars,
        text: [x.r.tags.join(", "), x.r.comment && `“${x.r.comment}”`].filter(Boolean).join(" — "),
        bad: !x.r.paidPlatform || x.r.tags.includes("Asked for cash"),
        b: x.b,
      },
      x.f && {
        at: x.f.createdAt,
        kind: "Next day, private",
        stars: x.f.stars,
        text: [
          x.f.working ? "Working well" : "Has a problem",
          `Paid ${x.f.paidPlatform ? "ScreenSahi" : "the technician"}`,
          x.f.askedDirect && "Was asked to pay directly",
          x.f.comment && `“${x.f.comment}”`,
        ]
          .filter(Boolean)
          .join(" · "),
        bad: !x.f.paidPlatform || x.f.askedDirect || !x.f.working,
        b: x.b,
      },
    ])
    .filter((e): e is NonNullable<typeof e> & object => !!e)
    .sort((a, b) => b.at.localeCompare(a.at));
  const test = (id: string) => (e: (typeof all)[number]) => (id === "low" ? e.stars <= 3 : id === "flagged" ? e.bad : true);
  const shown = all.filter(test(view));
  const waiting = rows.filter((x) => !x.r && x.b.status === "completed").length;

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Reviews</h1>
          <p>What customers said at the door, and privately the next day. Door reviews are public on the specialist’s profile; next-day answers never are.</p>
        </div>
      </header>

      <div className="adm-stats">
        <div className="adm-stat">
          <small>Reviews</small>
          <b>{all.length}</b>
          <span>{all.filter((e) => e.kind !== "At the door").length} private</span>
        </div>
        <div className="adm-stat">
          <small>Average</small>
          <b>{all.length ? (sum(all.map((e) => e.stars)) / all.length).toFixed(1) : "–"}</b>
          <span>across all reviews</span>
        </div>
        <div className={`adm-stat ${all.some((e) => e.bad) ? "bad" : ""}`}>
          <small>Flagged</small>
          <b>{all.filter((e) => e.bad).length}</b>
          <span>direct payment or a problem</span>
        </div>
        <div className="adm-stat">
          <small>Not rated</small>
          <b>{waiting}</b>
          <span>completed jobs without a rating</span>
        </div>
      </div>

      <div className="adm-tabs">
        {VIEWS.map((v) => (
          <Link key={v.id} href={link("/admin/reviews", { view: v.id === "all" ? undefined : v.id })} className={view === v.id ? "on" : ""}>
            {v.label} <i>{all.filter(test(v.id)).length}</i>
          </Link>
        ))}
      </div>

      <div className="adm-table rv">
        <div className="adm-th">
          <span>When</span>
          <span>Booking</span>
          <span>Technician</span>
          <span>Type</span>
          <span>Stars</span>
          <span>What they said</span>
          <span>On the website</span>
        </div>
        {shown.length === 0 && <div className="adm-empty">{all.length ? "Nothing in this view." : "No reviews yet. They appear here when customers use their rating link."}</div>}
        {shown.map((e, i) => (
          <div key={i} className={`adm-row adm-cells ${e.bad ? "alert" : ""}`}>
            <span data-l="When">{when(e.at)}</span>
            <span data-l="Booking">
              <Link href={`/admin/bookings/${e.b.id}`}>
                <b>{e.b.id}</b>
              </Link>
              <small>
                {e.b.name} · {e.b.modelName}
              </small>
            </span>
            <span data-l="Technician">
              {e.b.technicianName}
              <small>{e.b.city}</small>
            </span>
            <span data-l="Type">
              <em className={`adm-badge ${e.kind === "At the door" ? "" : "upcoming"}`}>{e.kind}</em>
            </span>
            <span data-l="Stars" className="adm-stars">
              {stars(e.stars)}
            </span>
            <span data-l="What they said">{e.text || "–"}</span>
            <span data-l="On the website">
              {e.kind === "At the door" ? (
                <form action={reviewVisibility} className="adm-actions">
                  <input type="hidden" name="bookingId" value={e.b.id} />
                  <input type="hidden" name="hidden" value={hidden.has(e.b.id) ? "0" : "1"} />
                  <em className={`adm-badge ${hidden.has(e.b.id) ? "cancelled" : "completed"}`}>{hidden.has(e.b.id) ? "Hidden" : "Public"}</em>
                  <button className="adm-btn ghost" type="submit">
                    {hidden.has(e.b.id) ? "Show" : "Hide"}
                  </button>
                </form>
              ) : (
                <em className="adm-badge">Private</em>
              )}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
