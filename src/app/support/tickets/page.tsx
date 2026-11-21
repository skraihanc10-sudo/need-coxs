import Link from "next/link"
import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from "@/lib/support"
import { formatWhen } from "@/lib/format"
import { pick } from "@/lib/i18n"
import { PageHeader } from "@/components/bits"

export default async function TicketsPage({ searchParams }: { searchParams: Promise<{ status?: string; booking?: string }> }) {
  const [{ status = "", booking = "" }, , locale] = await Promise.all([searchParams, requireUser(["SUPPORT", "ADMIN"], "/support/tickets"), getLocale()])
  const tickets = await db.ticket.findMany({
    where: { ...(status ? { status } : { status: { in: ["OPEN", "PENDING"] } }), ...(booking ? { booking: { code: booking } } : {}) },
    orderBy: [{ updatedAt: "desc" }],
    include: { user: { select: { name: true } }, assignee: { select: { name: true } }, booking: { select: { code: true } } },
    take: 200,
  })
  return (
    <div>
      <PageHeader title={pick(locale, "টিকেট", "Tickets")} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/support/tickets" className="chip" data-on={!status}>{pick(locale, "খোলা", "Open")}</Link>
        {Object.entries(TICKET_STATUSES).map(([k, v]) => <Link key={k} href={`/support/tickets?status=${k}`} className="chip" data-on={status === k}>{v[locale]}</Link>)}
      </div>
      {!tickets.length ? <p className="card px-4 py-10 text-center text-sm text-muted-foreground">{pick(locale, "কোনো টিকেট নেই", "No tickets")}</p> : (
        <ul className="space-y-2">
          {tickets.map((t) => (
            <li key={t.id}>
              <Link href={`/support/tickets/${t.code}`} className="card flex items-center gap-3 p-4">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-extrabold text-ink">{t.code} · {t.subject}</span>
                  <span className="block text-xs text-muted-foreground">{t.user.name} · {TICKET_CATEGORIES[t.category as keyof typeof TICKET_CATEGORIES]?.[locale]}{t.booking ? ` · ${t.booking.code}` : ""} · {t.assignee?.name ?? pick(locale, "কেউ নেয়নি", "Unassigned")} · {formatWhen(t.updatedAt, locale)}</span>
                </span>
                <span className={`pill ${t.priority === "URGENT" ? "bg-danger text-white" : t.priority === "HIGH" ? "bg-amber-100 text-amber-800" : "bg-canvas text-ink"}`}>{TICKET_PRIORITIES[t.priority as keyof typeof TICKET_PRIORITIES]?.[locale]}</span>
                <span className="pill bg-canvas text-ink">{TICKET_STATUSES[t.status as keyof typeof TICKET_STATUSES]?.[locale]}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
