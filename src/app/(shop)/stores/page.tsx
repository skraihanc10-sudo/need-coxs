import Link from "next/link"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/bits"
import { copy } from "@/lib/i18n"
import { getLocale } from "@/lib/auth"
import { taka } from "@/lib/format"

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
            <Link key={store.id} href={`/stores/${store.slug}`} className="surface-card block p-4">
              <p className="font-extrabold">{store.name}</p>
              <p className="text-sm text-muted-foreground">{store.area} · ★ {store.rating.toFixed(1)}</p>
              <p className="text-sm">{t.from} {taka(from, locale)}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
