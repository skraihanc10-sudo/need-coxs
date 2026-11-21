import Link from "next/link"
import { requireUser } from "@/lib/auth"
import { listAllBookingChats } from "@/lib/inbox"

export default async function AdminChats() {
  await requireUser(["ADMIN"], "/admin/chats")
  const threads = await listAllBookingChats()
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Booking chats</h1>
      <p className="text-sm text-muted-foreground">Customer, provider, and the assigned field worker share one thread. You can read every thread.</p>
      <div className="mt-4 space-y-2">
        {!threads.length ? <p className="text-sm text-muted-foreground">No booking messages yet.</p> : null}
        {threads.map((thread) => (
          <Link key={thread.id} href={`/admin/chats/${thread.booking.code}`} className="block rounded-2xl border bg-white px-3 py-3">
            <span className="font-bold">{thread.booking.code}</span>
            <span className="block text-xs text-muted-foreground">{thread.booking.customer.name} · {thread.booking.store.name} · {thread.messages[0]?.body ?? "No messages"}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
