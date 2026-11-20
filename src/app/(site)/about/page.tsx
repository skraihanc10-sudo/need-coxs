import Link from "next/link"
import { PageBanner } from "@/components/site/chrome"
import { brand } from "@/theme/brand"
import { db } from "@/lib/db"

export default async function AboutPage() {
  const stores = await db.store.count({ where: { status: "APPROVED" } })
  return (
    <div>
      <PageBanner title={`About ${brand.name}`} crumb="About" />
      <article className="site-wrap grid gap-10 py-14 md:grid-cols-2">
        <div className="space-y-4 text-sm leading-7">
          <p className="site-kicker">The desk</p>
          <h2 className="text-3xl font-extrabold">We send the order to a shop you can name.</h2>
          <p>
            {brand.name} started as a booking desk for wash houses that already had a gate, a press, and a rider, but no shared way for a household to compare them. The clothes never come to us. They go to the laundry you picked.
          </p>
          <p>
            Customers in {brand.city} book in English or Bangla, pay cash when the bag returns, and follow a status line from placed to completed. Shops keep their own prices. Riders see only the jobs assigned to them.
          </p>
          <p>There are {stores} approved laundries on the desk today, plus one waiting for a yes from the admin.</p>
        </div>
        <div className="grid gap-3">
          {[
            ["Customers", "Browse, bag clothes, pick two slots, track the order, and message the desk."],
            ["Laundries", "Set cloth prices, accept work, assign a rider, and request a payout."],
            ["Riders", "See the address, call, open the map, and mark picked up or delivered."],
          ].map(([title, body]) => (
            <article key={title} className="surface-card p-5">
              <h3 className="font-extrabold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </article>
      <div className="site-wrap pb-16">
        <Link href="/partner" className="inline-flex h-12 items-center rounded-full bg-primary px-6 font-extrabold text-primary-foreground">List a laundry</Link>
      </div>
    </div>
  )
}
