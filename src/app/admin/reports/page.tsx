import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { taka } from "@/lib/format"

export default async function ReportsPage() {
  await requireUser(["ADMIN"], "/admin/reports")
  const orders = await db.order.findMany({ include: { store: true } })
  const live = orders.filter((order) => !["CANCELLED", "REJECTED"].includes(order.status))
  const delivered = orders.filter((order) => order.status === "DELIVERED")
  const gmv = live.reduce((sum, order) => sum + order.total, 0)
  const commission = delivered.reduce((sum, order) => sum + order.commissionAmt, 0)
  const byStore = new Map<string, { name: string; total: number; count: number }>()
  for (const order of live) {
    const row = byStore.get(order.storeId) ?? { name: order.store.name, total: 0, count: 0 }
    row.total += order.total
    row.count += 1
    byStore.set(order.storeId, row)
  }
  const rows = [...byStore.values()].sort((a, b) => b.total - a.total)
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Reports</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Tile label="Bookings" value={taka(gmv)} />
        <Tile label="Commission" value={taka(commission)} />
        <Tile label="Delivered" value={String(delivered.length)} />
      </div>
      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div key={row.name} className="flex justify-between rounded-2xl border bg-white px-3 py-3 text-sm">
            <span className="font-bold">{row.name}</span>
            <span>{row.count} orders · {taka(row.total)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return <div className="surface-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-extrabold">{value}</p></div>
}
