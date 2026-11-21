import { notFound } from "next/navigation"
import { requireUser, getLocale } from "@/lib/auth"
import { AppError } from "@/lib/errors"
import { pick } from "@/lib/i18n"
import { ticketFor, TICKET_CATEGORIES, TICKET_STATUSES } from "@/lib/support"
import { replyTicketAction, updateTicketAction } from "@/actions/support"
import { ActionForm, SubmitButton } from "@/components/forms"
import { Composer, MessageList } from "@/components/chat-pane"
import { PageHeader } from "@/components/bits"

export default async function TicketPage({ params }: { params: Promise<{ code: string }> }) {
  const [{ code }, locale] = await Promise.all([params, getLocale()])
  const user = await requireUser(["CUSTOMER"], `/help/tickets/${code}`)
  let ticket
  try {
    ticket = await ticketFor(user, code)
  } catch (error) {
    if (error instanceof AppError) notFound()
    throw error
  }
  const closed = ticket.status === "CLOSED"
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader back="/help" title={ticket.subject} sub={`${ticket.code} · ${TICKET_CATEGORIES[ticket.category as keyof typeof TICKET_CATEGORIES]?.[locale]}${ticket.booking ? ` · ${ticket.booking.code}` : ""}`} action={<span className="pill mt-1 bg-canvas text-ink">{TICKET_STATUSES[ticket.status as keyof typeof TICKET_STATUSES]?.[locale]}</span>} />
      <div className="card p-4">
        <MessageList messages={ticket.messages} me={user.id} locale={locale} empty="" />
        {closed ? (
          <p className="mt-4 rounded-xl bg-canvas px-4 py-3 text-center text-sm text-muted-foreground">{pick(locale, "টিকেটটা বন্ধ। নতুন সমস্যা হলে নতুন টিকেট খুলুন।", "This ticket is closed. Open a new one for a new issue.")}</p>
        ) : (
          <>
            <Composer action={replyTicketAction} fields={{ code: ticket.code }} placeholder={pick(locale, "উত্তর লিখুন…", "Write a reply…")} />
            <ActionForm action={updateTicketAction} resetOnSuccess={false} className="mt-3 text-center">
              <input type="hidden" name="code" value={ticket.code} />
              <input type="hidden" name="status" value="CLOSED" />
              <SubmitButton className="text-xs font-bold text-muted-foreground underline">{pick(locale, "সমাধান হয়েছে, টিকেট বন্ধ করুন", "Solved — close this ticket")}</SubmitButton>
            </ActionForm>
          </>
        )}
      </div>
    </div>
  )
}
