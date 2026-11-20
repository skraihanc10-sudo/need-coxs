import Link from "next/link"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/bits"
import { copy } from "@/lib/i18n"
import { getLocale } from "@/lib/auth"
import { taka } from "@/lib/format"
import { StoreLogo } from "@/components/laundry-icons"

export default async function StoresPage() {
  const locale = await getLocale()
  const t = copy(locale)
  const stores = await db.store.findMany({
    where: { status: "APPROVED" },
    include: { prices: { where: { active: true }, select: { amount: true } } },
    orderBy: { rating: "desc" },
  })
  return (
    <div>
      <PageHeader title={t.nearYou} back="/" />
      <div className="space-y-3 px-4 pb-6">
        {stores.map((store) => {
          const from = store.prices.length ? Math.min(...store.prices.map((price) => price.amount)) : 0
          return (
            <Link key={store.id} href={`/stores/${store.slug}`} className="surface-card block overflow-hidden">
              <div className="relative h-28">
                {store.cover ? <img src={store.cover} alt="" className="h-full w-full object-cover" /> : null}
                <span className="absolute -bottom-4 left-3"><StoreLogo mark={store.logo || "both"} /></span>
              </div>
              <div className="p-4 pt-6">
              <p className="font-extrabold">{store.name}</p>
              <p className="text-sm text-muted-foreground">{store.area} · ★ {store.rating.toFixed(1)}</p>
              <p className="text-sm">{t.from} {taka(from, locale)}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
