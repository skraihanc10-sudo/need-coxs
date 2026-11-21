import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { workerShare } from "@/lib/bookings"
import { getSettings } from "@/lib/settings"
import { dayStart, formatDay, localDate, localToday, shiftDays, taka } from "@/lib/format"
import { named, pick } from "@/lib/i18n"
import { PageHeader, Section } from "@/components/bits"

export default async function EarningsPage() {
  const [user, locale, settings] = await Promise.all([requireUser(["WORKER"], "/worker/earnings"), getLocale(), getSettings()])
  const share = Number(settings.workerShare) || 40
  const jobs = user.worker
    ? await db.serviceBooking.findMany({
        where: { workerId: user.worker.id, status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
        include: { offering: true, area: true },
        take: 200,
      })
    : []
  const rows = jobs.map((j) => ({ ...j, pay: workerShare(j.finalPrice ?? j.estimatedPrice, j.visitCharge, share), day: localDate(j.completedAt!) }))
  const today = localToday()
  const week = shiftDays(today, -6)
  const month = `${today.slice(0, 7)}-01`
  const sum = (from: string) => rows.filter((r) => r.day >= from).reduce((s, r) => s + r.pay, 0)
  const since = dayStart(month)
  void since

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={pick(locale, "আমার আয়", "My earnings")} sub={pick(locale, `প্রতিটা কাজের ${share}% আপনার, ভিজিট চার্জের অর্ধেকসহ`, `${share}% of each job is yours, plus half the visit charge`)} />
      <div className="grid grid-cols-3 gap-2">
        {[[pick(locale, "আজ", "Today"), sum(today)], [pick(locale, "৭ দিন", "7 days"), sum(week)], [pick(locale, "এই মাস", "This month"), sum(month)]].map(([label, value], i) => (
          <div key={label as string} className="kpi p-4" data-primary={i === 2}>
            <p className={`text-xs font-bold ${i === 2 ? "text-white/70" : "text-muted-foreground"}`}>{label as string}</p>
            <p className="text-xl font-extrabold">{taka(value as number, locale)}</p>
          </div>
        ))}
      </div>
      <Section title={pick(locale, "শেষ করা কাজ", "Completed jobs")} className="mt-4">
        {!rows.length ? <p className="py-6 text-center text-sm text-muted-foreground">{pick(locale, "এখনো কোনো কাজ শেষ হয়নি।", "No completed jobs yet.")}</p> : (
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink">{named(locale, r.offering)} · {named(locale, r.area)}</p>
                  <p className="text-xs text-muted-foreground">{r.code} · {formatDay(r.day, locale)} · {pick(locale, "বিল", "bill")} {taka(r.finalPrice ?? r.estimatedPrice, locale)}</p>
                </div>
                <span className="shrink-0 font-extrabold text-ok">+{taka(r.pay, locale)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}
