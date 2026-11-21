import { Phone, Navigation } from "lucide-react"
import type { BookingFull } from "@/lib/bookings"
import { billFor, unitLabel, usesQuantity } from "@/lib/pricing"
import { formatDay, mapsUrl, taka, telHref, type Locale } from "@/lib/format"
import { named, pick } from "@/lib/i18n"
import { paymentProvider } from "@/lib/payments"
import { Avatar, Photos, Row } from "@/components/bits"

/** The facts of a booking: where, when, what, how much. Shared by every panel. */
export function BookingFacts({ booking, locale, showCustomer = false }: { booking: BookingFull; locale: Locale; showCustomer?: boolean }) {
  const b = booking
  const bill = b.finalPrice ?? billFor(b)
  const pay = paymentProvider(b.paymentMethod)
  return (
    <div className="divide-y divide-line">
      {showCustomer ? (
        <Row label={pick(locale, "কাস্টমার", "Customer")}>
          {b.contactName || b.customer.name}
          <a href={telHref(b.phone)} className="ml-2 inline-flex items-center gap-1 text-brand"><Phone className="size-3.5" />{b.phone}</a>
        </Row>
      ) : null}
      <Row label={pick(locale, "সেবা", "Service")}>{named(locale, b.category)} · {named(locale, b.offering)}</Row>
      {usesQuantity(b.pricing) ? (
        <Row label={pick(locale, "পরিমাণ", "Quantity")}>
          {b.quantity} {unitLabel(b.pricing, locale)}
          {b.category.flow === "TEAM" ? ` × ${b.days} ${pick(locale, "দিন", "days")} · ${b.teamSize} ${pick(locale, "জন", "people")}` : ""}
        </Row>
      ) : null}
      <Row label={pick(locale, "এলাকা", "Area")}>{named(locale, b.area)}</Row>
      <Row label={pick(locale, "ঠিকানা", "Address")}>
        <span className="block">{b.addressLine}</span>
        {b.landmark ? <span className="block text-xs font-normal text-muted-foreground">{b.landmark}</span> : null}
        <a href={mapsUrl(`${b.addressLine}, ${b.area.name}`)} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-brand"><Navigation className="size-3" /> {pick(locale, "ম্যাপে দেখুন", "Open in Maps")}</a>
      </Row>
      <Row label={pick(locale, "সময়", "When")}>{formatDay(b.visitDate, locale)} · {b.visitSlot}</Row>
      {b.notes ? <Row label={pick(locale, "নোট", "Notes")}><span className="whitespace-pre-wrap font-normal">{b.notes}</span></Row> : null}
      <Row label={b.status === "COMPLETED" ? pick(locale, "বিল", "Bill") : pick(locale, "আনুমানিক দাম", "Estimate")}>
        {b.pricing === "QUOTE" && b.quoteStatus !== "ACCEPTED" && !b.finalPrice ? (
          <span>{b.unitPrice ? pick(locale, `পরিদর্শন ${taka(b.unitPrice, locale)}`, `Inspection ${taka(b.unitPrice, locale)}`) : pick(locale, "দেখে জানানো হবে", "Quoted on site")}{b.visitCharge ? ` + ${taka(b.visitCharge, locale)}` : ""}</span>
        ) : (
          <span className="text-base">{taka(bill, locale)}</span>
        )}
        {b.visitCharge && b.status !== "COMPLETED" ? <span className="block text-xs font-normal text-muted-foreground">{pick(locale, `ভিজিট চার্জ ${taka(b.visitCharge, locale)} সহ`, `incl. ${taka(b.visitCharge, locale)} visit charge`)}</span> : null}
      </Row>
      <Row label={pick(locale, "পেমেন্ট", "Payment")}>
        {pay ? (locale === "bn" ? pay.labelBn : pay.label) : b.paymentMethod} · {b.paymentStatus === "PAID" ? <span className="text-ok">{pick(locale, "পরিশোধিত", "Paid")}</span> : <span className="text-amber-600">{pick(locale, "বাকি", "Due")}</span>}
      </Row>
      {b.photos.length ? (
        <div className="py-3">
          <p className="mb-2 text-sm text-muted-foreground">{pick(locale, "ছবি", "Photos")}</p>
          <Photos photos={b.photos} locale={locale} />
        </div>
      ) : null}
    </div>
  )
}

export function WorkerCard({ booking, locale }: { booking: BookingFull; locale: Locale }) {
  const w = booking.worker
  if (!w) return null
  return (
    <div className="card flex items-center gap-3 p-4">
      <Avatar name={w.user.name} src={w.photo || undefined} size={52} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-muted-foreground uppercase">{pick(locale, "আপনার কর্মী", "Your worker")}</p>
        <p className="truncate font-extrabold text-ink">{w.user.name}</p>
        <p className="text-xs text-muted-foreground">★ {w.rating ? w.rating.toFixed(1) : "—"} · {w.ratingCount} {pick(locale, "রিভিউ", "reviews")}</p>
      </div>
      {w.user.phone ? (
        <a href={telHref(w.user.phone)} className="btn-soft h-10 px-3 text-sm"><Phone className="size-4" /> {pick(locale, "কল", "Call")}</a>
      ) : null}
    </div>
  )
}
