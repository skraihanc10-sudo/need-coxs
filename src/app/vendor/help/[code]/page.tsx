import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { PageHeader, ErrorNote } from "@/components/bits"
import { MessageList, TicketReply } from "@/components/thread-pane"
import { openTicket } from "@/lib/inbox"
import { AppError } from "@/lib/errors"

export default async function VendorTicket({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["STORE"], "/vendor/help")
  const { code } = await params
  const { error } = await searchParams
  try {
    const ticket = await openTicket(user, code)
    return (
      <div>
        <PageHeader title={ticket.code} back="/vendor/help" />
        <ErrorNote message={error} />
        <p className="px-4 font-extrabold">{ticket.subject}</p>
        <MessageList me={user.id} locale="en" messages={ticket.messages.map((message) => ({ id: message.id, body: message.body, senderId: message.senderId, senderName: message.sender.name, createdAt: message.createdAt }))} />
        <TicketReply code={ticket.code} back="/vendor/help" canClose={false} />
      </div>
    )
  } catch (err) {
    if (err instanceof AppError) notFound()
    throw err
  }
}
