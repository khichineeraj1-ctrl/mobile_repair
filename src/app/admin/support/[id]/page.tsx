import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ticketStatus } from "../../actions";
import AdminTicketReply from "@/components/AdminTicketReply";
import { adminGate, dayLabel, when } from "@/lib/admin";
import { BOOKING_STATUS, listBookings } from "@/lib/bookings";
import { TICKET_STATUS, getTicket, listTickets, topicLabel } from "@/lib/tickets";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ticket · Admin" };

const BADGE = { open: "new", answered: "due", resolved: "completed" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await adminGate();
  const t = await getTicket((await params).id);
  if (!t) notFound();
  const first = t.name.split(" ")[0];
  const booking = t.bookingId ? (await listBookings()).find((b) => b.id === t.bookingId) : undefined;
  const others = (await listTickets()).filter((x) => x.phone === t.phone && x.id !== t.id);

  const h = await headers();
  const url = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}/help/ticket/${t.id}/${t.key}`;
  const nudge =
    t.status === "resolved"
      ? `Hi ${first}, your ScreenSahi ticket ${t.id} is resolved. You can read the answer here, and write back on the same page if anything is still not right: ${url}`
      : `Hi ${first}, we have replied to your ScreenSahi ticket ${t.id}. Read it and answer here: ${url}`;

  const saved = [
    { label: "Booking changed", text: `Hi ${first}, your booking has been changed as you asked. Your booking page shows the new day and time. Your start code stays the same.` },
    { label: "Booking cancelled", text: `Hi ${first}, your booking is cancelled and nobody will visit. There is nothing to pay. You can book again any time.` },
    { label: "Warranty revisit", text: `Hi ${first}, sorry about the trouble. This is covered by your warranty. We are sending a specialist to fix it at no cost; your booking page will show the visit and a new start code.` },
    { label: "Need more details", text: `Hi ${first}, could you tell us a little more? What exactly do you see, and since when? A short description is enough; reply on this page.` },
    { label: "Direct payment report", text: `Hi ${first}, thank you for reporting this. You should only ever pay ScreenSahi. We have recorded it against the technician and it affects their listing. Your warranty is safe.` },
    { label: "How to pay", text: `Hi ${first}, you pay ScreenSahi after the repair, once you have tested your device. Please do not pay the technician directly.` },
  ];

  return (
    <>
      <nav className="adm-crumb">
        <Link href="/admin/support">← Support</Link>
      </nav>
      <header className="adm-head">
        <div>
          <h1>
            {t.id} <em className={`adm-badge ${BADGE[t.status]}`}>{TICKET_STATUS[t.status]}</em>
            {t.urgent && t.status !== "resolved" && <em className="adm-badge flagged">Urgent</em>}
          </h1>
          <p>
            {topicLabel(t.topic)} · {t.name} · raised {when(t.createdAt)}
          </p>
        </div>
        <form action={ticketStatus} className="adm-actions">
          <input type="hidden" name="id" value={t.id} />
          <input type="hidden" name="status" value={t.status === "resolved" ? "open" : "resolved"} />
          <button className="adm-btn ghost" type="submit">
            {t.status === "resolved" ? "Reopen" : "Close without a reply"}
          </button>
        </form>
      </header>

      <div className="adm-split">
        <div className="adm-col">
          <section className="adm-card">
            <h2>Conversation</h2>
            <ol className="adm-thread">
              {t.messages.map((m, i) => (
                <li key={i} className={m.from}>
                  <small>
                    {m.from === "customer" ? t.name : m.from === "support" ? "Support" : "Automatic"} · {when(m.at)}
                  </small>
                  <p>{m.text}</p>
                </li>
              ))}
            </ol>
          </section>
          <section className="adm-card">
            <h2>Reply</h2>
            <AdminTicketReply id={t.id} saved={saved} resolved={t.status === "resolved"} />
          </section>
        </div>

        <div className="adm-col">
          <section className="adm-card">
            <h2>Customer</h2>
            <dl className="adm-dl">
              <div>
                <dt>Name</dt>
                <dd>{t.name}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>+91 {t.phone}</dd>
              </div>
            </dl>
            <div className="adm-actions">
              <a className="adm-btn" href={`https://wa.me/91${t.phone}?text=${encodeURIComponent(nudge)}`} target="_blank" rel="noreferrer" title={nudge}>
                {t.status === "resolved" ? "Send “resolved” on WhatsApp" : "Send ticket link on WhatsApp"}
              </a>
              <a className="adm-btn ghost" href={url} target="_blank" rel="noreferrer">
                Customer’s ticket page ↗
              </a>
            </div>
            <p className="adm-quiet adm-gap">The customer sees every reply on their ticket page. The WhatsApp button is only a nudge and is sent by you; nothing goes out by itself.</p>
          </section>

          <section className="adm-card">
            <h2>Booking</h2>
            {booking ? (
              <>
                <dl className="adm-dl">
                  <div>
                    <dt>Reference</dt>
                    <dd>
                      {booking.id} <em className={`adm-badge ${booking.status}`}>{BOOKING_STATUS[booking.status]}</em>
                    </dd>
                  </div>
                  <div>
                    <dt>Repair</dt>
                    <dd>
                      {booking.modelName} · {booking.damage}
                    </dd>
                  </div>
                  <div>
                    <dt>Visit</dt>
                    <dd>
                      {dayLabel(booking.day)} · {booking.slot}
                    </dd>
                  </div>
                  <div>
                    <dt>Technician</dt>
                    <dd>{booking.technicianName}</dd>
                  </div>
                </dl>
                <Link className="adm-btn ghost" href={`/admin/bookings/${booking.id}`}>
                  Open booking
                </Link>
              </>
            ) : (
              <p className="adm-quiet">No booking reference was given with this ticket.</p>
            )}
          </section>

          {others.length > 0 && (
            <section className="adm-card">
              <h2>Other tickets from this number</h2>
              <ul className="adm-list">
                {others.map((x) => (
                  <li key={x.id}>
                    <Link href={`/admin/support/${x.id}`}>
                      <span>
                        <b>{x.id}</b>
                        <small>
                          {topicLabel(x.topic)} · {when(x.createdAt)}
                        </small>
                      </span>
                      <em className={`adm-badge ${BADGE[x.status]}`}>{TICKET_STATUS[x.status]}</em>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
