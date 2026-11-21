import Link from "next/link"
import { PageBanner, Partners } from "@/components/site/chrome"
import { brand } from "@/theme/brand"

export default function AboutPage() {
  return (
    <div>
      <PageBanner title="About" crumbs={["About"]} />
      <section className="site-wrap grid items-center gap-10 py-16 md:grid-cols-2">
        <div className="relative">
          <img src="/marketing/svc-wash.jpg" alt="A washing machine in a Cox's Seba partner laundry" className="h-[460px] w-full object-cover" />
          <div className="absolute bottom-6 left-6 grid size-28 place-items-center bg-[var(--pub-green)] text-center text-white">
            <span className="text-4xl leading-none">8+</span>
            <span className="text-sm">Years</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--pub-green)]">Since 2016</p>
          <h2 className="mt-2 text-4xl md:text-5xl">To provide on-time delivery and a named laundry.</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--pub-muted)]">
            {brand.name} books the rider and the slot. The wash house you choose does the work, at the price on its menu. That is the whole product.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Household service", "Kilo bags for everyday cotton."],
              ["Formal care", "Sarees and suits stay on piece rates."],
              ["Cash or wallet", "Pay the rider, or spend wallet credit."],
              ["A desk you can call", brand.supportPhone],
            ].map(([title, text]) => (
              <div key={title}>
                <h3 className="text-lg normal-case">{title}</h3>
                <p className="text-sm text-[var(--pub-muted)]">{text}</p>
              </div>
            ))}
          </div>
          <Link href="/app" className="pub-btn mt-6">Book now</Link>
        </div>
      </section>
      <Partners />
    </div>
  )
}
