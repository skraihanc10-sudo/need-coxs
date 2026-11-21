import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { PageHeader, ErrorNote } from "@/components/bits"
import { ChatBox, MessageList } from "@/components/thread-pane"
import { openBookingChat } from "@/lib/inbox"
import { AppError } from "@/lib/errors"

export default async function RiderThread({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["DELIVERY"], "/rider/chat")
  const { code } = await params
  const { error } = await searchParams
  try {
    const data = await openBookingChat(user, code)
    return (
      <div>
        <PageHeader title={data.booking.code} back="/rider/chat" />
        <ErrorNote message={error} />
        <p className="px-4 text-sm">{data.booking.customer.name} · {data.booking.store.name}</p>
        <MessageList me={user.id} locale="en" messages={data.messages.map((message) => ({ id: message.id, body: message.body, senderId: message.senderId, senderName: message.sender.name, createdAt: message.createdAt }))} />
        <ChatBox code={code} back={`/rider/chat/${code}`} placeholder="Message the job" />
      </div>
    )
  } catch (err) {
    if (err instanceof AppError) notFound()
    throw err
  }
}
