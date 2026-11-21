import Link from "next/link"
import { Download } from "lucide-react"
import { requireUser, getLocale } from "@/lib/auth"
import { parsePeriod, periodRange, report, type Period, type ReportGroup } from "@/lib/reports"
import { taka } from "@/lib/format"
import { pick } from "@/lib/i18n"
import { PageHeader } from "@/components/bits"

const GROUPS: Array<[ReportGroup, string, string]> = [
  ["day", "দৈনিক", "Daily"],
  ["week", "সাপ্তাহিক", "Weekly"],
  ["month", "মাসিক", "Monthly"],
  ["service", "সেবা অনুযায়ী", "By service"],
  ["worker", "কর্মী অনুযায়ী", "By worker"],
  ["area", "এলাকা অনুযায়ী", "By area"],
]

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ p?: string; from?: string; to?: string; g?: string }> }) {
  const [{ p, from, to, g }, , locale] = await Promise.all([searchParams, requireUser(["ADMIN"], "/admin/reports"), getLocale()])
  const period: Period = parsePeriod(p ?? "month")
  const group = (GROUPS.some(([k]) => k === g) ? g : "day") as ReportGroup
  const range = periodRange(period, from, to)
  const r = await report(range, group)
  const qs = `p=${period}&from=${range.start}&to=${range.end}&g=${group}`
  return (
    <div className="space-y-4">
      <PageHeader title={pick(locale, "রিপোর্ট", "Reports")} sub={`${range.start} → ${range.end} · ${pick(locale, "শুধু শেষ হওয়া কাজ", "completed jobs only")}`} action={<a href={`/admin/reports/csv?${qs}`} className="btn-soft h-10 px-4 text-sm"><Download className="size-4" /> CSV</a>} />
      <div className="flex flex-wrap items-center gap-2">
        {(["today", "week", "month", "year"] as Period[]).map((k) => (
          <Link key={k} href={`/admin/reports?p=${k}&g=${group}`} className="chip" data-on={period === k}>{{ today: pick(locale, "আজ", "Today"), week: pick(locale, "৭ দিন", "7 days"), month: pick(locale, "এই মাস", "This month"), year: pick(locale, "এই বছর", "This year"), custom: "" }[k]}</Link>
        ))}
        <form className="flex items-center gap-1">
          <input type="hidden" name="p" value="custom" /><input type="hidden" name="g" value={group} />
          <input type="date" name="from" defaultValue={range.start} className="field h-9 w-36 text-xs" />
          <input type="date" name="to" defaultValue={range.end} className="field h-9 w-36 text-xs" />
          <button className="chip" data-on={period === "custom"}>{pick(locale, "কাস্টম", "Custom")}</button>
        </form>
      </div>
      <div className="flex flex-wrap gap-2">
        {GROUPS.map(([k, b, e]) => <Link key={k} href={`/admin/reports?p=${period}&from=${range.start}&to=${range.end}&g=${k}`} className="chip" data-on={group === k}>{locale === "bn" ? b : e}</Link>)}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[[pick(locale, "আয়", "Revenue"), taka(r.total.revenue, locale), true], [pick(locale, "কাজ", "Jobs"), String(r.total.jobs)], [pick(locale, `কর্মীর পাওনা (${r.share}%)`, `Worker pay (${r.share}%)`), taka(r.total.workerPay, locale)], [pick(locale, "ক্যাশ", "Cash"), taka(r.total.cash, locale)], [pick(locale, "বিকাশ/নগদ", "bKash/Nagad"), taka(r.total.mobile, locale)]].map(([label, value, primary]) => (
          <div key={label as string} className="kpi p-4" data-primary={Boolean(primary)}>
            <p className={`text-xs font-bold ${primary ? "text-white/70" : "text-muted-foreground"}`}>{label as string}</p>
            <p className="display text-xl font-extrabold">{value as string}</p>
          </div>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>{GROUPS.find(([k]) => k === group)?.[locale === "bn" ? 1 : 2]}</th><th className="text-right">{pick(locale, "কাজ", "Jobs")}</th><th className="text-right">{pick(locale, "আয়", "Revenue")}</th><th className="text-right">{pick(locale, "কর্মীর পাওনা", "Worker pay")}</th><th className="text-right">{pick(locale, "মার্জিন", "Margin")}</th><th className="text-right">{pick(locale, "ক্যাশ", "Cash")}</th><th className="text-right">{pick(locale, "মোবাইল", "Mobile")}</th></tr></thead>
          <tbody>
            {r.rows.map((row) => (
              <tr key={row.key}>
                <td className="font-bold">{locale === "bn" ? row.labelBn : row.label}</td>
                <td className="text-right">{row.jobs}</td>
                <td className="text-right font-extrabold">{taka(row.revenue, locale)}</td>
                <td className="text-right">{taka(row.workerPay, locale)}</td>
                <td className="text-right text-ok">{taka(row.revenue - row.workerPay, locale)}</td>
                <td className="text-right">{taka(row.cash, locale)}</td>
                <td className="text-right">{taka(row.mobile, locale)}</td>
              </tr>
            ))}
            {!r.rows.length ? <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">{pick(locale, "এই সময়ে কোনো কাজ শেষ হয়নি", "No completed jobs in this range")}</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
