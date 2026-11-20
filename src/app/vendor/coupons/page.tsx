import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, ErrorNote } from "@/components/bits"
import { saveStoreCoupon, toggleCoupon } from "@/actions/vendor"

export default async function StoreCoupons({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["STORE"], "/vendor/coupons")
  const sp = await searchParams
  const coupons = await db.coupon.findMany({ where: { storeId: user.store!.id } })
  return (
    <div>
      <PageHeader title="Coupons" back="/vendor/account" />
      <ErrorNote message={sp.error} />
      <div className="space-y-2 px-4">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="flex items-center justify-between rounded-2xl border px-3 py-3">
            <span><b>{coupon.code}</b> · {coupon.title}</span>
            <form action={toggleCoupon}>
              <input type="hidden" name="id" value={coupon.id} />
              <input type="hidden" name="back" value="/vendor/coupons" />
              <button className="text-sm font-bold">{coupon.active ? "Pause" : "On"}</button>
            </form>
          </div>
        ))}
      </div>
      <form action={saveStoreCoupon} className="mt-4 space-y-2 px-4 pb-8">
        <input name="code" placeholder="CODE" required className="h-11 w-full rounded-xl border px-3 uppercase" />
        <input name="title" placeholder="Title" required className="h-11 w-full rounded-xl border px-3" />
        <select name="type" className="h-11 w-full rounded-xl border px-3"><option value="FIXED">Fixed ৳</option><option value="PERCENT">Percent</option></select>
        <input name="value" type="number" placeholder="Value" required className="h-11 w-full rounded-xl border px-3" />
        <input name="minOrder" type="number" placeholder="Minimum order" className="h-11 w-full rounded-xl border px-3" />
        <button className="pill w-full bg-primary text-primary-foreground">Create coupon</button>
      </form>
    </div>
  )
}
