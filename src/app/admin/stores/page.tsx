import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { setCommission, setStoreStatus } from "@/actions/admin"

export default async function StoresAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser(["ADMIN"], "/admin/stores")
  const sp = await searchParams
  const stores = await db.store.findMany({ include: { owner: true }, orderBy: { createdAt: "desc" } })
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Stores</h1>
      {sp.ok ? <p className="text-sm text-emerald-700">Commission saved.</p> : null}
      <div className="mt-4 space-y-3">
        {stores.map((store) => (
          <article key={store.id} className="surface-card p-4">
            <p className="font-extrabold">{store.name}</p>
            <p className="text-sm text-muted-foreground">{store.area} · {store.owner.email} · {store.status}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {store.status !== "APPROVED" ? (
                <form action={setStoreStatus}><input type="hidden" name="id" value={store.id} /><input type="hidden" name="status" value="APPROVED" /><button className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">Approve</button></form>
              ) : (
                <form action={setStoreStatus}><input type="hidden" name="id" value={store.id} /><input type="hidden" name="status" value="SUSPENDED" /><button className="rounded-full border px-3 py-1 text-sm font-bold">Suspend</button></form>
              )}
            </div>
            <form action={setCommission} className="mt-2 flex gap-2">
              <input type="hidden" name="id" value={store.id} />
              <input name="rate" type="number" step="0.5" defaultValue={store.commissionRate} className="h-10 w-24 rounded-xl border px-2" />
              <button className="text-sm font-bold">Commission %</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  )
}
