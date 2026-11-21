import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { named, pick } from "@/lib/i18n"
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "@/lib/support"
import { createTicketAction } from "@/actions/support"
import { ActionForm, SubmitButton } from "@/components/forms"
import { PageHeader } from "@/components/bits"

export default async function NewTicketPage({ searchParams }: { searchParams: Promise<{ booking?: string }> }) {
  const [{ booking = "" }, user, locale] = await Promise.all([searchParams, requireUser(["CUSTOMER"], "/help/tickets/new"), getLocale()])
  const bookings = await db.serviceBooking.findMany({ where: { customerId: user.id }, orderBy: { createdAt: "desc" }, take: 20, include: { offering: true } })
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader back="/help" title={pick(locale, "নতুন টিকেট", "New ticket")} sub={pick(locale, "অভিযোগ, রিফান্ড বা অন্য কিছু। আমরা লিখিত উত্তর দেব।", "A complaint, refund or anything else. We reply in writing.")} />
      <ActionForm action={createTicketAction} resetOnSuccess={false} className="card space-y-4 p-5">
        <div>
          <label className="label" htmlFor="category">{pick(locale, "বিষয়ের ধরন", "Type")}</label>
          <select id="category" name="category" className="field" defaultValue="COMPLAINT">
            {Object.entries(TICKET_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v[locale]}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="bookingCode">{pick(locale, "কোন বুকিং নিয়ে? (ঐচ্ছিক)", "About which booking? (optional)")}</label>
          <select id="bookingCode" name="bookingCode" className="field" defaultValue={booking}>
            <option value="">—</option>
            {bookings.map((b) => <option key={b.id} value={b.code}>{b.code} · {named(locale, b.offering)}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="subject">{pick(locale, "বিষয়", "Subject")}</label>
          <input id="subject" name="subject" className="field" required minLength={4} maxLength={120} />
        </div>
        <div>
          <label className="label" htmlFor="body">{pick(locale, "বিস্তারিত", "Details")}</label>
          <textarea id="body" name="body" className="field" required minLength={5} maxLength={2000} />
        </div>
        <div>
          <label className="label" htmlFor="priority">{pick(locale, "কতটা জরুরি?", "How urgent?")}</label>
          <select id="priority" name="priority" className="field" defaultValue="NORMAL">
            {Object.entries(TICKET_PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v[locale]}</option>)}
          </select>
        </div>
        <SubmitButton>{pick(locale, "টিকেট পাঠান", "Send ticket")}</SubmitButton>
      </ActionForm>
    </div>
  )
}
