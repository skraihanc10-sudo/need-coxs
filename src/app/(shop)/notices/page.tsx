import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { copy } from "@/lib/i18n"
import { PageHeader, EmptyState } from "@/components/bits"
import { formatWhen } from "@/lib/format"
import { markNoticesRead } from "@/actions/auth"

export default async function NoticesPage() {
  const user = await requireUser(["CUSTOMER"], "/notices")
  const locale = await getLocale()
  const t = copy(locale)
  const notices = await db.notice.findMany({
    where: { userId: user.id, channel: "IN_APP" },
    orderBy: { createdAt: "desc" },
    take: 40,
  })
  return (
    <div>
      <PageHeader title={t.notices} back="/" />
      {!notices.length ? <EmptyState title={t.notices} body={t.findSub} /> : null}
      <div className="space-y-3 px-4">
        {notices.map((notice) => (
          <article key={notice.id} className="rounded-2xl border p-3">
            <p className="font-bold">{notice.title}</p>
            <p className="text-sm">{notice.body}</p>
            <p className="text-xs text-muted-foreground">{formatWhen(notice.createdAt, locale)}</p>
          </article>
        ))}
      </div>
      {notices.some((notice) => !notice.read) ? (
        <form action={markNoticesRead} className="px-4 py-4">
          <button className="text-sm font-bold text-[var(--brand)]">Mark all read</button>
        </form>
      ) : null}
    </div>
  )
}
