import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, ErrorNote } from "@/components/bits"
import { addStoreRider } from "@/actions/vendor"

export default async function StoreRiders({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const user = await requireUser(["STORE"], "/vendor/riders")
  const sp = await searchParams
  const riders = await db.deliveryProfile.findMany({
    where: { OR: [{ storeId: null }, { storeId: user.store!.id }] },
    include: { user: true },
  })
  return (
    <div>
      <PageHeader title="Riders" back="/vendor/account" />
      <ErrorNote message={sp.error} />
      {sp.ok ? <p className="px-4 text-sm text-emerald-700">Rider added. The password is stored as a hash.</p> : null}
      <div className="space-y-2 px-4">
        {riders.map((rider) => (
          <article key={rider.id} className="rounded-2xl border p-3">
            <p className="font-bold">{rider.user.name}</p>
            <p className="text-sm text-muted-foreground">{rider.vehicle} · {rider.zone} · {rider.user.phone || "no phone"}</p>
            <p className="text-xs">{rider.available ? "Available" : "Paused"} · {rider.storeId ? "Your rider" : "Cox's Seba pool"}</p>
          </article>
        ))}
      </div>
      <form action={addStoreRider} className="mt-4 grid gap-2 px-4 pb-8">
        <input name="name" required placeholder="Name" className="h-11 rounded-xl border px-3" />
        <input name="email" type="email" required placeholder="Email" className="h-11 rounded-xl border px-3" />
        <input name="phone" placeholder="Phone" className="h-11 rounded-xl border px-3" />
        <input name="password" type="password" required minLength={6} placeholder="Password" className="h-11 rounded-xl border px-3" autoComplete="new-password" />
        <button className="pill bg-primary text-primary-foreground">Add rider</button>
      </form>
    </div>
  )
}
