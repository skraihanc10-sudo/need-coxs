import Link from "next/link"
import { Clock, Mail, MapPin, Phone, Smartphone } from "lucide-react"
import { db } from "@/lib/db"
import { getLocale } from "@/lib/auth"
import { getSettings } from "@/lib/settings"
import { HeroSlider, QuoteSlider } from "@/components/site/home-client"
import { Partners } from "@/components/site/chrome"
import { posts } from "@/content/public"
import { brand } from "@/theme/brand"
import { CategoryIcon } from "@/components/category-icon"

const steps = [
  ["01", "Pick", "বাছুন", "Choose the job, from laundry to a resort team."],
  ["02", "Book", "বুক", "Area, time, notes, and cash, bKash, or Nagad."],
  ["03", "Visit", "ভিজিট", "A provider accepts, quotes, and sends a field worker."],
  ["04", "Rate", "রেট", "Track the visit and leave a review."],
]

export default async function HomePage() {
  const locale = await getLocale()
  const bn = locale === "bn"
  const settings = await getSettings()
  const [categories, areas, providers, reviews] = await Promise.all([
    db.serviceCategory.findMany({ where: { active: true }, orderBy: { sort: "asc" } }),
    db.serviceArea.findMany({ where: { active: true }, orderBy: { sort: "asc" } }),
    db.store.findMany({
      where: { status: "APPROVED", listing: "SERVICE" },
      orderBy: { rating: "desc" },
      take: 4,
      include: { providerCategories: { include: { category: true } } },
    }),
    db.review.findMany({ include: { customer: true, store: true }, take: 4 }),
  ])
  const quotes = reviews.length
    ? reviews.map((review) => ({
        name: review.customer.name,
        text: review.comment,
        meta: `${review.store.name} · ${review.rating} star review`,
      }))
    : [{ name: "Nusrat Rahman", text: "The rider called from the gate and the collars came back sharp.", meta: "Chandni Wash House" }]

  return (
    <div>
      <HeroSlider bn={bn} />
      <section className="border-b bg-white">
        <div className="site-wrap grid gap-4 py-5 text-sm md:grid-cols-3">
          <p className="flex items-center gap-3"><MapPin className="text-[var(--pub-green)]" /> {brand.address}</p>
          <p className="flex items-center gap-3"><Mail className="text-[var(--pub-green)]" /> {settings.supportEmail}</p>
          <p className="flex items-center gap-3"><Clock className="text-[var(--pub-green)]" /> {bn ? "প্রতিদিন সকাল ৮টা–রাত ৯টা" : "Open 8:00–21:00, every day"}</p>
        </div>
      </section>

      <section className="site-wrap py-16">
        <p className="text-center text-sm font-bold text-[var(--pub-green)]">● {bn ? "সেবা" : "Services"}</p>
        <h2 className="mt-2 text-center text-5xl">{bn ? "কক্সবাজারের কাজ" : "Jobs in Cox's Bazar"}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/hub/c/${category.slug}`} className="reveal overflow-hidden bg-[#f6f8f8] shadow-sm">
              <img src={category.cover || "/services/labour.svg"} alt="" className="h-36 w-full object-cover" />
              <div className="flex items-start gap-3 p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[var(--pub-green)]">
                  <CategoryIcon name={category.icon} className="size-5" />
                </span>
                <span>
                  <span className="block text-lg font-bold">{bn ? category.nameBn : category.name}</span>
                  <span className="mt-1 block text-sm text-[var(--pub-muted)]">{bn ? category.blurbBn : category.blurb}</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="site-wrap text-center">
          <p className="text-sm font-bold text-[var(--pub-green)]">● {bn ? "ধাপ" : "How it works"}</p>
          <h2 className="mt-2 text-5xl">{bn ? "যেভাবে হয়" : "How it works"}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {steps.map(([n, title, titleBn, text]) => (
              <article key={n} className="reveal px-4">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#e9f8ef] text-lg font-extrabold text-[var(--pub-green)]">{n}</div>
                <h3 className="mt-4 text-2xl">{bn ? titleBn : title}</h3>
                <p className="mt-2 text-sm text-[var(--pub-muted)]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--pub-yellow)]">
        <div className="site-wrap grid gap-4 py-5 text-sm font-semibold md:grid-cols-3">
          <p className="flex items-center gap-2"><Phone className="size-4" /> {settings.supportPhone}</p>
          <p className="flex items-center gap-2"><Mail className="size-4" /> {settings.supportEmail}</p>
          <p className="flex items-center gap-2"><MapPin className="size-4" /> {brand.city}, Bangladesh</p>
        </div>
      </section>

      <section className="site-wrap py-16">
        <p className="text-sm font-bold text-[var(--pub-green)]">● {bn ? "প্রোভাইডার" : "Providers"}</p>
        <h2 className="mt-2 text-4xl md:text-5xl">{bn ? "কাজের মানুষ" : "People who take the job"}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {providers.map((store) => (
            <article key={store.id} className="rounded-3xl border bg-white p-4">
              <p className="text-lg font-extrabold">{store.name}</p>
              <p className="text-sm text-[var(--pub-muted)]">{store.area} · {store.providerType === "COMPANY" ? (bn ? `দল ${store.teamSize}` : `Team of ${store.teamSize}`) : bn ? "একজন" : "Individual"}</p>
              <p className="mt-2 text-xs font-bold text-[var(--pub-green)]">{store.providerCategories.map((row) => (bn ? row.category.nameBn : row.category.name)).join(" · ")}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="site-wrap">
          <p className="text-sm font-bold text-[var(--pub-green)]">● {bn ? "এলাকা" : "Areas"}</p>
          <h2 className="mt-2 text-4xl">{bn ? "কক্সবাজারের এলাকা" : "Across Cox's Bazar"}</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {areas.map((area) => (
              <Link key={area.id} href="/hub" className="rounded-full bg-[#f4f7f8] px-4 py-2 text-sm font-bold">{bn ? area.nameBn : area.name}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="site-wrap grid items-center gap-8 py-8 md:grid-cols-2">
        <div className="rounded-[28px] p-8 text-white" style={{ background: "var(--pub-navy)" }}>
          <Smartphone className="size-8 text-[var(--pub-yellow)]" />
          <h2 className="mt-4 text-4xl">{bn ? "ফোনে অ্যাপের মতো" : "The app, on your phone"}</h2>
          <p className="mt-3 text-sm leading-7 text-white/70">{bn ? "গ্রাহকের ডেস্ক ফোনের সাইজে খোলে। লন্ড্রি আগের মতোই আছে।" : "The customer desk opens in a phone frame. Laundry still books the way it did."}</p>
          <Link href="/hub" className="pub-btn mt-6">{bn ? "অ্যাপ খুলুন" : "Open the app"}</Link>
        </div>
        <div className="rounded-[28px] bg-[var(--pub-yellow)] p-8">
          <h2 className="text-4xl">{bn ? "প্রোভাইডার হোন" : "Become a provider"}</h2>
          <p className="mt-3 text-sm leading-7">{bn ? "একজন বা একটি দল। এলাকা বাছুন, এনআইডি দিন, অ্যাডমিন অনুমোদন করবে।" : "One person or a team. Pick your areas, send your NID, and wait for approval."}</p>
          <Link href="/partner" className="pub-btn mt-6">{bn ? "যোগ দিন" : "List your service"}</Link>
        </div>
      </section>

      <Partners />

      <section className="site-wrap py-16">
        <p className="text-center text-sm font-bold text-[var(--pub-green)]">● {bn ? "মতামত" : "What clients say"}</p>
        <h2 className="mt-2 text-center text-5xl">{bn ? "গ্রাহকের কথা" : "Our testimonials"}</h2>
        <div className="mt-8">
          <QuoteSlider quotes={quotes} />
        </div>
      </section>

      <section className="site-wrap pb-16">
        <p className="text-center text-sm font-bold text-[var(--pub-green)]">● {bn ? "খবর" : "Our blog"}</p>
        <h2 className="mt-2 text-center text-5xl">{bn ? "খবর ও লেখা" : "News and articles"}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="reveal bg-white shadow-sm">
              <img src={post.image} alt="" className="h-48 w-full object-cover" />
              <div className="p-4">
                <p className="text-xs font-bold text-[var(--pub-green)]">{post.date}</p>
                <h3 className="mt-2 text-2xl normal-case"><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
                <p className="mt-2 text-sm text-[var(--pub-muted)]">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
