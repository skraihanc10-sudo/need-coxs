import Link from "next/link"
import { requireUser, getLocale } from "@/lib/auth"
import { copy } from "@/lib/i18n"
import { PageHeader } from "@/components/bits"
import { listBookingChats, listTickets } from "@/lib/inbox"
import { formatWhen } from "@/lib/format"

export default async function ChatInbox() {
  const user = await requireUser(["CUSTOMER"], "/chat")
  const locale = await getLocale()
  const t = copy(locale)
  const bn = locale === "bn"
  const [chats, tickets] = await Promise.all([listBookingChats(user), listTickets(user)])
  const ticketUnread = tickets.reduce((sum, row) => sum + row.unread, 0)
  return (
    <div className="pb-6">
      <PageHeader title={t.chatTitle} />
      <div className="space-y-2 px-4">
        <Link href="/chat/desk" className="surface-card flex items-center justify-between p-3">
          <span>
            <span className="block font-extrabold">{bn ? "কাস্টমার কেয়ার" : "Customer care"}</span>
            <span className="text-xs text-muted-foreground">{t.chatHint}</span>
          </span>
        </Link>
        <Link href="/help" className="surface-card flex items-center justify-between p-3">
          <span className="font-extrabold">{bn ? "সাপোর্ট টিকিট" : "Support tickets"}</span>
          {ticketUnread ? <span className="grid size-6 place-items-center rounded-full bg-rose-600 text-xs font-bold text-white">{ticketUnread}</span> : null}
        </Link>
        <h2 className="pt-3 text-sm font-extrabold">{bn ? "বুকিং চ্যাট" : "Booking chats"}</h2>
        {!chats.length ? <p className="text-sm text-muted-foreground">{bn ? "বুক করলে এখানে চ্যাট খুলবে।" : "A chat opens here after you book."}</p> : null}
        {chats.map(({ booking, latest, unread }) => (
          <Link key={booking.id} href={`/chat/b/${booking.code}`} className="flex items-center justify-between rounded-2xl border px-3 py-3">
            <span>
              <span className="block font-bold">{locale === "bn" ? booking.offering.nameBn : booking.offering.name}</span>
              <span className="text-xs text-muted-foreground">{booking.code} · {latest ? latest.body.slice(0, 60) : booking.store.name}</span>
            </span>
            <span className="text-right">
              {unread ? <span className="grid size-6 place-items-center rounded-full bg-rose-600 text-xs font-bold text-white">{unread}</span> : null}
              {latest ? <span className="mt-1 block text-[10px] text-muted-foreground">{formatWhen(latest.createdAt, locale)}</span> : null}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
