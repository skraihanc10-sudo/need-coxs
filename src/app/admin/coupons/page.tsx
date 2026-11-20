import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { saveAdminCoupon } from "@/actions/admin"
import { toggleCoupon } from "@/actions/vendor"

export default async function AdminCoupons() {
  await requireUser(["ADMIN"], "/admin/coupons")
  const [coupons, stores] = await Promise.all([
    db.coupon.findMany({ include: { store: true }, orderBy: { code: "asc" } }),
    db.store.findMany(),
  ])
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Coupons</h1>
      <div className="mt-3 space-y-2">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="flex justify-between rounded-2xl border bg-white px-3 py-3 text-sm">
            <span>{coupon.code} · {coupon.title} · {coupon.store?.name ?? "All"}</span>
            <form action={toggleCoupon}>
              <input type="hidden" name="id" value={coupon.id} />
              <input type="hidden" name="back" value="/admin/coupons" />
              <button className="font-bold">{coupon.active ? "Pause" : "On"}</button>
            </form>
          </div>
        ))}
      </div>
      <form action={saveAdminCoupon} className="mt-4 grid max-w-lg gap-2">
        <input name="code" required placeholder="CODE" className="h-11 rounded-xl border px-3 uppercase" />
        <input name="title" required placeholder="Title" className="h-11 rounded-xl border px-3" />
        <input name="detail" placeholder="Details" className="h-11 rounded-xl border px-3" />
        <select name="type" className="h-11 rounded-xl border px-3"><option value="FIXED">Fixed</option><option value="PERCENT">Percent</option></select>
        <input name="value" type="number" required placeholder="Value" className="h-11 rounded-xl border px-3" />
        <input name="minOrder" type="number" placeholder="Minimum" className="h-11 rounded-xl border px-3" />
        <input name="maxDiscount" type="number" placeholder="Max discount" className="h-11 rounded-xl border px-3" />
        <select name="storeId" className="h-11 rounded-xl border px-3">
          <option value="">All laundries</option>
          {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
        </select>
        <button className="pill bg-primary text-primary-foreground">Create</button>
      </form>
    </div>
  )
}
