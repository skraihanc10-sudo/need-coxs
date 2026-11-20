import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { saveZone, toggleZone } from "@/actions/admin"
import { taka } from "@/lib/format"

export default async function ZonesPage() {
  await requireUser(["ADMIN"], "/admin/zones")
  const zones = await db.deliveryZone.findMany({ orderBy: { name: "asc" } })
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Delivery zones</h1>
      <div className="mt-4 space-y-2">
        {zones.map((zone) => (
          <div key={zone.id} className="flex items-center justify-between rounded-2xl border bg-white px-3 py-3 text-sm">
            <span>{zone.name} · {zone.area} · {taka(zone.fee)} {zone.active ? "" : "· paused"}</span>
            <form action={toggleZone}><input type="hidden" name="id" value={zone.id} /><button className="font-bold">{zone.active ? "Pause" : "On"}</button></form>
          </div>
        ))}
      </div>
      <form action={saveZone} className="mt-4 grid max-w-lg gap-2">
        <input name="name" required placeholder="Zone name" className="h-11 rounded-xl border px-3" />
        <input name="area" required placeholder="Area" className="h-11 rounded-xl border px-3" />
        <input name="fee" type="number" required placeholder="Fee in ৳" className="h-11 rounded-xl border px-3" />
        <button className="pill bg-primary text-primary-foreground">Add zone</button>
      </form>
    </div>
  )
}
