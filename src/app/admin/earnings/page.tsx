import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { taka } from "@/lib/format"

export default async function EarningsPage() {
  await requireUser(["ADMIN"], "/admin/earnings")
  const orders = await db.order.findMany({ where: { status: "DELIVERED" }, include: { store: true }, orderBy: { updatedAt: "desc" } })
  const commission = orders.reduce((sum, order) => sum + order.commissionAmt, 0)
  const storeNet = orders.reduce((sum, order) => sum + order.storeEarning, 0)
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Earning report</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Tile label="Delivered orders" value={String(orders.length)} />
        <Tile label="Platform commission" value={taka(commission)} />
        <Tile label="Store net" value={taka(storeNet)} />
      </div>
      <div className="mt-4 space-y-2">
        {orders.map((order) => (
          <div key={order.id} className="flex justify-between rounded-2xl border bg-white px-3 py-3 text-sm">
            <span>{order.code} · {order.store.name}</span>
            <span>Bill {taka(order.total)} · commission {taka(order.commissionAmt)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return <div className="surface-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-extrabold">{value}</p></div>
}
