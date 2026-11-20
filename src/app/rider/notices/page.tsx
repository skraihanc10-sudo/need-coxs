import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/bits"
import { formatWhen } from "@/lib/format"

export default async function RiderNotices() {
  const user = await requireUser(["DELIVERY"], "/rider/notices")
  const notices = await db.notice.findMany({
    where: { userId: user.id, channel: "IN_APP" },
    orderBy: { createdAt: "desc" },
    take: 40,
  })
  return (
    <div>
      <PageHeader title="Notifications" />
      <div className="space-y-3 px-4">
        {notices.map((notice) => (
          <article key={notice.id} className="rounded-2xl border p-3">
            <p className="font-bold">{notice.title}</p>
            <p className="text-sm">{notice.body}</p>
            <p className="text-xs text-muted-foreground">{formatWhen(notice.createdAt, "en")}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
