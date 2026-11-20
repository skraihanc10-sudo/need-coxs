import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { createRider } from "@/actions/admin"

export default async function AdminRiders({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await requireUser(["ADMIN"], "/admin/riders")
  const sp = await searchParams
  const [riders, stores] = await Promise.all([
    db.deliveryProfile.findMany({ include: { user: true, store: true } }),
    db.store.findMany({ where: { status: "APPROVED" } }),
  ])
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Riders</h1>
      {sp.error ? <p className="text-sm text-rose-600">{sp.error}</p> : null}
      {sp.ok ? <p className="text-sm text-emerald-700">Rider added.</p> : null}
      <div className="mt-3 space-y-2">
        {riders.map((rider) => (
          <p key={rider.id} className="text-sm">{rider.user.name} · {rider.zone} · {rider.vehicle} · {rider.store?.name ?? "Pool"} · {rider.user.email}</p>
        ))}
      </div>
      <form action={createRider} className="mt-4 grid max-w-lg gap-2">
        <input name="name" required placeholder="Name" className="h-11 rounded-xl border px-3" />
        <input name="email" type="email" required placeholder="Email" className="h-11 rounded-xl border px-3" />
        <input name="phone" placeholder="Phone" className="h-11 rounded-xl border px-3" />
        <input name="password" required placeholder="Password" className="h-11 rounded-xl border px-3" />
        <input name="vehicle" placeholder="Bike" className="h-11 rounded-xl border px-3" />
        <input name="zone" placeholder="Gulshan" className="h-11 rounded-xl border px-3" />
        <select name="storeId" className="h-11 rounded-xl border px-3">
          <option value="">Need Cox&apos;s pool</option>
          {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
        </select>
        <button className="pill bg-primary text-primary-foreground">Add rider</button>
      </form>
    </div>
  )
}
