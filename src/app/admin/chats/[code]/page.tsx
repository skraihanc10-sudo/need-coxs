import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { ErrorNote } from "@/components/bits"
import { ChatBox, MessageList } from "@/components/thread-pane"
import { openBookingChat } from "@/lib/inbox"
import { AppError } from "@/lib/errors"

export default async function AdminChat({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["ADMIN"], "/admin/chats")
  const { code } = await params
  const { error } = await searchParams
  try {
    const data = await openBookingChat(user, code)
    return (
      <div className="p-4 md:p-8">
        <ErrorNote message={error} />
        <h1 className="text-2xl font-extrabold">{data.booking.code}</h1>
        <p className="text-sm text-muted-foreground">{data.booking.customer.name} · {data.booking.store.name}{data.booking.worker ? ` · ${data.booking.worker.user.name}` : ""}</p>
        <MessageList me={user.id} locale="en" messages={data.messages.map((message) => ({ id: message.id, body: message.body, senderId: message.senderId, senderName: message.sender.name, createdAt: message.createdAt }))} />
        <ChatBox code={code} back={`/admin/chats/${code}`} placeholder="Write in this thread" />
      </div>
    )
  } catch (err) {
    if (err instanceof AppError) notFound()
    throw err
  }
}
