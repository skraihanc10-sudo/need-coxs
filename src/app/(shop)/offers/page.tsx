import { db } from "@/lib/db"
import { getLocale } from "@/lib/auth"
import { copy } from "@/lib/i18n"
import { PageHeader, EmptyState } from "@/components/bits"
import { CopyCode } from "@/components/interactive"
import { taka } from "@/lib/format"

export default async function OffersPage() {
  const locale = await getLocale()
  const t = copy(locale)
  const coupons = await db.coupon.findMany({
    where: { active: true },
    include: { store: true },
    orderBy: { code: "asc" },
  })
  return (
    <div>
      <PageHeader title={t.offers} />
      {!coupons.length ? <EmptyState title={t.noOffers} body={t.findSub} /> : null}
      <div className="space-y-3 px-4 pb-6">
        {coupons.map((coupon) => (
          <article key={coupon.id} className="surface-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-extrabold">{coupon.title}</p>
                <p className="text-sm text-muted-foreground">{coupon.store?.name ?? "All laundries"} · min {taka(coupon.minOrder, locale)}</p>
              </div>
              <CopyCode code={coupon.code} label={t.copy} />
            </div>
            <p className="mt-2 font-mono text-lg font-extrabold text-[var(--brand)]">{coupon.code}</p>
            <p className="text-sm">{coupon.type === "PERCENT" ? `${coupon.value}% off` : `${taka(coupon.value, locale)} off`}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
