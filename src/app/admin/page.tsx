import Link from "next/link"
import { AlertCircle, Banknote, ClipboardList, HardHat, Inbox, Loader, Users } from "lucide-react"
import { requireUser, getLocale } from "@/lib/auth"
import { dashboard, parsePeriod, type Period } from "@/lib/reports"
import { formatDay, taka } from "@/lib/format"
import { named, pick } from "@/lib/i18n"
import { statusText } from "@/lib/booking-flow"
import { StatusPill } from "@/components/bits"
import { CategoryIcon } from "@/components/category-icon"
import { RevenueBars, StatusDonut } from "@/components/admin/charts"
import { billFor } from "@/lib/pricing"

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ p?: string; from?: string; to?: string }> }) {
  const [{ p, from, to }, , locale] = await Promise.all([searchParams, requireUser(["ADMIN"], "/admin"), getLocale()])
  const period = parsePeriod(p)
  const d = await dashboard(period, from, to)
  const bn = locale === "bn"
  const periodLabel: Record<Period, string> = {
    today: pick(locale, "আজ", "Today"),
    week: pick(locale, "৭ দিন", "7 days"),
    month: pick(locale, "এই মাস", "This month"),
    year: pick(locale, "এই বছর", "This year"),
    custom: `${d.range.start} → ${d.range.end}`,
  }
  const running = (d.byStatus.CONFIRMED ?? 0) + (d.byStatus.ASSIGNED ?? 0) + (d.byStatus.ACCEPTED ?? 0) + (d.byStatus.ON_THE_WAY ?? 0) + (d.byStatus.ARRIVED ?? 0) + (d.byStatus.IN_PROGRESS ?? 0) + (d.byStatus.PICKED_UP ?? 0) + (d.byStatus.AT_LAUNDRY ?? 0) + (d.byStatus.READY ?? 0) + (d.byStatus.OUT_FOR_DELIVERY ?? 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="display mr-auto text-2xl font-extrabold text-ink md:text-3xl">{pick(locale, "ড্যাশবোর্ড", "Dashboard")}</h1>
        {(["today", "week", "month", "year"] as Period[]).map((k) => (
          <Link key={k} href={`/admin?p=${k}`} className="chip" data-on={period === k}>{periodLabel[k]}</Link>
        ))}
        <form className="flex items-center gap-1">
          <input type="hidden" name="p" value="custom" />
          <input type="date" name="from" defaultValue={period === "custom" ? d.range.start : ""} className="field h-9 w-36 text-xs" />
          <input type="date" name="to" defaultValue={period === "custom" ? d.range.end : ""} className="field h-9 w-36 text-xs" />
          <button className="chip" data-on={period === "custom"}>{pick(locale, "কাস্টম", "Custom")}</button>
        </form>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi primary icon={<Banknote className="size-5" />} label={`${pick(locale, "আয়", "Revenue")} · ${periodLabel[period]}`} value={taka(d.revenue, locale)} sub={pick(locale, `${d.completedCount}টা কাজ শেষ`, `${d.completedCount} jobs done`)} />
        <Kpi icon={<ClipboardList className="size-5" />} label={`${pick(locale, "বুকিং", "Bookings")} · ${periodLabel[period]}`} value={String(d.bookings)} sub={pick(locale, `${running}টা চলমান`, `${running} running`)} tone="teal" />
        <Kpi icon={<AlertCircle className="size-5" />} label={pick(locale, "কর্মী দরকার", "Needs a worker")} value={String(d.waiting)} sub={pick(locale, "নতুন অনুরোধ", "new requests")} tone="amber" href="/admin/bookings?status=REQUESTED" />
        <Kpi icon={<Loader className="size-5" />} label={pick(locale, "এখন চলছে", "Running now")} value={String(d.running)} sub={pick(locale, `${d.busyWorkers}/${d.workerCount} কর্মী ব্যস্ত`, `${d.busyWorkers}/${d.workerCount} workers busy`)} tone="green" />
        <Kpi icon={<Inbox className="size-5" />} label={pick(locale, "খোলা টিকেট", "Open tickets")} value={String(d.openTickets)} sub={d.urgentTickets ? pick(locale, `${d.urgentTickets}টা জরুরি`, `${d.urgentTickets} urgent`) : pick(locale, `${d.careOpen}টা চ্যাট`, `${d.careOpen} chats`)} tone={d.urgentTickets ? "danger" : "violet"} href="/support" />
        <Kpi icon={<Users className="size-5" />} label={pick(locale, "মোট কাস্টমার", "Customers")} value={String(d.customers)} sub={pick(locale, `${d.workerCount} জন কর্মী`, `${d.workerCount} workers`)} tone="ink" href="/admin/customers" />
      </div>

      {/* Status cards */}
      <section>
        <h2 className="display mb-3 text-lg font-extrabold text-ink">{pick(locale, "বুকিংয়ের অবস্থা", "Booking status")} · {periodLabel[period]}</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
          {["REQUESTED", "ASSIGNED", "ON_THE_WAY", "IN_PROGRESS", "AT_LAUNDRY", "COMPLETED", "CANCELLED"].map((s) => (
            <Link key={s} href={`/admin/bookings?status=${s}`} className="card flex items-center gap-3 p-3 transition hover:ring-brand/40">
              <StatusPill status={s} locale={locale} />
              <span className="ml-auto text-xl font-extrabold text-ink">{d.byStatus[s] ?? 0}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-3">
          <h2 className="display text-lg font-extrabold text-ink">{pick(locale, "দৈনিক আয়", "Daily revenue")} · {d.series.length === 7 ? pick(locale, "গত ৭ দিন", "last 7 days") : pick(locale, "গত ৩০ দিন", "last 30 days")}</h2>
          <div className="mt-3"><RevenueBars series={d.series} locale={locale} /></div>
        </section>
        <section className="card p-5 lg:col-span-2">
          <h2 className="display text-lg font-extrabold text-ink">{pick(locale, "অবস্থা অনুযায়ী", "By status")} · {periodLabel[period]}</h2>
          <div className="mt-4">
            <StatusDonut
              locale={locale}
              slices={[
                { label: statusText("COMPLETED", locale), value: d.byStatus.COMPLETED ?? 0, color: "var(--ok)" },
                { label: pick(locale, "চলছে", "Running"), value: running, color: "var(--teal)" },
                { label: statusText("REQUESTED", locale), value: d.byStatus.REQUESTED ?? 0, color: "var(--amber)" },
                { label: statusText("CANCELLED", locale), value: d.byStatus.CANCELLED ?? 0, color: "var(--danger)" },
              ]}
            />
          </div>
        </section>
      </div>

      {/* Top services + areas + workers */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-5">
          <h2 className="display text-lg font-extrabold text-ink">{pick(locale, "বেশি চলছে: সেবা", "Top services")}</h2>
          <ul className="mt-3 space-y-2">
            {d.topServices.map((s) => (
              <li key={s.id} className="flex items-center gap-3 text-sm">
                <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand"><CategoryIcon name={s.icon} className="size-4" /></span>
                <span className="flex-1 font-bold text-ink">{named(locale, s)}</span>
                <span className="text-muted-foreground">{s.bookings}</span>
                <span className="w-20 text-right font-extrabold">{taka(s.revenue, locale)}</span>
              </li>
            ))}
            {!d.topServices.length ? <li className="text-sm text-muted-foreground">—</li> : null}
          </ul>
        </section>
        <section className="card p-5">
          <h2 className="display text-lg font-extrabold text-ink">{pick(locale, "বেশি চলছে: এলাকা", "Top areas")}</h2>
          <ul className="mt-3 space-y-2">
            {d.topAreas.map((a) => (
              <li key={a.id} className="flex items-center gap-3 text-sm">
                <span className="flex-1 font-bold text-ink">{named(locale, a)}</span>
                <span className="text-muted-foreground">{a.bookings}</span>
                <span className="w-20 text-right font-extrabold">{taka(a.revenue, locale)}</span>
              </li>
            ))}
            {!d.topAreas.length ? <li className="text-sm text-muted-foreground">—</li> : null}
          </ul>
        </section>
        <section className="card p-5">
          <h2 className="display flex items-center gap-2 text-lg font-extrabold text-ink"><HardHat className="size-4 text-brand" /> {pick(locale, "কর্মীরা এখন", "Workers now")}</h2>
          <ul className="mt-3 space-y-2">
            {d.workers.slice(0, 8).map((w) => (
              <li key={w.id} className="flex items-center gap-2 text-sm">
                <span className={`size-2 rounded-full ${w.bookings.length ? "bg-ok" : "bg-line"}`} />
                <Link href={`/admin/workers/${w.id}`} className="flex-1 truncate font-bold text-ink">{w.user.name}</Link>
                <span className="text-xs text-muted-foreground">{w.bookings.length ? `${w.bookings.length} ${pick(locale, "জব", "jobs")}` : pick(locale, "ফ্রি", "free")}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Recent bookings */}
      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="display text-lg font-extrabold text-ink">{pick(locale, "সাম্প্রতিক বুকিং", "Recent bookings")}</h2>
          <Link href="/admin/bookings" className="text-sm font-bold text-brand">{pick(locale, "সব দেখুন", "See all")} →</Link>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="table">
            <thead><tr><th>{pick(locale, "বুকিং", "Booking")}</th><th>{pick(locale, "কাস্টমার", "Customer")}</th><th>{pick(locale, "সেবা", "Service")}</th><th>{pick(locale, "এলাকা", "Area")}</th><th>{pick(locale, "সময়", "When")}</th><th className="text-right">{pick(locale, "টাকা", "Amount")}</th><th>{pick(locale, "অবস্থা", "Status")}</th></tr></thead>
            <tbody>
              {d.recent.map((b) => (
                <tr key={b.id} className="hover:bg-canvas">
                  <td><Link href={`/admin/bookings/${b.code}`} className="font-extrabold text-brand">{b.code}</Link></td>
                  <td className="font-semibold">{b.customer.name}</td>
                  <td>{bn ? b.offering.nameBn : b.offering.name}</td>
                  <td>{bn ? b.area.nameBn : b.area.name}</td>
                  <td className="whitespace-nowrap">{formatDay(b.visitDate, locale)} <span className="text-muted-foreground">{b.visitSlot}</span></td>
                  <td className="text-right font-extrabold">{taka(b.finalPrice ?? billFor(b), locale)}</td>
                  <td><StatusPill status={b.status} locale={locale} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

const TONES: Record<string, string> = { teal: "bg-teal-50 text-teal-700", amber: "bg-amber-50 text-amber-700", green: "bg-emerald-50 text-emerald-700", violet: "bg-violet-50 text-violet-700", danger: "bg-rose-50 text-rose-700", ink: "bg-canvas text-ink" }

function Kpi({ icon, label, value, sub, primary = false, tone = "teal", href }: { icon: React.ReactNode; label: string; value: string; sub?: string; primary?: boolean; tone?: string; href?: string }) {
  const body = (
    <>
      <span className={`grid size-10 place-items-center rounded-xl ${primary ? "bg-white/20 text-white" : TONES[tone]}`}>{icon}</span>
      <span>
        <span className="display block text-2xl font-extrabold leading-tight">{value}</span>
        <span className={`block text-xs font-bold ${primary ? "text-white/75" : "text-muted-foreground"}`}>{label}</span>
        {sub ? <span className={`block text-[11px] ${primary ? "text-white/60" : "text-muted-foreground"}`}>{sub}</span> : null}
      </span>
    </>
  )
  return href ? <Link href={href} className="kpi transition hover:ring-brand/40" data-primary={primary}>{body}</Link> : <div className="kpi" data-primary={primary}>{body}</div>
}
