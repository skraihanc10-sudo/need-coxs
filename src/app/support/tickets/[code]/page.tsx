import Link from "next/link"
import { notFound } from "next/navigation"
import { requireUser, getLocale } from "@/lib/auth"
import { AppError } from "@/lib/errors"
import { ticketFor, TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from "@/lib/support"
import { replyTemplates } from "@/lib/office"
import { pick } from "@/lib/i18n"
import { replyTicketAction, updateTicketAction } from "@/actions/support"
import { ActionButton, ActionForm, SubmitButton } from "@/components/forms"
import { Composer, MessageList } from "@/components/chat-pane"
import { PageHeader, Section } from "@/components/bits"

export default async function OfficeTicketPage({ params }: { params: Promise<{ code: string }> }) {
  const [{ code }, user, locale, templates] = await Promise.all([params, requireUser(["SUPPORT", "ADMIN"], "/support/tickets"), getLocale(), replyTemplates()])
  let ticket
  try {
    ticket = await ticketFor(user, code)
  } catch (error) {
    if (error instanceof AppError) notFound()
    throw error
  }
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div>
        <PageHeader back="/support/tickets" title={ticket.subject} sub={`${ticket.code} · ${ticket.user.name} · ${TICKET_CATEGORIES[ticket.category as keyof typeof TICKET_CATEGORIES]?.[locale]}`} />
        <div className="card p-4">
          <MessageList messages={ticket.messages} me={user.id} locale={locale} empty="" />
          {ticket.status !== "CLOSED" ? <Composer action={replyTicketAction} fields={{ code: ticket.code }} placeholder={pick(locale, "উত্তর লিখুন…", "Write a reply…")} templates={templates} /> : null}
        </div>
      </div>
      <div className="space-y-4">
        <Section title={pick(locale, "টিকেট", "Ticket")}>
          <ActionForm action={updateTicketAction} resetOnSuccess={false} className="space-y-3">
            <input type="hidden" name="code" value={ticket.code} />
            <div>
              <label className="label">{pick(locale, "অবস্থা", "Status")}</label>
              <select name="status" defaultValue={ticket.status} className="field">{Object.entries(TICKET_STATUSES).map(([k, v]) => <option key={k} value={k}>{v[locale]}</option>)}</select>
            </div>
            <div>
              <label className="label">{pick(locale, "প্রায়োরিটি", "Priority")}</label>
              <select name="priority" defaultValue={ticket.priority} className="field">{Object.entries(TICKET_PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v[locale]}</option>)}</select>
            </div>
            <SubmitButton className="btn-soft w-full">{pick(locale, "সেভ", "Save")}</SubmitButton>
          </ActionForm>
          <div className="mt-3 text-sm text-muted-foreground">
            {pick(locale, "দেখছেন:", "Assigned:")} <span className="font-bold text-ink">{ticket.assignee?.name ?? pick(locale, "কেউ না", "nobody")}</span>
            {ticket.assigneeId !== user.id ? <span className="ml-2"><ActionButton action={updateTicketAction} fields={{ code: ticket.code, assignToMe: "1" }} className="text-xs font-bold text-brand underline">{pick(locale, "আমি নিচ্ছি", "Take it")}</ActionButton></span> : null}
          </div>
        </Section>
        <Section title={pick(locale, "কাস্টমার", "Customer")}>
          <p className="font-bold text-ink">{ticket.user.name}</p>
          <p className="text-sm text-muted-foreground">{ticket.user.phone} {ticket.user.email}</p>
          {ticket.booking ? <Link href={`/support/bookings/${ticket.booking.code}`} className="mt-2 inline-block text-sm font-bold text-brand">{pick(locale, "বুকিং", "Booking")} {ticket.booking.code} →</Link> : null}
          <Link href={`/admin/customers/${ticket.userId}`} className="mt-1 block text-sm font-bold text-brand">{pick(locale, "প্রোফাইল ও ইতিহাস", "Profile & history")} →</Link>
        </Section>
      </div>
    </div>
  )
}
