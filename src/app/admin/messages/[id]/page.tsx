import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { adminReply } from "@/actions/admin"
import { LiveRefresh } from "@/components/interactive"
import { formatWhen } from "@/lib/format"
import Link from "next/link"

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(["ADMIN"], "/admin/messages")
  const { id } = await params
  const thread = await db.thread.findUnique({
    where: { id },
    include: { customer: true, messages: { include: { sender: true }, orderBy: { createdAt: "asc" } } },
  })
  if (!thread) notFound()
  return (
    <div className="p-4 md:p-8">
      <LiveRefresh />
      <Link href="/admin/messages" className="text-sm font-bold text-[var(--brand)]">All chats</Link>
      <h1 className="mt-2 text-2xl font-extrabold">{thread.customer.name}</h1>
      <div className="mt-4 max-w-xl space-y-2">
        {thread.messages.map((message) => {
          const mine = message.senderId === user.id
          return (
            <div key={message.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? "ml-auto bg-primary text-primary-foreground" : "bg-white"}`}>
              <p>{message.body}</p>
              <p className="mt-1 text-[10px] opacity-70">{formatWhen(message.createdAt, "en")}</p>
            </div>
          )
        })}
      </div>
      <form action={adminReply} className="mt-4 flex max-w-xl gap-2">
        <input type="hidden" name="threadId" value={thread.id} />
        <input name="body" required placeholder="Reply" className="h-12 flex-1 rounded-full border bg-white px-4" />
        <button className="rounded-full bg-[var(--accent)] px-4 text-sm font-extrabold text-[#06283a]">Send</button>
      </form>
    </div>
  )
}
