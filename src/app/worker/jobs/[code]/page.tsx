import { notFound } from "next/navigation"
import { Camera, Phone } from "lucide-react"
import { requireUser, getLocale } from "@/lib/auth"
import { flowOf } from "@/lib/bookings"
import { isOpen, WORKER_BUTTON, workerNext } from "@/lib/booking-flow"
import { AppError } from "@/lib/errors"
import { taka, telHref } from "@/lib/format"
import { named, pick } from "@/lib/i18n"
import { billFor, unitLabel, usesQuantity } from "@/lib/pricing"
import { PAYMENT_PROVIDERS } from "@/lib/payments"
import { bookingChat } from "@/lib/support"
import { moveBookingAction, recordPaymentAction, sendQuoteAction, setQuantityAction, uploadPhotosAction } from "@/actions/booking"
import { sendBookingMessageAction } from "@/actions/support"
import { ActionForm, SubmitButton } from "@/components/forms"
import { Composer, MessageList } from "@/components/chat-pane"
import { PageHeader, Section, StatusPill } from "@/components/bits"
import { Timeline } from "@/components/booking/timeline"
import { BookingFacts } from "@/components/booking/details"

export default async function WorkerJobPage({ params }: { params: Promise<{ code: string }> }) {
  const [{ code }, locale] = await Promise.all([params, getLocale()])
  const user = await requireUser(["WORKER"], `/worker/jobs/${code}`)
  let data
  try {
    data = await bookingChat(user, code)
  } catch (error) {
    if (error instanceof AppError) notFound()
    throw error
  }
  const { booking: b, thread } = data
  const flow = flowOf(b)
  const next = workerNext(flow, b.status)
  const open = isOpen(b.status)
  const quoteNeeded = b.pricing === "QUOTE" && b.quoteStatus !== "ACCEPTED" && open
  const blockedByQuote = next === "IN_PROGRESS" && b.pricing === "QUOTE" && b.quoteStatus !== "ACCEPTED"

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader back="/worker" title={named(locale, b.offering)} sub={`${b.code} · ${named(locale, b.category)}`} action={<StatusPill status={b.status} locale={locale} className="mt-1" />} />

      {/* Customer + call */}
      <div className="card flex items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-muted-foreground uppercase">{pick(locale, "কাস্টমার", "Customer")}</p>
          <p className="truncate font-extrabold text-ink">{b.contactName || b.customer.name}</p>
          <p className="text-xs text-muted-foreground">{b.visitSlot} · {named(locale, b.area)}</p>
        </div>
        <a href={telHref(b.phone)} className="btn-primary h-11 px-4"><Phone className="size-4" /> {pick(locale, "কল", "Call")}</a>
      </div>

      {/* The big button */}
      {next ? (
        <ActionForm action={moveBookingAction} resetOnSuccess={false}>
          <input type="hidden" name="code" value={b.code} />
          <input type="hidden" name="to" value={next} />
          {blockedByQuote ? (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-800">{pick(locale, "আগে দাম পাঠান। কাস্টমার মেনে নিলে কাজ শুরু করা যাবে।", "Send the quote first. Work starts once the customer accepts.")}</p>
          ) : (
            <SubmitButton className="btn-primary h-16 w-full text-lg" pendingText="…">{WORKER_BUTTON[next]?.[locale]}</SubmitButton>
          )}
        </ActionForm>
      ) : null}

      {quoteNeeded ? (
        <Section title={pick(locale, "দাম পাঠান", "Send a quote")}>
          {b.quoteStatus === "SENT" ? <p className="mb-2 text-sm text-muted-foreground">{pick(locale, `${taka(b.quoteAmount ?? 0, locale)} পাঠানো হয়েছে, কাস্টমারের উত্তরের অপেক্ষায়। বদলাতে চাইলে নতুন দাম দিন।`, `${taka(b.quoteAmount ?? 0, locale)} sent; waiting for the customer. Send a new amount to change it.`)}</p> : null}
          <ActionForm action={sendQuoteAction} className="flex gap-2">
            <input type="hidden" name="code" value={b.code} />
            <input name="amount" type="number" inputMode="numeric" min={50} max={500000} required className="field w-32" placeholder="৳" />
            <input name="note" className="field flex-1" placeholder={pick(locale, "কী কী লাগবে (ঐচ্ছিক)", "What's included (optional)")} maxLength={300} />
            <SubmitButton className="btn-soft shrink-0 px-4">{pick(locale, "পাঠান", "Send")}</SubmitButton>
          </ActionForm>
        </Section>
      ) : null}

      {usesQuantity(b.pricing) && open ? (
        <Section title={pick(locale, `আসল ${unitLabel(b.pricing, locale)}`, `Actual ${unitLabel(b.pricing, locale)}`)}>
          <ActionForm action={setQuantityAction} resetOnSuccess={false} className="flex gap-2">
            <input type="hidden" name="code" value={b.code} />
            <input name="quantity" type="number" step="0.5" min={0.5} max={500} defaultValue={b.quantity} className="field w-32" />
            <SubmitButton className="btn-soft shrink-0 px-4">{pick(locale, "আপডেট", "Update")}</SubmitButton>
          </ActionForm>
          <p className="mt-2 text-xs text-muted-foreground">{pick(locale, "কাপড় মেপে বা কাজ দেখে আসল পরিমাণ লিখুন; বিল সেই অনুযায়ী হবে।", "Enter the real amount after weighing or seeing the job; the bill follows it.")}</p>
        </Section>
      ) : null}

      {b.status === "COMPLETED" && b.paymentStatus !== "PAID" ? (
        <Section title={pick(locale, `টাকা নিন: ${taka(b.finalPrice ?? billFor(b), locale)}`, `Collect ${taka(b.finalPrice ?? billFor(b), locale)}`)}>
          <ActionForm action={recordPaymentAction} resetOnSuccess={false} className="space-y-2">
            <input type="hidden" name="code" value={b.code} />
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_PROVIDERS.map((p) => (
                <label key={p.id} className="chip cursor-pointer justify-center has-checked:border-brand has-checked:bg-brand has-checked:text-white">
                  <input type="radio" name="method" value={p.id} defaultChecked={p.id === b.paymentMethod} className="sr-only" />
                  {locale === "bn" ? p.labelBn : p.label}
                </label>
              ))}
            </div>
            <input name="reference" className="field" placeholder={pick(locale, "বিকাশ/নগদ TrxID (ক্যাশ হলে ফাঁকা)", "bKash/Nagad TrxID (blank for cash)")} maxLength={40} />
            <SubmitButton>{pick(locale, "টাকা নেওয়া হয়েছে", "Payment received")}</SubmitButton>
          </ActionForm>
        </Section>
      ) : null}

      <Section title={pick(locale, "অবস্থা", "Status")}>
        <Timeline flow={flow} status={b.status} events={b.events} locale={locale} showHistory={false} />
      </Section>

      <Section title={pick(locale, "কাজের বিস্তারিত", "Job details")}>
        <BookingFacts booking={b} locale={locale} />
      </Section>

      {open || b.status === "COMPLETED" ? (
        <Section title={pick(locale, "কাজের ছবি", "Job photos")}>
          <div className="grid grid-cols-2 gap-2">
            {(["BEFORE", "AFTER"] as const).map((kind) => (
              <ActionForm key={kind} action={uploadPhotosAction}>
                <input type="hidden" name="code" value={b.code} />
                <input type="hidden" name="kind" value={kind} />
                <label className="btn-ghost w-full cursor-pointer">
                  <Camera className="size-4" /> {kind === "BEFORE" ? pick(locale, "আগের ছবি", "Before") : pick(locale, "পরের ছবি", "After")}
                  <input type="file" name="photos" accept="image/*" capture="environment" multiple className="sr-only" />
                </label>
                <SubmitButton className="btn-soft mt-2 h-10 w-full text-sm">{pick(locale, "আপলোড", "Upload")}</SubmitButton>
              </ActionForm>
            ))}
          </div>
        </Section>
      ) : null}

      <Section title={pick(locale, "চ্যাট", "Chat")}>
        <MessageList messages={thread.messages} me={user.id} locale={locale} empty={pick(locale, "কাস্টমার বা অফিসকে কিছু জানাতে এখানে লিখুন।", "Message the customer or the office here.")} />
        <Composer action={sendBookingMessageAction} fields={{ code: b.code }} placeholder={pick(locale, "বার্তা লিখুন…", "Write a message…")} />
      </Section>
    </div>
  )
}
