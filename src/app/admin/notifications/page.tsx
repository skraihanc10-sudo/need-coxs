import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { getSettings } from "@/lib/settings"
import { saveNotifySettings } from "@/actions/admin"
import { formatWhen } from "@/lib/format"

export default async function NotificationsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser(["ADMIN"], "/admin/notifications")
  const sp = await searchParams
  const [settings, notices] = await Promise.all([
    getSettings(),
    db.notice.findMany({ orderBy: { createdAt: "desc" }, take: 30, include: { user: true } }),
  ])
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Notifications</h1>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">In-app notices show up immediately. Email, SMS, and push are queued for a worker. Nothing leaves the server until you connect a provider.</p>
      {sp.ok ? <p className="text-sm text-emerald-700">Saved.</p> : null}
      <form action={saveNotifySettings} className="mt-4 max-w-lg space-y-2">
        {[["notifyInApp", "In-app bell"], ["notifyEmail", "Email queue"], ["notifySms", "SMS queue"], ["notifyPush", "Push queue"]].map(([name, label]) => (
          <label key={name} className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name={name} defaultChecked={settings[name] === "1"} /> {label}
          </label>
        ))}
        <input name="fcmKey" defaultValue={settings.fcmKey} placeholder="FCM server key (stored, not used yet)" className="h-11 w-full rounded-xl border px-3" />
        <button className="pill bg-primary text-primary-foreground">Save</button>
      </form>
      <h2 className="mt-6 font-extrabold">Recent queue</h2>
      <div className="mt-2 space-y-2">
        {notices.map((notice) => (
          <p key={notice.id} className="text-sm">{notice.channel} · {notice.status} · {notice.user?.name ?? "—"} · {notice.body} · {formatWhen(notice.createdAt, "en")}</p>
        ))}
      </div>
    </div>
  )
}
