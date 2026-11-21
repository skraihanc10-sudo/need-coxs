import Link from "next/link"
import { MessageSquareText, TicketCheck, ClipboardList } from "lucide-react"
import { requireUser, getLocale } from "@/lib/auth"
import { inbox, TICKET_PRIORITIES } from "@/lib/support"
import { formatWhen } from "@/lib/format"
import { pick } from "@/lib/i18n"
import { PageHeader } from "@/components/bits"

const ICON = { CARE: MessageSquareText, TICKET: TicketCheck, BOOKING: ClipboardList }

export default async function SupportInbox({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const [{ f = "all" }, user, locale] = await Promise.all([searchParams, requireUser(["SUPPORT", "ADMIN"], "/support"), getLocale()])
  const filter = f === "mine" || f === "unread" ? f : "all"
  const items = await inbox(user, filter)
  return (
    <div>
      <PageHeader title={pick(locale, "সাপোর্ট ইনবক্স", "Support inbox")} sub={pick(locale, "কাস্টমার কেয়ার চ্যাট, টিকেট আর বুকিং চ্যাট এক জায়গায়। না-পড়া আগে।", "Care chats, tickets and booking chats together. Unread first.")} />
      <div className="mb-4 flex gap-2">
        {[["all", pick(locale, "সব", "All")], ["unread", pick(locale, "না-পড়া", "Unread")], ["mine", pick(locale, "আমার", "Mine")]].map(([k, label]) => (
          <Link key={k} href={`/support?f=${k}`} className="chip" data-on={filter === k}>{label}</Link>
        ))}
      </div>
      {!items.length ? <p className="card px-4 py-12 text-center text-sm text-muted-foreground">{pick(locale, "সব সামলানো হয়ে গেছে 🎉", "All caught up 🎉")}</p> : (
        <ul className="space-y-2">
          {items.map((it) => {
            const Icon = ICON[it.kind]
            return (
              <li key={`${it.kind}-${it.id}`}>
                <Link href={it.href} className={`card flex items-start gap-3 p-4 transition hover:ring-brand/40 ${it.unread ? "border-l-4 border-l-brand" : ""}`}>
                  <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${it.kind === "TICKET" ? "bg-amber-50 text-amber-600" : "bg-brand-soft text-brand"}`}><Icon className="size-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={`truncate ${it.unread ? "font-extrabold text-ink" : "font-bold text-ink"}`}>{it.title}</span>
                      {it.priority !== "NORMAL" ? <span className={`pill ${it.priority === "URGENT" ? "bg-danger text-white" : it.priority === "HIGH" ? "bg-amber-100 text-amber-800" : "bg-canvas text-muted-foreground"}`}>{TICKET_PRIORITIES[it.priority as keyof typeof TICKET_PRIORITIES]?.[locale]}</span> : null}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">{it.subtitle ? `${it.subtitle} · ` : ""}{it.preview}</span>
                  </span>
                  <span className="shrink-0 text-right text-[11px] text-muted-foreground">
                    <span className="block">{formatWhen(it.updatedAt, locale)}</span>
                    <span className="block">{it.assignee ? (it.mine ? pick(locale, "আমার", "Mine") : it.assignee) : pick(locale, "কেউ নেয়নি", "Unassigned")}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
