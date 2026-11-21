import { notFound } from "next/navigation"
import { requireUser, getLocale } from "@/lib/auth"
import { PageHeader, ErrorNote, StatusPill } from "@/components/bits"
import { MessageList, TicketReply } from "@/components/thread-pane"
import { openTicket } from "@/lib/inbox"
import { AppError } from "@/lib/errors"

export default async function TicketPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["CUSTOMER"], "/help")
  const { code } = await params
  const { error } = await searchParams
  const locale = await getLocale()
  let ticket: Awaited<ReturnType<typeof openTicket>>
  try {
    ticket = await openTicket(user, code)
  } catch (err) {
    if (err instanceof AppError) notFound()
    throw err
  }
  return (
    <div>
      <PageHeader title={ticket.code} back="/help" />
      <ErrorNote message={error} />
      <div className="flex items-center justify-between px-4">
        <h2 className="font-extrabold">{ticket.subject}</h2>
        <StatusPill status={ticket.status} locale={locale} />
      </div>
      <MessageList me={user.id} locale={locale} messages={ticket.messages.map((message) => ({ id: message.id, body: message.body, senderId: message.senderId, senderName: message.sender.name, createdAt: message.createdAt }))} />
      {ticket.status === "OPEN" ? <TicketReply code={ticket.code} back="/help" canClose={false} /> : <p className="px-4 py-4 text-sm text-muted-foreground">{locale === "bn" ? "টিকিট বন্ধ।" : "This ticket is closed."}</p>}
    </div>
  )
}
