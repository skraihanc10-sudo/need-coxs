import Link from "next/link"
import { Clock, Mail, MapPin, Phone, Shirt, Truck } from "lucide-react"
import { db } from "@/lib/db"
import { getLocale } from "@/lib/auth"
import { getSettings } from "@/lib/settings"
import { HeroSlider, QuoteSlider } from "@/components/site/home-client"
import { Partners } from "@/components/site/chrome"
import { posts, services, steps } from "@/content/public"
import { brand } from "@/theme/brand"

export default async function HomePage() {
  const locale = await getLocale()
  const bn = locale === "bn"
  const settings = await getSettings()
  const reviews = await db.review.findMany({ include: { customer: true, store: true }, take: 4 })
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
          <p className="flex items-center gap-3"><Clock className="text-[var(--pub-green)]" /> Open 8:00–21:00, every day</p>
        </div>
      </section>

      <section className="site-wrap py-16 text-center">
        <p className="text-sm font-bold text-[var(--pub-green)]">● {bn ? "আমাদের সেবা" : "What we book"}</p>
        <h2 className="mt-2 text-5xl">{bn ? "আমাদের সেবা" : "Our services"}</h2>
        <div className="mt-10 grid gap-6 text-left md:grid-cols-4">
          {services.map((service) => (
            <article key={service.slug} className="reveal overflow-hidden bg-[#f6f8f8] shadow-sm">
              <img src={service.image} alt="" className="h-40 w-full object-cover" />
              <div className="p-4">
                <h3 className="text-xl">{bn ? service.titleBn : service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--pub-muted)]">{service.blurb}</p>
                <Link href={`/services/${service.slug}`} className="pub-btn mt-4 w-full">{service.price}</Link>
              </div>
              <Link href={`/services/${service.slug}`} className="flex items-center justify-between bg-[#eceff1] px-4 py-3 text-xs font-bold tracking-wide">
                {service.discount} <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="site-wrap text-center">
          <p className="text-sm font-bold text-[var(--pub-green)]">● {bn ? "ধাপ" : "Simple process"}</p>
          <h2 className="mt-2 text-5xl">{bn ? "যেভাবে কাজ হয়" : "How we work"}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {steps.map((step) => (
              <article key={step.n} className="reveal px-4">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#e9f8ef] text-[var(--pub-green)]">
                  {step.n === "04" ? <Truck /> : step.n === "03" ? <Shirt /> : <Phone />}
                </div>
                <h3 className="mt-4 text-2xl">{step.title}</h3>
                <p className="mt-2 text-sm text-[var(--pub-muted)]">{step.text}</p>
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

      <section className="site-wrap grid items-center gap-10 py-16 md:grid-cols-2">
        <div className="relative">
          <img src="/marketing/svc-rail.jpg" alt="Pressed clothes on a rail" className="h-[420px] w-full object-cover" />
          <div className="absolute bottom-6 left-6 grid size-28 place-items-center bg-[var(--pub-green)] text-center text-white">
            <span className="text-4xl leading-none">8+</span>
            <span className="text-sm">Years</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--pub-green)]">Since 2016</p>
          <h2 className="mt-2 text-4xl md:text-5xl">On-time delivery and a shop you can name.</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--pub-muted)]">
            {brand.name} does not wash the clothes itself. Neighbourhood laundries do. We book the pickup, show the price, and send a rider.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Gate pickup", "The rider meets the guard, not a queue."],
              ["Piece or kilo", "Formal clothes stay on their own line."],
              ["Cash on return", "Pay when the bag comes home."],
              ["Bangla or English", "The customer app switches language."],
            ].map(([title, text]) => (
              <div key={title}>
                <h3 className="text-lg normal-case">{title}</h3>
                <p className="text-sm text-[var(--pub-muted)]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Partners />

      <section className="overflow-hidden text-white" style={{ background: "var(--pub-navy)" }}>
        <div className="site-wrap grid items-center gap-8 py-14 md:grid-cols-2">
          <div>
            <h2 className="text-5xl">Home delivery, the neighbourhood laundry.</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/70">Compare shops in Gulshan, Dhanmondi, Banani, Mirpur, and Mohammadpur. The rider brings the bag back.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/app" className="pub-btn">Book now →</Link>
              <Link href="/contact" className="pub-btn ghost">Request a quote</Link>
            </div>
          </div>
          <img src="/marketing/rider-box.jpg" alt="Need Cox's rider with a parcel" className="mx-auto h-[380px] w-full max-w-sm object-cover object-top" />
        </div>
      </section>

      <section className="site-wrap py-16">
        <p className="text-center text-sm font-bold text-[var(--pub-green)]">● What clients say</p>
        <h2 className="mt-2 text-center text-5xl">Our testimonials</h2>
        <div className="mt-8">
          <QuoteSlider quotes={quotes} />
        </div>
      </section>

      <section className="site-wrap pb-16">
        <p className="text-center text-sm font-bold text-[var(--pub-green)]">● Our blog</p>
        <h2 className="mt-2 text-center text-5xl">News and articles</h2>
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
