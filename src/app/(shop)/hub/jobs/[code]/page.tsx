import Link from "next/link"
import { notFound } from "next/navigation"
import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, StatusPill, ErrorNote } from "@/components/bits"
import { formatDay, taka } from "@/lib/format"
import { acceptQuoteAction, cancelCustomerBookingAction, reviewBookingAction } from "@/actions/marketplace"
import { declineQuoteAction } from "@/actions/inbox"

export default async function JobPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["CUSTOMER"], "/hub")
  const { code } = await params
  const { error } = await searchParams
  const locale = await getLocale()
  const bn = locale === "bn"
  const booking = await db.serviceBooking.findUnique({
    where: { code },
    include: {
      store: true,
      category: true,
      offering: true,
      area: true,
      worker: { include: { user: true } },
      events: { orderBy: { createdAt: "asc" } },
      review: true,
    },
  })
  if (!booking || booking.customerId !== user.id) notFound()
  const open = !["COMPLETED", "CANCELLED"].includes(booking.status)
  return (
    <div className="pb-8">
      <PageHeader title={booking.code} back="/orders" />
      <ErrorNote message={error} />
      <div className="space-y-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-lg font-extrabold">{bn ? booking.offering.nameBn : booking.offering.name}</p>
            <p className="text-sm text-muted-foreground">{booking.store.name} · {booking.area ? (bn ? booking.area.nameBn : booking.area.name) : ""}</p>
          </div>
          <StatusPill status={booking.status} locale={locale} />
        </div>
        <p className="text-sm">{booking.addressLine}</p>
        <p className="text-sm">{formatDay(booking.visitDate, locale)} · {booking.visitSlot}</p>
        {booking.rooms ? <p className="text-sm">{bn ? "রুম" : "Rooms"} {booking.rooms} · {bn ? "দল" : "Team"} {booking.teamSize} · {bn ? "দিন" : "Days"} {booking.days}</p> : null}
        {booking.notes ? <p className="text-sm text-muted-foreground">{booking.notes}</p> : null}
        {booking.photos ? <p className="break-all text-sm"><a className="font-bold text-[var(--brand)]" href={booking.photos}>{bn ? "ছবি" : "Photo"}</a></p> : null}
        <p className="font-extrabold">
          {booking.quoteAmount && booking.status === "QUOTED"
            ? `${bn ? "কোট" : "Quote"} ${taka(booking.quoteAmount, locale)}`
            : booking.price
              ? taka(booking.price, locale)
              : bn ? "ভিজিটে দাম" : "Quote on visit"}
          {" · "}
          {booking.paymentMethod === "CASH" ? (bn ? "ক্যাশ" : "Cash") : booking.paymentMethod}
        </p>
        {booking.worker ? <p className="text-sm">{bn ? "মাঠকর্মী" : "Field worker"}: {booking.worker.user.name} · {booking.worker.trade}</p> : null}
        <ol className="space-y-2 border-l pl-3">
          {booking.events.map((event) => (
            <li key={event.id}>
              <StatusPill status={event.status} locale={locale} />
              <p className="text-xs text-muted-foreground">{event.note}</p>
            </li>
          ))}
        </ol>
        {booking.status === "QUOTED" ? (
          <div className="grid grid-cols-2 gap-2">
            <form action={acceptQuoteAction}>
              <input type="hidden" name="code" value={booking.code} />
              <button type="submit" className="pill w-full bg-primary text-primary-foreground">{bn ? "কোট গ্রহণ" : "Accept quote"}</button>
            </form>
            <form action={declineQuoteAction}>
              <input type="hidden" name="code" value={booking.code} />
              <button type="submit" className="pill w-full border">{bn ? "কোট বাতিল" : "Decline quote"}</button>
            </form>
          </div>
        ) : null}
        <Link href={`/chat/b/${booking.code}`} className="pill flex items-center justify-center border">{bn ? "এই বুকিংয়ে চ্যাট" : "Chat on this booking"}</Link>
        {booking.status === "COMPLETED" && !booking.review ? (
          <form action={reviewBookingAction} className="space-y-2">
            <input type="hidden" name="code" value={booking.code} />
            <label className="block text-sm font-bold">{bn ? "রেটিং" : "Rating"}
              <select name="rating" className="mt-1 h-12 w-full rounded-xl border px-3">
                {[5, 4, 3, 2, 1].map((star) => <option key={star} value={star}>{star}</option>)}
              </select>
            </label>
            <textarea name="comment" required minLength={3} rows={3} className="w-full rounded-xl border px-3 py-2" placeholder={bn ? "কাজ কেমন হলো" : "How did the visit go?"} />
            <button type="submit" className="pill w-full bg-primary text-primary-foreground">{bn ? "রিভিউ দিন" : "Send review"}</button>
          </form>
        ) : null}
        {booking.review ? <p className="text-sm">{booking.review.rating}/5 · {booking.review.comment}</p> : null}
        {open ? (
          <form action={cancelCustomerBookingAction}>
            <input type="hidden" name="code" value={booking.code} />
            <input type="hidden" name="reason" value={bn ? "গ্রাহক বাতিল করেছেন" : "Customer cancelled"} />
            <button className="text-sm font-bold text-rose-700">{bn ? "বাতিল" : "Cancel booking"}</button>
          </form>
        ) : null}
      </div>
    </div>
  )
}
