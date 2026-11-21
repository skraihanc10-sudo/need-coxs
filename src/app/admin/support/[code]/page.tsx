import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { ErrorNote } from "@/components/bits"
import { MessageList, TicketReply } from "@/components/thread-pane"
import { openTicket } from "@/lib/inbox"
import { AppError } from "@/lib/errors"

export default async function AdminTicket({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["ADMIN"], "/admin/support")
  const { code } = await params
  const { error } = await searchParams
  try {
    const ticket = await openTicket(user, code)
    return (
      <div className="p-4 md:p-8">
        <ErrorNote message={error} />
        <h1 className="text-2xl font-extrabold">{ticket.subject}</h1>
        <p className="text-sm text-muted-foreground">{ticket.code} · {ticket.user.name} · {ticket.user.email} · {ticket.status}</p>
        <MessageList me={user.id} locale="en" messages={ticket.messages.map((message) => ({ id: message.id, body: message.body, senderId: message.senderId, senderName: message.sender.name, createdAt: message.createdAt }))} />
        <TicketReply code={ticket.code} back="/admin/support" canClose={ticket.status === "OPEN"} />
      </div>
    )
  } catch (err) {
    if (err instanceof AppError) notFound()
    throw err
  }
}
