import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { copy } from "@/lib/i18n"
import { PageHeader } from "@/components/bits"
import { LiveRefresh } from "@/components/interactive"
import { ChatComposer } from "./composer"
import { formatWhen } from "@/lib/format"

export default async function ChatPage() {
  const user = await requireUser(["CUSTOMER"], "/chat")
  const locale = await getLocale()
  const t = copy(locale)
  const thread = await db.thread.findUnique({
    where: { customerId: user.id },
    include: { messages: { include: { sender: true }, orderBy: { createdAt: "asc" } } },
  })
  return (
    <div>
      <PageHeader title={t.chatTitle} />
      <LiveRefresh />
      <p className="px-4 text-sm text-muted-foreground">{t.chatHint}</p>
      <div className="mt-3 space-y-2 px-4 pb-4">
        {thread?.messages.map((message) => {
          const mine = message.senderId === user.id
          return (
            <div key={message.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>
              <p>{message.body}</p>
              <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-muted-foreground"}`}>{formatWhen(message.createdAt, locale)}</p>
            </div>
          )
        })}
      </div>
      <ChatComposer placeholder={t.chatPlaceholder} send={t.send} />
    </div>
  )
}
