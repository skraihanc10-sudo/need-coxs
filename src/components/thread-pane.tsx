import { LiveRefresh } from "@/components/interactive"
import { formatWhen, type Locale } from "@/lib/format"
import { sendBookingChatAction, replyTicketAction } from "@/actions/inbox"

export function MessageList({
  me,
  locale,
  messages,
}: {
  me: string
  locale: Locale
  messages: { id: string; body: string; senderId: string; senderName: string; createdAt: Date }[]
}) {
  return (
    <div className="mt-3 space-y-2 px-4">
      <LiveRefresh />
      {!messages.length ? <p className="text-sm text-muted-foreground">No messages yet.</p> : null}
      {messages.map((message) => {
        const mine = message.senderId === me
        return (
          <div key={message.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>
            <p className={`text-[10px] font-bold ${mine ? "text-white/70" : "text-muted-foreground"}`}>{message.senderName}</p>
            <p>{message.body}</p>
            <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-muted-foreground"}`}>{formatWhen(message.createdAt, locale)}</p>
          </div>
        )
      })}
    </div>
  )
}

export function ChatBox({ code, back, placeholder }: { code: string; back: string; placeholder: string }) {
  return (
    <form action={sendBookingChatAction} className="sticky bottom-[4.8rem] z-10 flex gap-2 bg-white px-4 py-3">
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="back" value={back} />
      <input name="body" required maxLength={1000} placeholder={placeholder} className="h-12 flex-1 rounded-full border px-4" />
      <button type="submit" className="rounded-full bg-[var(--accent)] px-4 text-sm font-extrabold text-[#06283a]">Send</button>
    </form>
  )
}

export function TicketReply({ code, back, canClose }: { code: string; back: string; canClose: boolean }) {
  return (
    <form action={replyTicketAction} className="space-y-2 px-4 py-4">
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="back" value={back} />
      <textarea name="body" rows={3} className="w-full rounded-xl border px-3 py-2" placeholder="Reply" />
      <div className="flex gap-2">
        <button type="submit" className="pill bg-primary px-4 text-primary-foreground">Send</button>
        {canClose ? <button type="submit" name="close" value="1" className="rounded-full border px-4 text-sm font-bold">Close ticket</button> : null}
      </div>
    </form>
  )
}
