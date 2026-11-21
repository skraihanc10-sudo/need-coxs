import Link from "next/link"
import { ClipboardList, Clock3, Wallet, BadgeDollarSign } from "lucide-react"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { storeBalance } from "@/lib/orders"
import { taka } from "@/lib/format"
import { StatusPill } from "@/components/bits"

export default async function VendorHome() {
  const user = await requireUser(["STORE"], "/vendor")
  const store = user.store!
  const [orders, balance] = await Promise.all([
    db.order.findMany({ where: { storeId: store.id }, orderBy: { createdAt: "desc" }, take: 6, include: { customer: true } }),
    storeBalance(store.id),
  ])
  const [pending, totalOrders, openJobs] = await Promise.all([
    db.order.count({ where: { storeId: store.id, status: "PENDING" } }),
    db.order.count({ where: { storeId: store.id } }),
    db.serviceBooking.count({ where: { storeId: store.id, status: { notIn: ["COMPLETED", "CANCELLED"] } } }),
  ])
  const tiles = [
    ["Orders", String(totalOrders), ClipboardList],
    ["Waiting", String(pending), Clock3],
    ["Earned", taka(balance.net), BadgeDollarSign],
    ["Available", taka(balance.available), Wallet],
  ] as const
  return (
    <div className="px-4 py-5">
      <p className="text-sm text-muted-foreground">Hello</p>
      <h1 className="text-2xl font-extrabold">{store.name}</h1>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {tiles.map(([label, value, Icon]) => (
          <div key={label} className="surface-card p-3">
            <span className="icon-chip"><Icon className="size-5" /></span>
            <p className="mt-2 text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>
      <Link href="/vendor/jobs" className="mt-4 block rounded-2xl bg-[color-mix(in_srgb,var(--brand)_12%,white)] px-4 py-3 text-sm font-bold">{openJobs} open service jobs</Link>
      <div className="mt-5 flex items-center justify-between">
        <h2 className="font-extrabold">Latest orders</h2>
        <Link href="/vendor/orders" className="text-sm font-bold text-[var(--brand)]">All</Link>
      </div>
      <div className="mt-2 space-y-2">
        {orders.map((order) => (
          <Link key={order.id} href={`/vendor/orders/${order.id}`} className="flex items-center justify-between rounded-2xl border px-3 py-3">
            <span>
              <span className="block font-bold">{order.code}</span>
              <span className="text-xs text-muted-foreground">{order.customer.name}</span>
            </span>
            <StatusPill status={order.status} locale="en" />
          </Link>
        ))}
      </div>
    </div>
  )
}
