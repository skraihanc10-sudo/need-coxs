import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/bits"

export default async function StoreRiders() {
  const user = await requireUser(["STORE"], "/vendor/riders")
  const riders = await db.deliveryProfile.findMany({
    where: { OR: [{ storeId: null }, { storeId: user.store!.id }] },
    include: { user: true },
  })
  return (
    <div>
      <PageHeader title="Riders" back="/vendor/account" />
      <div className="space-y-2 px-4">
        {riders.map((rider) => (
          <article key={rider.id} className="rounded-2xl border p-3">
            <p className="font-bold">{rider.user.name}</p>
            <p className="text-sm text-muted-foreground">{rider.vehicle} · {rider.zone} · {rider.user.phone || "no phone"}</p>
            <p className="text-xs">{rider.available ? "Available" : "Paused"} · {rider.storeId ? "Your rider" : "Need Cox's pool"}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
