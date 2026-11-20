import Link from "next/link"
import { PageBanner } from "@/components/site/chrome"
import { db } from "@/lib/db"
import { getLocale } from "@/lib/auth"
import { taka } from "@/lib/format"

export default async function PricingPage() {
  const locale = await getLocale()
  const prices = await db.price.findMany({
    where: { active: true, store: { status: "APPROVED" } },
    include: { item: true, kind: true, store: true },
    orderBy: [{ item: { sort: "asc" } }, { amount: "asc" }],
  })
  const groups = new Map<string, typeof prices>()
  for (const price of prices) {
    const key = price.item.audience
    groups.set(key, [...(groups.get(key) ?? []), price])
  }
  const titles: Record<string, string> = { MEN: "Men", WOMEN: "Women", KIDS: "Kids", OTHER: "Household", BULK: "By the kilo" }
  return (
    <div>
      <PageBanner title="Pricing" crumb="Pricing" />
      <div className="site-wrap py-14">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          These are live menu rows from approved shops. The same cloth can cost more in Gulshan than in Mirpur. Booking always uses the price of the shop you pick.
        </p>
        {[...groups.entries()].map(([audience, rows]) => (
          <section key={audience} className="mt-10">
            <h2 className="text-2xl font-extrabold">{titles[audience] ?? audience}</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2">Cloth</th>
                    <th>Service</th>
                    <th>From</th>
                    <th>Shop</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 8).map((row) => (
                    <tr key={row.id} className="border-b">
                      <td className="py-3 font-semibold">{locale === "bn" ? row.item.nameBn : row.item.name}</td>
                      <td>{locale === "bn" ? row.kind.nameBn : row.kind.name}</td>
                      <td className="price">{taka(row.amount, locale)}</td>
                      <td><Link href={`/stores/${row.store.slug}`} className="font-bold text-[var(--brand)]">{row.store.name}</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
        <Link href="/app" className="mt-8 inline-flex h-12 items-center rounded-full bg-primary px-6 font-extrabold text-primary-foreground">Book at these rates</Link>
      </div>
    </div>
  )
}
