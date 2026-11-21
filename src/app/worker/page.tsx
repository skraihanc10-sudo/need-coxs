import Link from "next/link"
import { ChevronRight, MapPin, Phone } from "lucide-react"
import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { flowFor, WORKER_BUTTON, workerNext } from "@/lib/booking-flow"
import { formatDay, localToday, telHref } from "@/lib/format"
import { named, pick } from "@/lib/i18n"
import { CategoryIcon } from "@/components/category-icon"
import { EmptyState, PageHeader, StatusPill } from "@/components/bits"

export default async function WorkerHome() {
  const [user, locale] = await Promise.all([requireUser(["WORKER"], "/worker"), getLocale()])
  const today = localToday()
  const jobs = user.worker
    ? await db.serviceBooking.findMany({
        where: { workerId: user.worker.id, status: { notIn: ["COMPLETED", "CANCELLED"] } },
        orderBy: [{ visitDate: "asc" }, { visitSlot: "asc" }],
        include: { category: true, offering: true, area: true },
      })
    : []
  const todays = jobs.filter((j) => j.visitDate <= today)
  const later = jobs.filter((j) => j.visitDate > today)

  const Job = ({ j }: { j: (typeof jobs)[number] }) => {
    const next = workerNext(flowFor(j.category.flow), j.status)
    return (
      <Link href={`/worker/jobs/${j.code}`} className="card block p-4 transition hover:ring-brand/40">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><CategoryIcon name={j.category.icon} className="size-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-extrabold text-ink">{named(locale, j.offering)}</p>
            <p className="text-xs text-muted-foreground">{j.code} · {formatDay(j.visitDate, locale)} · <span className="font-bold text-ink">{j.visitSlot}</span></p>
          </div>
          <StatusPill status={j.status} locale={locale} />
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <span className="inline-flex min-w-0 items-center gap-1 text-muted-foreground"><MapPin className="size-3.5 shrink-0 text-brand" /><span className="truncate">{named(locale, j.area)} · {j.addressLine}</span></span>
          <a href={telHref(j.phone)} className="inline-flex shrink-0 items-center gap-1 font-bold text-brand"><Phone className="size-3.5" /> {j.contactName || pick(locale, "কল", "Call")}</a>
        </div>
        {next ? <p className="mt-3 rounded-xl bg-brand-soft px-3 py-2 text-center text-sm font-extrabold text-brand">{pick(locale, "পরের ধাপ:", "Next:")} {WORKER_BUTTON[next]?.[locale]}</p> : null}
      </Link>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={pick(locale, `আসসালামু আলাইকুম, ${user.name.split(" ")[0]}`, `Hello, ${user.name.split(" ")[0]}`)} sub={pick(locale, `আজ ${todays.length}টা জব`, `${todays.length} job${todays.length === 1 ? "" : "s"} today`)} />
      {!jobs.length ? (
        <EmptyState title={pick(locale, "এখন কোনো জব নেই", "No jobs right now")} body={pick(locale, "নতুন জব এলে এখানে দেখাবে আর নোটিশ পাবেন।", "New jobs show here and you'll get an alert.")} />
      ) : (
        <div className="space-y-6">
          {todays.length ? <section className="space-y-2"><h2 className="text-xs font-extrabold text-muted-foreground uppercase">{pick(locale, "আজ", "Today")}</h2>{todays.map((j) => <Job key={j.id} j={j} />)}</section> : null}
          {later.length ? <section className="space-y-2"><h2 className="text-xs font-extrabold text-muted-foreground uppercase">{pick(locale, "পরে", "Upcoming")}</h2>{later.map((j) => <Job key={j.id} j={j} />)}</section> : null}
        </div>
      )}
    </div>
  )
}
