import { notFound } from "next/navigation"
import { requireUser, getLocale } from "@/lib/auth"
import { PageHeader, ErrorNote } from "@/components/bits"
import { ChatBox, MessageList } from "@/components/thread-pane"
import { openBookingChat } from "@/lib/inbox"
import { AppError } from "@/lib/errors"

export default async function BookingChatPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["CUSTOMER"], "/chat")
  const { code } = await params
  const { error } = await searchParams
  const locale = await getLocale()
  let data: Awaited<ReturnType<typeof openBookingChat>>
  try {
    data = await openBookingChat(user, code)
  } catch (err) {
    if (err instanceof AppError) notFound()
    throw err
  }
  return (
    <div>
      <PageHeader title={data.booking.code} back="/chat" />
      <ErrorNote message={error} />
      <p className="px-4 text-sm text-muted-foreground">{data.booking.store.name} · {locale === "bn" ? data.booking.offering.nameBn : data.booking.offering.name}</p>
      <MessageList
        me={user.id}
        locale={locale}
        messages={data.messages.map((message) => ({ id: message.id, body: message.body, senderId: message.senderId, senderName: message.sender.name, createdAt: message.createdAt }))}
      />
      <ChatBox code={code} back={`/chat/b/${code}`} placeholder={locale === "bn" ? "প্রোভাইডারকে লিখুন" : "Message the provider"} />
    </div>
  )
}
