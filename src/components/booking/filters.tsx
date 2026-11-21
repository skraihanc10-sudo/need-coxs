import Link from "next/link"
import { statusText } from "@/lib/booking-flow"
import type { Locale } from "@/lib/format"
import { named, pick } from "@/lib/i18n"
import { STATUS_FILTERS } from "@/lib/office"

export function BookingFilters({
  locale,
  values,
  categories,
  areas,
  base,
}: {
  locale: Locale
  values: Record<string, string>
  categories: Array<{ id: string; name: string; nameBn: string }>
  areas: Array<{ id: string; name: string; nameBn: string }>
  base: string
}) {
  return (
    <form className="card mb-4 grid gap-2 p-3 md:grid-cols-[1fr_160px_160px_140px_140px_auto]">
      <input name="q" defaultValue={values.q ?? ""} className="field h-10" placeholder={pick(locale, "কোড, নাম, ফোন, ঠিকানা", "Code, name, phone, address")} />
      <select name="status" defaultValue={values.status ?? ""} className="field h-10">
        {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s ? statusText(s, locale) : pick(locale, "সব অবস্থা", "Any status")}</option>)}
      </select>
      <select name="category" defaultValue={values.category ?? ""} className="field h-10">
        <option value="">{pick(locale, "সব সেবা", "Any service")}</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{named(locale, c)}</option>)}
      </select>
      <select name="area" defaultValue={values.area ?? ""} className="field h-10">
        <option value="">{pick(locale, "সব এলাকা", "Any area")}</option>
        {areas.map((a) => <option key={a.id} value={a.id}>{named(locale, a)}</option>)}
      </select>
      <input name="from" type="date" defaultValue={values.from ?? ""} className="field h-10" aria-label="From" />
      <div className="flex gap-2">
        <button className="btn-primary h-10 px-4 text-sm">{pick(locale, "ফিল্টার", "Filter")}</button>
        <Link href={base} className="btn-ghost h-10 px-3 text-sm">✕</Link>
      </div>
    </form>
  )
}
