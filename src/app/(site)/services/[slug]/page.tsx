import Link from "next/link"
import { notFound } from "next/navigation"
import { Clock3 } from "lucide-react"
import { getLocale } from "@/lib/auth"
import { categoryBySlug } from "@/lib/catalog"
import { named, pick, words } from "@/lib/i18n"
import { taka } from "@/lib/format"
import { PRICING_TEXT, unitLabel } from "@/lib/pricing"
import { CategoryIcon } from "@/components/category-icon"
import { PageHeader } from "@/components/bits"

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, locale] = await Promise.all([params, getLocale()])
  const category = await categoryBySlug(slug)
  if (!category) notFound()
  const t = words(locale)
  const bn = locale === "bn"
  const minutes = (m: number) => (m >= 1440 ? pick(locale, `${Math.round(m / 1440)} দিন`, `${Math.round(m / 1440)} day${m >= 2880 ? "s" : ""}`) : m >= 60 ? pick(locale, `~${Math.round(m / 60)} ঘণ্টা`, `~${Math.round(m / 60)} hr`) : pick(locale, `${m} মিনিট`, `${m} min`))

  return (
    <div>
      <PageHeader back="/services" title={named(locale, category)} sub={bn ? category.blurbBn : category.blurb} action={<span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand"><CategoryIcon name={category.icon} /></span>} />
      {category.flow === "LAUNDRY" ? (
        <p className="mb-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900">{pick(locale, "আমাদের রাইডার কাপড় নিয়ে যাবে, আমাদের লন্ড্রিতে পরিষ্কার হবে, রাইডারই ফেরত দেবে।", "Our rider collects, our laundry cleans, and the rider brings it back.")}</p>
      ) : null}
      {category.flow === "TEAM" ? (
        <p className="mb-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900">{pick(locale, "রুম সংখ্যা, টিমে কতজন আর কত দিন লাগবে বলুন। পুরো টিম পাঠানো হবে।", "Tell us the room count, team size and days. A full crew comes.")}</p>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {category.offerings.map((o) => (
          <Link key={o.id} href={`/book/${category.slug}/${o.slug}`} className="card flex flex-col gap-2 p-4 transition hover:ring-brand/40 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-extrabold text-ink">{named(locale, o)}</h2>
              <span className="shrink-0 text-right">
                {o.pricing === "QUOTE" ? (
                  <span className="pill bg-brand-soft text-brand">{PRICING_TEXT.QUOTE[locale]}</span>
                ) : (
                  <span className="text-lg font-extrabold text-ink">{taka(o.price, locale)}<span className="text-xs font-semibold text-muted-foreground">/{unitLabel(o.pricing, locale)}</span></span>
                )}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{bn ? o.detailBn : o.detail}</p>
            <div className="mt-auto flex items-center justify-between pt-2 text-xs font-bold text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" /> {minutes(o.durationMin)}</span>
              {o.pricing === "QUOTE" && o.price > 0 ? <span>{pick(locale, `পরিদর্শন ফি ${taka(o.price, locale)}`, `Inspection ${taka(o.price, locale)}`)}</span> : null}
              <span className="text-brand">{t.bookNow} →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
