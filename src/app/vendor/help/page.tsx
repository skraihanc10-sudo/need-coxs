import Link from "next/link"
import { requireUser } from "@/lib/auth"
import { listTickets } from "@/lib/inbox"
import { createTicketAction } from "@/actions/inbox"
import { ErrorNote } from "@/components/bits"

export default async function VendorHelp({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["STORE"], "/vendor/help")
  const { error } = await searchParams
  const tickets = await listTickets(user)
  return (
    <div className="px-4 py-5">
      <h1 className="text-2xl font-extrabold">Support</h1>
      <ErrorNote message={error} />
      <form action={createTicketAction} className="mt-4 space-y-2">
        <input type="hidden" name="back" value="/vendor/help" />
        <input name="subject" required minLength={3} placeholder="Subject" className="h-12 w-full rounded-xl border px-3" />
        <textarea name="body" required minLength={3} rows={3} placeholder="What do you need?" className="w-full rounded-xl border px-3 py-2" />
        <button type="submit" className="pill bg-primary px-4 text-primary-foreground">Open ticket</button>
      </form>
      <div className="mt-4 space-y-2">
        {tickets.map(({ ticket, unread }) => (
          <Link key={ticket.id} href={`/vendor/help/${ticket.code}`} className="flex items-center justify-between rounded-2xl border px-3 py-3">
            <span className="font-bold">{ticket.subject}<span className="block text-xs font-normal text-muted-foreground">{ticket.code} · {ticket.status}</span></span>
            {unread ? <span className="grid size-6 place-items-center rounded-full bg-rose-600 text-xs font-bold text-white">{unread}</span> : null}
          </Link>
        ))}
      </div>
    </div>
  )
}
