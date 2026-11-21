import Link from "next/link"
import { notFound } from "next/navigation"
import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { workerShare } from "@/lib/bookings"
import { getSettings } from "@/lib/settings"
import { formatDay, taka } from "@/lib/format"
import { named, pick } from "@/lib/i18n"
import { PageHeader, Section, StatusPill } from "@/components/bits"
import { WorkerForm } from "@/components/admin/worker-form"

export default async function WorkerPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, , locale, settings] = await Promise.all([params, requireUser(["ADMIN"], "/admin/workers"), getLocale(), getSettings()])
  const worker = await db.workerProfile.findUnique({
    where: { id },
    include: {
      user: true,
      skills: true,
      areas: true,
      bookings: { orderBy: { createdAt: "desc" }, take: 30, include: { offering: true, area: true, review: true } },
    },
  })
  if (!worker) notFound()
  const [categories, areas] = await Promise.all([db.serviceCategory.findMany({ orderBy: { sort: "asc" } }), db.serviceArea.findMany({ orderBy: { sort: "asc" } })])
  const done = worker.bookings.filter((b) => b.status === "COMPLETED")
  const share = Number(settings.workerShare) || 40
  const earned = done.reduce((s, b) => s + workerShare(b.finalPrice ?? b.estimatedPrice, b.visitCharge, share), 0)
  return (
    <div className="space-y-6">
      <PageHeader back="/admin/workers" title={worker.user.name} sub={`★ ${worker.rating ? worker.rating.toFixed(1) : "—"} (${worker.ratingCount}) · ${done.length} ${pick(locale, "কাজ শেষ", "jobs done")} · ${pick(locale, "আয়", "earned")} ${taka(earned, locale)}`} />
      <WorkerForm locale={locale} worker={worker} categories={categories} areas={areas} />
      <Section title={pick(locale, "কাজের ইতিহাস ও পারফরম্যান্স", "Job history & performance")}>
        <ul className="divide-y divide-line">
          {worker.bookings.map((b) => (
            <li key={b.id} className="flex items-center gap-3 py-2.5 text-sm">
              <Link href={`/admin/bookings/${b.code}`} className="font-extrabold text-brand">{b.code}</Link>
              <span className="flex-1 truncate">{named(locale, b.offering)} · {named(locale, b.area)} · {formatDay(b.visitDate, locale)}</span>
              {b.review ? <span className="text-amber-400">{"★".repeat(b.review.rating)}</span> : null}
              <StatusPill status={b.status} locale={locale} />
            </li>
          ))}
          {!worker.bookings.length ? <li className="py-4 text-sm text-muted-foreground">{pick(locale, "এখনো কোনো কাজ নেই", "No jobs yet")}</li> : null}
        </ul>
      </Section>
    </div>
  )
}
