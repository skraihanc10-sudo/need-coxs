import Link from "next/link"
import { requireUser } from "@/lib/auth"
import { listTickets } from "@/lib/inbox"

export default async function AdminSupport() {
  const user = await requireUser(["ADMIN"], "/admin/support")
  const tickets = await listTickets(user)
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Support tickets</h1>
      <div className="mt-4 space-y-2">
        {!tickets.length ? <p className="text-sm text-muted-foreground">No tickets yet.</p> : null}
        {tickets.map(({ ticket, latest, unread }) => (
          <Link key={ticket.id} href={`/admin/support/${ticket.code}`} className="flex items-center justify-between rounded-2xl border bg-white px-3 py-3">
            <span>
              <span className="font-bold">{ticket.subject}</span>
              <span className="block text-xs text-muted-foreground">{ticket.code} · {ticket.user.name} · {ticket.status} · {latest?.body ?? ""}</span>
            </span>
            {unread ? <span className="grid size-6 place-items-center rounded-full bg-rose-600 text-xs font-bold text-white">{unread}</span> : null}
          </Link>
        ))}
      </div>
    </div>
  )
}
