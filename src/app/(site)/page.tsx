import Link from "next/link"
import { db } from "@/lib/db"
import { getLocale } from "@/lib/auth"
import { LaundryScene } from "@/components/site/scene"
import { brand } from "@/theme/brand"
import { taka } from "@/lib/format"

const features = [
  ["Pickup at the gate", "A rider collects the bag from your building. No shop queue."],
  ["Price before you book", "Wash, iron, or dry-clean is priced per cloth, in taka."],
  ["Back in two days", "Choose the return slot. Most shops finish inside 48 hours."],
  ["Cash on delivery", "Pay the rider when the clothes come home. Online gateways can be added later."],
]

const services = [
  ["Wash & fold", "Everyday wear, washed, dried, and folded by the kilo.", "/c/wash"],
  ["Wash & iron", "Office shirts and panjabis returned on a hanger.", "/c/both"],
  ["Dry clean", "Sarees, suits, and anything that should not see a machine.", "/c/dry"],
  ["Iron only", "You washed it. The laundry presses it.", "/c/iron"],
  ["Household", "Sheets, towels, and curtains under Other in the shop.", "/app"],
  ["Neighbourhood shops", "Compare Gulshan, Dhanmondi, Banani, Mirpur, and more.", "/stores"],
]

const steps = [
  ["01", "Pick a laundry", "Browse shops near you and open the cloth list."],
  ["02", "Choose the service", "Each item has its own wash, iron, or dry-clean price."],
  ["03", "Set both slots", "Pickup and delivery are separate dates and times."],
  ["04", "We bring them back", "The rider collects, the shop cleans, the same rider returns them."],
]

