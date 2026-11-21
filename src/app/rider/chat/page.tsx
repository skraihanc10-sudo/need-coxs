import Link from "next/link"
import { requireUser } from "@/lib/auth"
import { listBookingChats } from "@/lib/inbox"

export default async function RiderChat() {
  const user = await requireUser(["DELIVERY"], "/rider/chat")
  const chats = await listBookingChats(user)
  return (
    <div className="px-4 py-5">
      <h1 className="text-2xl font-extrabold">Job chats</h1>
      <div className="mt-4 space-y-2">
        {!chats.length ? <p className="text-sm text-muted-foreground">You will see a chat after a provider assigns you.</p> : null}
        {chats.map(({ booking, latest, unread }) => (
          <Link key={booking.id} href={`/rider/chat/${booking.code}`} className="flex items-center justify-between rounded-2xl border px-3 py-3">
            <span>
              <span className="block font-bold">{booking.offering.name}</span>
              <span className="text-xs text-muted-foreground">{booking.code} · {latest?.body ?? booking.customer.name}</span>
            </span>
            {unread ? <span className="grid size-6 place-items-center rounded-full bg-rose-600 text-xs font-bold text-white">{unread}</span> : null}
          </Link>
        ))}
      </div>
    </div>
  )
}
