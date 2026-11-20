import Link from "next/link"
import { db } from "@/lib/db"
import { dhakaDate, recentDays, taka } from "@/lib/format"
import { requireUser } from "@/lib/auth"

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ view?: string; range?: string }> }) {
  await requireUser(["ADMIN"], "/admin")
  const { view = "orders", range = "week" } = await searchParams
  const revenue = view === "revenue"
  const span = range === "year" ? 12 : range === "month" ? 4 : 7
  const orders = await db.order.findMany({
    where: { status: { notIn: ["CANCELLED", "REJECTED"] } },
    select: { createdAt: true, total: true, status: true },
  })
  const buckets = range === "year"
    ? Array.from({ length: 12 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (11 - i))
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      })
    : range === "month"
      ? Array.from({ length: 4 }, (_, i) => `W${i + 1}`)
      : recentDays(span)
  const counts = buckets.map((bucket, index) => {
    const matched = orders.filter((order) => {
      if (range === "year") return dhakaDate(order.createdAt).slice(0, 7) === bucket
      if (range === "month") {
        const age = Math.floor((Date.now() - order.createdAt.getTime()) / (7 * 86400000))
        return age === 3 - index
      }
      return dhakaDate(order.createdAt) === bucket
    })
    const value = revenue ? matched.reduce((sum, order) => sum + order.total, 0) : matched.length
    return { bucket, value }
  })
  const max = Math.max(1, ...counts.map((item) => item.value))
  const gmv = orders.reduce((sum, order) => sum + order.total, 0)
  const pendingStores = await db.store.count({ where: { status: "PENDING" } })
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Need Cox&apos;s desk</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/admin?view=orders&range=${range}`} data-on={!revenue} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground data-[on=false]:bg-muted data-[on=false]:text-foreground">Orders</Link>
        <Link href={`/admin?view=revenue&range=${range}`} data-on={revenue} className="rounded-full bg-muted px-4 py-2 text-sm font-bold data-[on=true]:bg-primary data-[on=true]:text-primary-foreground">Revenue</Link>
      </div>
      <div className="seg mt-3">
        <Link href={`/admin?view=${view}&range=week`} data-on={range === "week"}>Weekly</Link>
        <Link href={`/admin?view=${view}&range=month`} data-on={range === "month"}>Monthly</Link>
        <Link href={`/admin?view=${view}&range=year`} data-on={range === "year"}>Yearly</Link>
      </div>
      <div className="surface-card mt-4 p-4">
        <div className="flex h-40 items-end gap-2">
          {counts.map((item) => (
            <div key={item.bucket} className="flex h-36 flex-1 flex-col items-center justify-end gap-1">
              <div className="bar w-full" style={{ height: `${Math.max(10, (item.value / max) * 100)}%` }} />
              <span className="text-[10px] text-muted-foreground">{item.bucket.slice(-5)}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm">Gross bookings {taka(gmv)} · {pendingStores} laundries waiting for approval</p>
      </div>
      <Link href="/admin/orders" className="pill mt-4 flex w-full items-center justify-center bg-primary text-primary-foreground md:w-64">View all orders</Link>
    </div>
  )
}
