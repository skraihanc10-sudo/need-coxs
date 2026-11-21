import Link from "next/link"
import { Search } from "lucide-react"
import { getLocale } from "@/lib/auth"
import { activeCategories } from "@/lib/catalog"
import { named, pick, words } from "@/lib/i18n"
import { taka } from "@/lib/format"
import { unitLabel } from "@/lib/pricing"
import { CategoryIcon } from "@/components/category-icon"
import { PageHeader, EmptyState } from "@/components/bits"

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [{ q = "" }, locale, categories] = await Promise.all([searchParams, getLocale(), activeCategories()])
  const t = words(locale)
  const needle = q.trim().toLowerCase()
  const hit = (s: string) => s.toLowerCase().includes(needle)
  const list = needle
    ? categories
        .map((c) => ({
          ...c,
          offerings: hit(c.name) || hit(c.nameBn) ? c.offerings : c.offerings.filter((o) => hit(o.name) || hit(o.nameBn) || hit(o.detail) || hit(o.detailBn)),
        }))
        .filter((c) => c.offerings.length)
    : categories

  return (
    <div>
      <PageHeader title={pick(locale, "সব সেবা", "All services")} sub={pick(locale, "কক্সবাজার সদরের যেকোনো এলাকায়, আমাদের নিজের টিম।", "Anywhere in Cox's Bazar Sadar, by our own team.")} />
      <form className="mb-5 flex items-center gap-2 rounded-2xl bg-paper p-1.5 ring-1 ring-line">
        <Search className="ml-3 size-5 shrink-0 text-muted-foreground" />
        <input name="q" defaultValue={q} placeholder={pick(locale, "কী সেবা লাগবে?", "What do you need?")} className="h-11 min-w-0 flex-1 bg-transparent outline-none" />
        <button className="btn-soft h-11 px-4 text-sm">{t.search}</button>
      </form>
      {!list.length ? (
        <EmptyState
          title={pick(locale, "কিছু পাওয়া যায়নি", "Nothing matched")}
          body={pick(locale, "তালিকায় নেই এমন কাজ? “অন্যান্য” সেবায় নিজের ভাষায় লিখুন, আমরা কল দিয়ে দাম জানাব।", "Not on the list? Use “Something else” and describe it; we'll call with a price.")}
          href="/services/other"
          action={pick(locale, "আপনার কাজটা লিখুন", "Describe your job")}
        />
      ) : (
        <div className="space-y-4">
          {list.map((c) => (
            <section key={c.id} className="card p-4 md:p-5">
              <Link href={`/services/${c.slug}`} className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><CategoryIcon name={c.icon} /></span>
                <div className="min-w-0 flex-1">
                  <h2 className="display text-lg font-extrabold text-ink">{named(locale, c)}</h2>
                  <p className="truncate text-sm text-muted-foreground">{locale === "bn" ? c.blurbBn : c.blurb}</p>
                </div>
              </Link>
              <ul className="mt-3 divide-y divide-line">
                {c.offerings.map((o) => (
                  <li key={o.id}>
                    <Link href={`/book/${c.slug}/${o.slug}`} className="flex items-center justify-between gap-3 py-3 hover:text-brand">
                      <div className="min-w-0">
                        <p className="font-bold">{named(locale, o)}</p>
                        <p className="truncate text-xs text-muted-foreground">{locale === "bn" ? o.detailBn : o.detail}</p>
                      </div>
                      <span className="shrink-0 text-right text-sm font-extrabold text-ink">
                        {o.pricing === "QUOTE" ? (
                          <span className="text-brand">{pick(locale, "দেখে দাম", "Quote")}</span>
                        ) : (
                          <>
                            {taka(o.price, locale)}<span className="text-xs font-semibold text-muted-foreground">/{unitLabel(o.pricing, locale)}</span>
                          </>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
