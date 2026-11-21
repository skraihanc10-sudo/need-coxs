import Link from "next/link"
import { TicketCheck } from "lucide-react"
import type { BookingFull } from "@/lib/bookings"
import { BOOKING_DAYS, SLOTS, flowOf } from "@/lib/bookings"
import { isOpen, nextStatuses, statusText, WORKER_BUTTON } from "@/lib/booking-flow"
import { formatDay, taka, upcomingDays, type Locale } from "@/lib/format"
import { named, pick } from "@/lib/i18n"
import { billFor } from "@/lib/pricing"
import { PAYMENT_PROVIDERS } from "@/lib/payments"
import { assignWorkerAction, moveBookingAction, recordPaymentAction, refundNoteAction, rescheduleAction, sendQuoteAction, setPriceAction } from "@/actions/booking"
import { sendBookingMessageAction } from "@/actions/support"
import { ActionForm, SubmitButton } from "@/components/forms"
import { Composer, MessageList, type ChatMessage } from "@/components/chat-pane"
import { Avatar, Section } from "@/components/bits"
import { Timeline } from "./timeline"
import { BookingFacts } from "./details"

type WorkerOption = { id: string; name: string; rating: number; busy: number; skilled: boolean; inArea: boolean }

/** The office view of one booking: assign, move, price, pay, chat. Shared by support and admin. */
export function OfficeBooking({
  booking: b,
  locale,
  me,
  isAdmin,
  workers,
  messages,
  templates,
}: {
  booking: BookingFull
  locale: Locale
  me: string
  isAdmin: boolean
  workers: WorkerOption[]
  messages: ChatMessage[]
  templates: Array<{ id: string; title: string; body: string }>
}) {
  const flow = flowOf(b)
  const open = isOpen(b.status)
  const moves = nextStatuses(flow, b.status).filter((s) => s !== "ASSIGNED")
  const assignable = ["REQUESTED", "CONFIRMED", "ASSIGNED", "ACCEPTED"].includes(b.status)
  const eligible = workers.filter((w) => w.skilled).sort((a, c) => Number(c.inArea) - Number(a.inArea) || a.busy - c.busy || c.rating - a.rating)

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <div className="card flex items-center gap-3 p-4">
          <Avatar name={b.contactName || b.customer.name} size={48} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-extrabold text-ink">{b.contactName || b.customer.name}</p>
            <p className="text-xs text-muted-foreground">{b.phone} · {named(locale, b.area)} · {formatDay(b.visitDate, locale)} {b.visitSlot}</p>
          </div>
          <Link href={`/admin/customers/${b.customerId}`} className="text-xs font-bold text-brand">{pick(locale, "প্রোফাইল", "Profile")}</Link>
        </div>

        {assignable ? (
          <Section title={b.worker ? pick(locale, "কর্মী বদলান", "Reassign worker") : pick(locale, "কর্মী ঠিক করুন", "Assign a worker")}>
            {b.worker ? <p className="mb-2 text-sm text-muted-foreground">{pick(locale, "এখন:", "Now:")} <span className="font-bold text-ink">{b.worker.user.name}</span></p> : null}
            {!eligible.length ? <p className="text-sm text-danger">{pick(locale, "এই সেবার দক্ষতাসহ কোনো সক্রিয় কর্মী নেই। Workers পেজে দক্ষতা যোগ করুন।", "No active worker has this skill. Add it on the Workers page.")}</p> : (
              <ActionForm action={assignWorkerAction} resetOnSuccess={false} className="flex gap-2">
                <input type="hidden" name="code" value={b.code} />
                <select name="workerId" className="field flex-1" defaultValue={b.workerId ?? eligible[0]?.id}>
                  {eligible.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} · ★{w.rating ? w.rating.toFixed(1) : "—"} · {w.busy} {pick(locale, "চলমান", "active")}{w.inArea ? ` · ${pick(locale, "এই এলাকায়", "in area")}` : ""}
                    </option>
                  ))}
                </select>
                <SubmitButton className="btn-primary shrink-0 px-4">{pick(locale, "ঠিক করুন", "Assign")}</SubmitButton>
              </ActionForm>
            )}
          </Section>
        ) : null}

        {open && moves.length ? (
          <Section title={pick(locale, "ধাপ বদলান", "Move status")}>
            <div className="flex flex-wrap gap-2">
              {moves.filter((s) => s !== "CANCELLED").map((s) => (
                <ActionForm key={s} action={moveBookingAction} resetOnSuccess={false} className="inline">
                  <input type="hidden" name="code" value={b.code} />
                  <input type="hidden" name="to" value={s} />
                  <SubmitButton className="btn-soft h-10 px-4 text-sm">{WORKER_BUTTON[s]?.[locale] ?? statusText(s, locale)}</SubmitButton>
                </ActionForm>
              ))}
            </div>
            {moves.includes("CANCELLED") ? (
              <ActionForm action={moveBookingAction} resetOnSuccess={false} className="mt-3 flex gap-2">
                <input type="hidden" name="code" value={b.code} />
                <input type="hidden" name="to" value="CANCELLED" />
                <input name="note" className="field flex-1" placeholder={pick(locale, "বাতিলের কারণ", "Cancel reason")} required minLength={3} />
                <SubmitButton className="btn-danger shrink-0 px-4">{pick(locale, "বাতিল", "Cancel")}</SubmitButton>
              </ActionForm>
            ) : null}
          </Section>
        ) : null}

        {b.pricing === "QUOTE" && b.quoteStatus !== "ACCEPTED" && open ? (
          <Section title={pick(locale, "দাম পাঠান", "Send quote")}>
            {b.quoteStatus === "SENT" ? <p className="mb-2 text-sm text-muted-foreground">{taka(b.quoteAmount ?? 0, locale)} {pick(locale, "পাঠানো আছে, কাস্টমারের অপেক্ষায়।", "sent, waiting on the customer.")}</p> : null}
            <ActionForm action={sendQuoteAction} className="flex gap-2">
              <input type="hidden" name="code" value={b.code} />
              <input name="amount" type="number" min={50} max={500000} required className="field w-32" placeholder="৳" />
              <input name="note" className="field flex-1" placeholder={pick(locale, "নোট", "Note")} maxLength={300} />
              <SubmitButton className="btn-soft shrink-0 px-4">{pick(locale, "পাঠান", "Send")}</SubmitButton>
            </ActionForm>
          </Section>
        ) : null}

        {open && ["REQUESTED", "CONFIRMED", "ASSIGNED", "ACCEPTED"].includes(b.status) ? (
          <Section title={pick(locale, "সময় বদলান", "Reschedule")}>
            <ActionForm action={rescheduleAction} resetOnSuccess={false} className="flex flex-wrap gap-2">
              <input type="hidden" name="code" value={b.code} />
              <select name="visitDate" defaultValue={b.visitDate} className="field flex-1">{upcomingDays(BOOKING_DAYS).map((d) => <option key={d} value={d}>{formatDay(d, locale)}</option>)}</select>
              <select name="visitSlot" defaultValue={b.visitSlot} className="field flex-1">{SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
              <SubmitButton className="btn-soft shrink-0 px-4">{pick(locale, "সেভ", "Save")}</SubmitButton>
            </ActionForm>
          </Section>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {isAdmin ? (
            <Section title={pick(locale, "দাম ঠিক করুন", "Set price")}>
              <ActionForm action={setPriceAction} resetOnSuccess={false} className="space-y-2">
                <input type="hidden" name="code" value={b.code} />
                <input name="finalPrice" type="number" min={0} defaultValue={b.finalPrice ?? billFor(b)} className="field" />
                <input name="note" className="field" placeholder={pick(locale, "কেন বদলালেন", "Why it changed")} maxLength={200} />
                <SubmitButton className="btn-soft w-full">{pick(locale, "দাম সেভ", "Save price")}</SubmitButton>
              </ActionForm>
            </Section>
          ) : null}
          <Section title={pick(locale, "বাতিল / রিফান্ড নোট", "Cancel / refund note")}>
            <ActionForm action={refundNoteAction} resetOnSuccess={false} className="space-y-2">
              <input type="hidden" name="code" value={b.code} />
              <textarea name="note" className="field min-h-20" defaultValue={b.refundNote} placeholder={pick(locale, "যেমন: ৫০০ টাকা বিকাশে ফেরত, TrxID…", "e.g. ৳500 refunded by bKash, TrxID…")} maxLength={500} />
              <SubmitButton className="btn-soft w-full">{pick(locale, "নোট সেভ", "Save note")}</SubmitButton>
            </ActionForm>
          </Section>
        </div>

        {b.status === "COMPLETED" && b.paymentStatus !== "PAID" ? (
          <Section title={pick(locale, `পেমেন্ট লিখুন: ${taka(b.finalPrice ?? billFor(b), locale)}`, `Record payment: ${taka(b.finalPrice ?? billFor(b), locale)}`)}>
            <ActionForm action={recordPaymentAction} resetOnSuccess={false} className="flex flex-wrap gap-2">
              <input type="hidden" name="code" value={b.code} />
              <select name="method" defaultValue={b.paymentMethod} className="field w-36">{PAYMENT_PROVIDERS.map((p) => <option key={p.id} value={p.id}>{locale === "bn" ? p.labelBn : p.label}</option>)}</select>
              <input name="reference" className="field flex-1" placeholder="TrxID" maxLength={40} />
              <SubmitButton className="btn-soft shrink-0 px-4">{pick(locale, "পরিশোধিত", "Paid")}</SubmitButton>
            </ActionForm>
          </Section>
        ) : null}

        <Section title={pick(locale, "চ্যাট", "Chat")} action={<Link href={`/support/tickets?booking=${b.code}`} className="inline-flex items-center gap-1 text-xs font-bold text-brand"><TicketCheck className="size-3.5" /> {pick(locale, "টিকেট", "Tickets")}</Link>}>
          <MessageList messages={messages} me={me} locale={locale} empty={pick(locale, "এখনো কোনো মেসেজ নেই।", "No messages yet.")} />
          <Composer action={sendBookingMessageAction} fields={{ code: b.code }} placeholder={pick(locale, "কাস্টমার ও কর্মীকে লিখুন…", "Write to the customer and worker…")} templates={templates} />
        </Section>
      </div>

      <div className="space-y-4">
        <Section title={pick(locale, "অবস্থা", "Status")}>
          <Timeline flow={flow} status={b.status} events={b.events} locale={locale} />
          {b.cancelReason ? <p className="mt-3 text-sm text-danger">{pick(locale, "বাতিলের কারণ:", "Cancel reason:")} {b.cancelReason}</p> : null}
          {b.adminNote ? <p className="mt-2 text-sm text-muted-foreground">{pick(locale, "অ্যাডমিন নোট:", "Admin note:")} {b.adminNote}</p> : null}
        </Section>
        <Section title={pick(locale, "বিস্তারিত", "Details")}>
          <BookingFacts booking={b} locale={locale} showCustomer />
        </Section>
        {b.review ? (
          <Section title={pick(locale, "রিভিউ", "Review")}>
            <p className="text-amber-400">{"★".repeat(b.review.rating)}</p>
            <p className="mt-1 text-sm">{b.review.comment}</p>
          </Section>
        ) : null}
      </div>
    </div>
  )
}
