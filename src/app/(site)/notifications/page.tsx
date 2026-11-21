import Link from "next/link"
import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatWhen } from "@/lib/format"
import { pick, words } from "@/lib/i18n"
import { markNoticesReadAction } from "@/actions/auth"
import { EmptyState, PageHeader } from "@/components/bits"

export default async function NotificationsPage() {
  const [user, locale] = await Promise.all([requireUser(["CUSTOMER"], "/notifications"), getLocale()])
  const t = words(locale)
  const notices = await db.notice.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 })
  const unread = notices.some((n) => !n.read)
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader back="/profile" title={t.notifications} action={unread ? <form action={markNoticesReadAction}><button className="text-sm font-bold text-brand">{pick(locale, "সব পড়া হয়েছে", "Mark all read")}</button></form> : undefined} />
      {!notices.length ? (
        <EmptyState title={t.empty} />
      ) : (
        <ul className="space-y-2">
          {notices.map((n) => (
            <li key={n.id}>
              <Link href={n.link || "#"} className={`card block p-4 ${n.read ? "" : "border-l-4 border-l-brand"}`}>
                <p className="font-extrabold text-ink">{n.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{formatWhen(n.createdAt, locale)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
