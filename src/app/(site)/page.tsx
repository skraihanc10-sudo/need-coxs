import Link from "next/link"
import { ArrowRight, BadgeCheck, Clock3, MapPinned, MessageCircle, Phone, Search, ShieldCheck, Star } from "lucide-react"
import { getLocale } from "@/lib/auth"
import { getSettings } from "@/lib/settings"
import { activeCategories, activeFaqs, fromPrice, publishedReviews } from "@/lib/catalog"
import { named, pick, words } from "@/lib/i18n"
import { taka, telHref, whatsappHref } from "@/lib/format"
import { unitLabel } from "@/lib/pricing"
import { CategoryIcon } from "@/components/category-icon"
import { brand } from "@/theme/brand"

export default async function HomePage() {
  const [locale, settings, categories, reviews, faqs] = await Promise.all([getLocale(), getSettings(), activeCategories(), publishedReviews(), activeFaqs()])
  const t = words(locale)
  const bn = locale === "bn"

  return (
    <div className="space-y-10 md:space-y-14">
      {/* Hero + search */}
      <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0b1f3a,#0a3fb0_60%,#1259e8)] px-5 py-9 text-white md:px-10 md:py-14">
        <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-white/10 blur-2xl" />
        <p className="pill bg-white/15 text-white">{t.sadarOnly}</p>
        <h1 className="display mt-4 max-w-2xl text-3xl font-extrabold leading-tight md:text-5xl">
          {pick(locale, "ঘরের যেকোনো কাজ, এক জায়গায়।", "Every home job, in one place.")}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] text-white/80 md:text-lg">{bn ? settings.bannerBn : settings.bannerEn}</p>
        <form action="/services" className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl bg-white p-1.5 shadow-xl">
          <Search className="ml-3 size-5 shrink-0 text-muted-foreground" />
          <input name="q" placeholder={pick(locale, "কী সেবা লাগবে? যেমন: ফ্যান, লন্ড্রি, এসি", "What do you need? e.g. fan, laundry, AC")} className="h-11 min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted-foreground" />
          <button className="btn-primary h-11 px-4 text-sm">{t.search}</button>
        </form>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-white/15 px-3 py-1.5">✓ {pick(locale, "যাচাই করা কর্মী", "Verified workers")}</span>
          <span className="rounded-full bg-white/15 px-3 py-1.5">✓ {pick(locale, "দাম আগেই জানুন", "Price up front")}</span>
          <span className="rounded-full bg-white/15 px-3 py-1.5">✓ {pick(locale, "ক্যাশ / বিকাশ / নগদ", "Cash / bKash / Nagad")}</span>
        </div>
      </section>

      {/* Service grid */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="display text-2xl font-extrabold text-ink md:text-3xl">{pick(locale, "আমাদের সেবা", "Our services")}</h2>
          <Link href="/services" className="text-sm font-bold text-brand">{t.seeAll} →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => {
            const from = fromPrice(c.offerings)
            const cheapest = c.offerings.find((o) => o.price === from)
            return (
              <Link key={c.id} href={`/services/${c.slug}`} className="card group flex flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:ring-brand/40">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                  <CategoryIcon name={c.icon} />
                </span>
                <span className="text-[15px] font-extrabold leading-snug text-ink">{named(locale, c)}</span>
                <span className="mt-auto text-xs text-muted-foreground">
                  {from && cheapest ? `${t.from} ${taka(from, locale)}/${unitLabel(cheapest.pricing, locale)}` : pick(locale, "দেখে দাম", "Quote after visit")}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="card p-5 md:p-8">
        <h2 className="display text-2xl font-extrabold text-ink md:text-3xl">{pick(locale, "কীভাবে কাজ করে", "How it works")}</h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            [pick(locale, "সেবা বেছে নিন", "Pick a service"), pick(locale, "সেবা আর অপশন বাছুন, আনুমানিক দাম সাথে সাথে দেখুন।", "Choose the service and options and see the estimate right away.")],
            [pick(locale, "ঠিকানা আর সময় দিন", "Add address & time"), pick(locale, "সদরের এলাকা, বাড়ির ঠিকানা আর পছন্দের সময় দিন। মোবাইল নম্বর দিলেই হবে।", "Your Sadar area, address and a time slot. A mobile number is all you need.")],
            [pick(locale, "কর্মী আসবেন", "The worker arrives"), pick(locale, "আমাদের যাচাই করা কর্মী সময়মতো আসবেন। কাজ শেষে ক্যাশ, বিকাশ বা নগদে দিন।", "Our verified worker comes on time. Pay cash, bKash or Nagad when it's done.")],
          ].map(([title, body], i) => (
            <li key={title} className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-base font-extrabold text-white">{i + 1}</span>
              <div>
                <p className="font-extrabold text-ink">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link href="/how-it-works" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-brand">
          {pick(locale, "বিস্তারিত দেখুন", "Read more")} <ArrowRight className="size-4" />
        </Link>
      </section>

      {/* Why us */}
      <section>
        <h2 className="display text-2xl font-extrabold text-ink md:text-3xl">{pick(locale, "কেন কক্স সেবা", "Why Cox's Seba")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [ShieldCheck, pick(locale, "যাচাই করা কর্মী", "Verified workers"), pick(locale, "প্রতিটা কর্মীর NID যাচাই করা, আমাদের নিজের টিম।", "Every worker is NID-checked and on our own team.")],
            [BadgeCheck, pick(locale, "নির্দিষ্ট দাম", "Fixed prices"), pick(locale, "দাম আগেই লেখা। লুকানো চার্জ নেই।", "Prices are listed up front. No hidden charges.")],
            [Clock3, pick(locale, "দ্রুত আসি", "We come fast"), pick(locale, "আজকেরটা আজই, বেশিরভাগ কাজ ২ ঘণ্টার স্লটে।", "Same-day for most jobs, in 2-hour slots.")],
            [MapPinned, pick(locale, "সদরের সব এলাকায়", "All of Sadar"), pick(locale, "কলাতলী থেকে খুরুশকুল, সদরের ২৫টা এলাকায়।", "Kolatoli to Khuruskul: all 25 Sadar areas.")],
          ].map(([Icon, title, body]) => {
            const I = Icon as typeof ShieldCheck
            return (
              <div key={title as string} className="card p-5">
                <I className="size-6 text-brand" />
                <p className="mt-3 font-extrabold text-ink">{title as string}</p>
                <p className="mt-1 text-sm text-muted-foreground">{body as string}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Reviews */}
      {reviews.length ? (
        <section>
          <h2 className="display text-2xl font-extrabold text-ink md:text-3xl">{pick(locale, "কাস্টমাররা যা বলেন", "What customers say")}</h2>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
            {reviews.map((r) => (
              <figure key={r.id} className="card w-72 shrink-0 p-5 md:w-auto">
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}
                </div>
                <blockquote className="mt-3 text-[15px] text-ink">“{r.comment}”</blockquote>
                <figcaption className="mt-3 text-xs text-muted-foreground">
                  <span className="font-bold text-ink">{r.customer.name}</span> · {named(locale, r.booking.offering)} · {named(locale, r.booking.area)}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {/* Helpline */}
      <section className="card flex flex-col gap-4 bg-brand-soft p-5 ring-0 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="display text-xl font-extrabold text-ink md:text-2xl">{pick(locale, "কথা বলতে চান?", "Want to talk first?")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{bn ? settings.officeHours : settings.officeHoursEn} · {settings.helpline}</p>
        </div>
        <div className="flex gap-2">
          <a href={telHref(settings.helpline)} className="btn-primary flex-1 md:flex-none"><Phone className="size-4" /> {t.call}</a>
          <a href={whatsappHref(settings.whatsapp, pick(locale, "আসসালামু আলাইকুম, কক্স সেবা থেকে একটা সেবা নিতে চাই।", "Hi, I'd like to book a service with Cox's Seba."))} className="btn-ghost flex-1 bg-paper md:flex-none"><MessageCircle className="size-4" /> {t.whatsapp}</a>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="display text-2xl font-extrabold text-ink md:text-3xl">{pick(locale, "সাধারণ প্রশ্ন", "Common questions")}</h2>
        <div className="mt-4 space-y-2">
          {faqs.map((f) => (
            <details key={f.id} className="card group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-extrabold text-ink">
                {bn ? f.questionBn : f.question}
                <span className="text-brand transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{bn ? f.answerBn : f.answer}</p>
            </details>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{brand.name} · {pick(locale, "কক্সবাজার সদর, বাংলাদেশ", "Cox's Bazar Sadar, Bangladesh")}</p>
      </section>
    </div>
  )
}
