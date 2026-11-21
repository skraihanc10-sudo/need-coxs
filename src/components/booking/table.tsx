import Link from "next/link"
import { formatDay, taka, type Locale } from "@/lib/format"
import { named, pick } from "@/lib/i18n"
import { billFor } from "@/lib/pricing"
import { StatusPill } from "@/components/bits"

type Row = {
  id: string
  code: string
  status: string
  visitDate: string
  visitSlot: string
  pricing: string
  estimatedPrice: number
  visitCharge: number
  quoteAmount: number | null
  quoteStatus: string
  finalPrice: number | null
  customer: { name: string }
  offering: { name: string; nameBn: string }
  area: { name: string; nameBn: string }
  worker: { user: { name: string } } | null
}

/** Booking list as a table on desktop and cards on phones. */
export function BookingTable({ rows, locale, base }: { rows: Row[]; locale: Locale; base: string }) {
  if (!rows.length) return <p className="card px-4 py-10 text-center text-sm text-muted-foreground">{pick(locale, "কোনো বুকিং নেই", "No bookings")}</p>
  return (
    <>
      <div className="card hidden overflow-x-auto md:block">
        <table className="table">
          <thead>
            <tr>
              <th>{pick(locale, "বুকিং", "Booking")}</th>
              <th>{pick(locale, "কাস্টমার", "Customer")}</th>
              <th>{pick(locale, "সেবা", "Service")}</th>
              <th>{pick(locale, "এলাকা", "Area")}</th>
              <th>{pick(locale, "সময়", "When")}</th>
              <th>{pick(locale, "কর্মী", "Worker")}</th>
              <th className="text-right">{pick(locale, "টাকা", "Amount")}</th>
              <th>{pick(locale, "অবস্থা", "Status")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-canvas">
                <td><Link href={`${base}/${r.code}`} className="font-extrabold text-brand">{r.code}</Link></td>
                <td className="font-semibold">{r.customer.name}</td>
                <td>{named(locale, r.offering)}</td>
                <td>{named(locale, r.area)}</td>
                <td className="whitespace-nowrap">{formatDay(r.visitDate, locale)} <span className="text-muted-foreground">{r.visitSlot}</span></td>
                <td>{r.worker?.user.name ?? <span className="text-amber-600">{pick(locale, "কেউ না", "None")}</span>}</td>
                <td className="text-right font-extrabold">{taka(r.finalPrice ?? billFor(r), locale)}</td>
                <td><StatusPill status={r.status} locale={locale} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-2 md:hidden">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`${base}/${r.code}`} className="card block p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-brand">{r.code}</span>
                <StatusPill status={r.status} locale={locale} />
              </div>
              <p className="mt-1 font-bold text-ink">{named(locale, r.offering)} · {r.customer.name}</p>
              <p className="text-xs text-muted-foreground">{named(locale, r.area)} · {formatDay(r.visitDate, locale)} {r.visitSlot} · {r.worker?.user.name ?? pick(locale, "কর্মী নেই", "no worker")} · {taka(r.finalPrice ?? billFor(r), locale)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
