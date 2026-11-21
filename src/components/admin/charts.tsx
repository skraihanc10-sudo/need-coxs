import { formatDay, taka, type Locale } from "@/lib/format"

/** Revenue per day as inline SVG bars. No chart library, prints crisp. */
export function RevenueBars({ series, locale }: { series: Array<{ day: string; revenue: number }>; locale: Locale }) {
  const max = Math.max(1, ...series.map((s) => s.revenue))
  const w = 100 / series.length
  return (
    <div>
      <svg viewBox="0 0 100 46" className="h-44 w-full" preserveAspectRatio="none" role="img" aria-label="Revenue">
        {series.map((s, i) => {
          const h = (s.revenue / max) * 40
          return (
            <g key={s.day}>
              <rect x={i * w + w * 0.2} y={42 - h} width={w * 0.6} height={h} rx={1} fill="var(--brand)" opacity={h ? 1 : 0.15} />
            </g>
          )
        })}
        <line x1="0" y1="42" x2="100" y2="42" stroke="var(--line)" strokeWidth="0.3" />
      </svg>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        {series.filter((_, i) => series.length <= 7 || i % Math.ceil(series.length / 7) === 0).map((s) => (
          <span key={s.day}>{formatDay(s.day, locale).replace(/,.*$/, "")}</span>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{locale === "bn" ? "সর্বোচ্চ দিন" : "Best day"}: <span className="font-bold text-ink">{taka(max, locale)}</span></p>
    </div>
  )
}

/** Status donut: an SVG ring with one arc per status. */
export function StatusDonut({ slices, locale }: { slices: Array<{ label: string; value: number; color: string }>; locale: Locale }) {
  const total = slices.reduce((s, x) => s + x.value, 0)
  const r = 15.9155
  let offset = 25
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 42 42" className="size-36 shrink-0" role="img" aria-label="Status">
        <circle cx="21" cy="21" r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
        {total
          ? slices.map((s) => {
              const pct = (s.value / total) * 100
              const el = <circle key={s.label} cx="21" cy="21" r={r} fill="none" stroke={s.color} strokeWidth="6" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={offset} />
              offset -= pct
              return el
            })
          : null}
        <text x="21" y="22.5" textAnchor="middle" className="fill-ink" style={{ fontSize: 7, fontWeight: 800 }}>{total}</text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="ml-auto font-extrabold text-ink">{s.value}</span>
          </li>
        ))}
        {!total ? <li className="text-xs text-muted-foreground">{locale === "bn" ? "এই সময়ে কোনো বুকিং নেই" : "No bookings in this period"}</li> : null}
      </ul>
    </div>
  )
}
