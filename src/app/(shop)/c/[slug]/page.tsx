import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/bits"
import { getLocale } from "@/lib/auth"
import { taka } from "@/lib/format"

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const kind = await db.kind.findUnique({ where: { slug } })
  if (!kind) notFound()
  const stores = await db.store.findMany({
    where: { status: "APPROVED", prices: { some: { kindId: kind.id, active: true } } },
    include: { prices: { where: { kindId: kind.id, active: true }, select: { amount: true } } },
  })
  return (
    <div>
      <PageHeader title={locale === "bn" ? kind.nameBn : kind.name} back="/" />
      <div className="space-y-3 px-4 pb-8">
        {stores.map((store) => (
          <Link key={store.id} href={`/stores/${store.slug}?kind=${kind.slug}`} className="surface-card block p-4">
            <p className="font-extrabold">{store.name}</p>
            <p className="text-sm text-muted-foreground">{store.area}</p>
            <p className="price text-sm">{taka(Math.min(...store.prices.map((price) => price.amount)), locale)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