export default async function MarketingHome() {
  const locale = await getLocale()
  const [stores, orders, reviews, faqs, kinds] = await Promise.all([
    db.store.count({ where: { status: "APPROVED" } }),
    db.order.count(),
    db.review.findMany({ include: { customer: true, store: true }, orderBy: { createdAt: "desc" }, take: 3 }),
    db.faq.findMany({ where: { storeId: null }, orderBy: { sort: "asc" }, take: 4 }),
    db.kind.findMany({ orderBy: { sort: "asc" } }),
  ])
  const priceRows = await db.price.findMany({
    where: { active: true, store: { status: "APPROVED" } },
    include: { kind: true, item: true },
  })
  const fromKind = (slug: string) => {
    const rows = priceRows.filter((row) => row.kind.slug === slug)
    if (!rows.length) return null
    return Math.min(...rows.map((row) => row.amount))
  }

  return (
    <div>
      <section className="site-hero">
        <div className="site-wrap grid items-center gap-10 py-16 md:grid-cols-2 md:py-20">
          <div>
            <p className="site-kicker">Doorstep laundry · {brand.city}</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              {locale === "bn" ? "কাপড় ফিরে আসে ভাঁজ করা, সময়মতো।" : "Clothes come back folded, and on time."}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/80">
              {brand.name} is the booking desk for neighbourhood wash houses. Compare a shop, price each cloth, and pay the rider in cash.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app" className="inline-flex h-12 items-center rounded-full bg-[var(--accent)] px-6 font-extrabold text-[#06283a]">Book a pickup</Link>
              <Link href="/services" className="inline-flex h-12 items-center rounded-full border border-white/40 px-6 font-extrabold">Our services</Link>
            </div>
          </div>
          <LaundryScene />
        </div>
      </section>

      <section className="site-wrap relative z-10 -mt-10 grid gap-4 md:grid-cols-4">
        {features.map(([title, body]) => (
          <article key={title} className="surface-card p-5">
            <span className="icon-chip text-sm font-extrabold">{title.slice(0, 1)}</span>
            <h2 className="mt-3 font-extrabold">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
          </article>
        ))}
      </section>

      <section className="site-wrap grid items-center gap-10 py-20 md:grid-cols-2">
        <div className="rounded-[28px] bg-[var(--brand-soft)] p-8">
          <p className="text-6xl font-extrabold text-[var(--brand)]">{stores}</p>
          <p className="font-bold">approved laundries on the desk</p>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            We are not one giant plant. Each order goes to a shop you can name, with its own prices, slots, and rider.
          </p>
        </div>
        <div>
          <p className="site-kicker">About the desk</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">A booking desk for Dhaka laundries, not a single shop.</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {["See the rate before the bag is collected.", "Separate pickup and delivery times.", "Track every status from placed to completed.", "Switch the customer app into Bangla."].map((item) => (
              <li key={item} className="flex gap-2"><span className="font-extrabold text-[var(--accent-ink)]">✓</span>{item}</li>
            ))}
          </ul>
          <Link href="/about" className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-6 font-extrabold text-primary-foreground">About {brand.name}</Link>
        </div>
      </section>

      <section className="bg-[var(--brand-softer)] py-16">
        <div className="site-wrap">
          <p className="site-kicker">What we book</p>
          <h2 className="mt-2 text-3xl font-extrabold">Services the shops actually run</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {services.map(([title, body, href]) => (
              <Link key={title} href={href} className="surface-card block p-5 transition hover:-translate-y-0.5">
                <h3 className="text-lg font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                <p className="mt-3 text-sm font-bold text-[var(--brand)]">Open the list</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="site-wrap py-16">
        <p className="site-kicker">Pricing, from real menus</p>
        <h2 className="mt-2 text-3xl font-extrabold">Starting rates across approved shops</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {kinds.map((kind) => {
            const amount = fromKind(kind.slug)
            return (
              <article key={kind.id} className="rounded-[24px] border p-5">
                <p className="text-sm font-bold text-[var(--accent-ink)]">{locale === "bn" ? kind.nameBn : kind.name}</p>
                <p className="mt-3 text-3xl font-extrabold">{amount == null ? "—" : taka(amount, locale)}</p>
                <p className="text-sm text-muted-foreground">lowest live price</p>
                <Link href={`/c/${kind.slug}`} className="mt-4 inline-block text-sm font-bold text-[var(--brand)]">See shops</Link>
              </article>
            )
          })}
        </div>
        <Link href="/pricing" className="mt-6 inline-flex h-12 items-center rounded-full border px-6 font-extrabold">Full pricing</Link>
      </section>

      <section className="bg-[var(--brand-ink)] py-16 text-white">
        <div className="site-wrap">
          <p className="site-kicker">How a bag moves</p>
          <h2 className="mt-2 text-3xl font-extrabold">Four steps, then the clothes are home</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {steps.map(([n, title, body]) => (
              <li key={n} className="rounded-3xl bg-white/5 p-5">
                <p className="text-3xl font-extrabold text-[var(--accent)]">{n}</p>
                <h3 className="mt-2 font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="site-wrap grid gap-6 py-10 text-center sm:grid-cols-3">
        {[[String(stores), "Laundries"], [String(orders), "Orders on the desk"], ["5", "Neighbourhoods"]].map(([n, label]) => (
          <div key={label}>
            <p className="text-4xl font-extrabold text-[var(--brand)]">{n}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>

      <section className="site-wrap pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="site-kicker">Stories</p>
            <h2 className="mt-2 text-3xl font-extrabold">What customers wrote after delivery</h2>
          </div>
          <Link href="/testimonials" className="text-sm font-bold text-[var(--brand)]">All stories</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {(reviews.length ? reviews.map((review) => ({
            name: review.customer.name,
            quote: review.comment,
            meta: `${review.store.name} · ${"★".repeat(review.rating)}`,
          })) : [{
            name: "Nusrat Rahman",
            quote: "Collars came back sharp and the rider called from the gate.",
            meta: "Chandni Wash House · ★★★★★",
          }]).map((story) => (
            <blockquote key={story.quote} className="surface-card p-5">
              <p className="text-sm leading-6">“{story.quote}”</p>
              <footer className="mt-4 text-sm font-bold">{story.name}</footer>
              <p className="text-xs text-muted-foreground">{story.meta}</p>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="bg-[var(--brand-softer)] py-16">
        <div className="site-wrap grid gap-8 md:grid-cols-2">
          <div>
            <p className="site-kicker">Questions</p>
            <h2 className="mt-2 text-3xl font-extrabold">Before you hand over the bag</h2>
            <Link href="/faq" className="mt-4 inline-block font-bold text-[var(--brand)]">Read every answer</Link>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.id} className="rounded-2xl bg-white px-4 py-3">
                <summary className="cursor-pointer font-bold">{faq.question}</summary>
                <p className="pt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="site-wrap py-16">
        <div className="rounded-[32px] bg-primary px-8 py-10 text-primary-foreground md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold">Need a rider at the gate?</h2>
            <p className="mt-2 text-white/80">Book in the app, or call the desk and we will point you at a shop.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 md:mt-0">
            <Link href="/app" className="inline-flex h-12 items-center rounded-full bg-[var(--accent)] px-6 font-extrabold text-[#06283a]">Book a pickup</Link>
            <Link href="/contact" className="inline-flex h-12 items-center rounded-full border border-white/40 px-6 font-extrabold">Contact</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
