import { notFound } from "next/navigation"
import { CalendarClock, MessageCircle, XCircle } from "lucide-react"
import { requireUser, getLocale } from "@/lib/auth"
import { BOOKING_DAYS, flowOf, SLOTS } from "@/lib/bookings"
import { customerCanChange } from "@/lib/booking-flow"
import { AppError } from "@/lib/errors"
import { formatDay, taka, upcomingDays } from "@/lib/format"
import { named, pick } from "@/lib/i18n"
import { bookingChat } from "@/lib/support"
import { answerQuoteAction, moveBookingAction, rescheduleAction, reviewAction } from "@/actions/booking"
import { sendBookingMessageAction } from "@/actions/support"
import { PageHeader, Section, StatusPill } from "@/components/bits"
import { ActionForm, Stars, SubmitButton } from "@/components/forms"
import { Composer, MessageList } from "@/components/chat-pane"
import { Timeline } from "@/components/booking/timeline"
import { BookingFacts, WorkerCard } from "@/components/booking/details"

export default async function BookingPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ new?: string }> }) {
  const [{ code }, { new: fresh }, locale] = await Promise.all([params, searchParams, getLocale()])
  const user = await requireUser(["CUSTOMER"], `/bookings/${code}`)
  let data
  try {
    data = await bookingChat(user, code)
  } catch (error) {
    if (error instanceof AppError) notFound()
    throw error
  }
  const { booking: b, thread } = data
  const flow = flowOf(b)
  const changeable = customerCanChange(b.status)

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader back="/bookings" title={named(locale, b.offering)} sub={`${b.code} · ${named(locale, b.category)}`} action={<StatusPill status={b.status} locale={locale} className="mt-1" />} />

      {fresh ? (
        <div className="mb-4 rounded-2xl bg-ok/10 px-4 py-3 text-sm font-bold text-emerald-900">
          {pick(locale, "বুকিং হয়ে গেছে! আমরা শিগগিরই কর্মী ঠিক করে জানাব। এই পেজে লাইভ আপডেট পাবেন।", "Booked! We'll assign a worker shortly. Live updates show here.")}
        </div>
      ) : null}

      {b.quoteStatus === "SENT" && b.quoteAmount ? (
        <Section className="mb-4 border-l-4 border-l-brand">
          <p className="text-xs font-extrabold text-brand uppercase">{pick(locale, "দাম এসেছে", "Quote received")}</p>
          <p className="display mt-1 text-3xl font-extrabold text-ink">{taka(b.quoteAmount, locale)}{b.visitCharge ? <span className="text-sm font-semibold text-muted-foreground"> + {taka(b.visitCharge, locale)} {pick(locale, "ভিজিট", "visit")}</span> : null}</p>
          {b.quoteNote ? <p className="mt-1 text-sm text-muted-foreground">{b.quoteNote}</p> : null}
          <p className="mt-2 text-sm text-muted-foreground">{pick(locale, "মেনে নিলে কর্মী কাজ শুরু করবেন। না মানলে বুকিং বাতিল হবে।", "Accept and the worker starts. Decline and the booking is cancelled.")}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <ActionForm action={answerQuoteAction} resetOnSuccess={false}>
              <input type="hidden" name="code" value={b.code} />
              <input type="hidden" name="answer" value="accept" />
              <SubmitButton>{pick(locale, "মেনে নিলাম", "Accept")}</SubmitButton>
            </ActionForm>
            <ActionForm action={answerQuoteAction} resetOnSuccess={false}>
              <input type="hidden" name="code" value={b.code} />
              <input type="hidden" name="answer" value="decline" />
              <SubmitButton className="btn-ghost w-full">{pick(locale, "মানছি না", "Decline")}</SubmitButton>
            </ActionForm>
          </div>
        </Section>
      ) : null}

      <div className="space-y-4">
        <WorkerCard booking={b} locale={locale} />

        <Section title={pick(locale, "অবস্থা", "Status")}>
          <Timeline flow={flow} status={b.status} events={b.events} locale={locale} />
          {b.status === "CANCELLED" && b.cancelReason ? <p className="mt-3 text-sm text-danger">{pick(locale, "কারণ:", "Reason:")} {b.cancelReason}</p> : null}
        </Section>

        <Section title={pick(locale, "বিস্তারিত", "Details")}>
          <BookingFacts booking={b} locale={locale} />
        </Section>

        {b.status === "COMPLETED" && !b.review ? (
          <Section title={pick(locale, "কেমন লাগল?", "How was it?")}>
            <ActionForm action={reviewAction} className="space-y-3">
              <input type="hidden" name="code" value={b.code} />
              <Stars />
              <textarea name="comment" className="field" placeholder={pick(locale, "দুই লাইনে লিখুন কাজটা কেমন হলো", "A couple of lines about the job")} required minLength={3} maxLength={1000} />
              <SubmitButton>{pick(locale, "রিভিউ দিন", "Submit review")}</SubmitButton>
            </ActionForm>
          </Section>
        ) : null}
        {b.review ? (
          <Section title={pick(locale, "আপনার রিভিউ", "Your review")}>
            <p className="text-amber-400">{"★".repeat(b.review.rating)}<span className="text-line">{"★".repeat(5 - b.review.rating)}</span></p>
            <p className="mt-1 text-[15px]">{b.review.comment}</p>
          </Section>
        ) : null}

        {changeable ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Section title={pick(locale, "সময় বদলান", "Reschedule")}>
              <ActionForm action={rescheduleAction} resetOnSuccess={false} className="space-y-3">
                <input type="hidden" name="code" value={b.code} />
                <select name="visitDate" defaultValue={b.visitDate} className="field">
                  {upcomingDays(BOOKING_DAYS).map((d) => <option key={d} value={d}>{formatDay(d, locale)}</option>)}
                </select>
                <select name="visitSlot" defaultValue={b.visitSlot} className="field">
                  {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <SubmitButton className="btn-soft w-full"><CalendarClock className="size-4" /> {pick(locale, "নতুন সময় সেভ করুন", "Save new time")}</SubmitButton>
              </ActionForm>
            </Section>
            <Section title={pick(locale, "বাতিল করুন", "Cancel")}>
              <ActionForm action={moveBookingAction} resetOnSuccess={false} className="space-y-3">
                <input type="hidden" name="code" value={b.code} />
                <input type="hidden" name="to" value="CANCELLED" />
                <input name="note" className="field" placeholder={pick(locale, "কেন বাতিল করছেন?", "Why are you cancelling?")} required minLength={3} maxLength={200} />
                <SubmitButton className="btn-danger w-full"><XCircle className="size-4" /> {pick(locale, "বুকিং বাতিল করুন", "Cancel booking")}</SubmitButton>
              </ActionForm>
            </Section>
          </div>
        ) : null}

        <Section title={pick(locale, "চ্যাট", "Chat")} action={<MessageCircle className="size-4 text-muted-foreground" />}>
          <p className="mb-3 text-xs text-muted-foreground">{pick(locale, "কর্মী আর কাস্টমার কেয়ার দুজনেই এই চ্যাট দেখেন।", "Both your worker and customer care see this chat.")}</p>
          <MessageList messages={thread.messages} me={user.id} locale={locale} empty={pick(locale, "কোনো প্রশ্ন থাকলে এখানে লিখুন।", "Ask anything about this booking here.")} />
          <Composer action={sendBookingMessageAction} fields={{ code: b.code }} placeholder={pick(locale, "বার্তা লিখুন…", "Write a message…")} />
        </Section>
      </div>
    </div>
  )
}
