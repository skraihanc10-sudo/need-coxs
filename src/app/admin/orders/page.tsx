import Link from "next/link"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { StatusPill } from "@/components/bits"
import { taka } from "@/lib/format"

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string }> }) {
  await requireUser(["ADMIN"], "/admin/orders")
  const { tab = "new", q = "" } = await searchParams
  const past = tab === "past"
  const orders = await db.order.findMany({
    where: {
      status: past ? { in: ["DELIVERED", "CANCELLED", "REJECTED"] } : { notIn: ["DELIVERED", "CANCELLED", "REJECTED"] },
      ...(q ? { code: { contains: q.toUpperCase() } } : {}),
    },
    include: { customer: true, store: true },
    orderBy: { createdAt: "desc" },
    take: 80,
  })
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Orders</h1>
      <div className="seg mt-3">
        <Link href="/admin/orders" data-on={!past}>New</Link>
        <Link href="/admin/orders?tab=past" data-on={past}>Past</Link>
      </div>
      <form className="mt-3"><input name="q" defaultValue={q} placeholder="Order code" className="h-11 w-full max-w-sm rounded-xl border px-3" /></form>
      <div className="mt-4 space-y-2">
        {orders.map((order) => (
          <Link key={order.id} href={`/admin/orders/${order.id}`} className="surface-card flex items-center justify-between p-3">
            <span>
              <span className="block font-bold">{order.customer.name}</span>
              <span className="text-xs text-muted-foreground">{order.code} · {order.store.name}</span>
            </span>
            <span className="text-right">
              <StatusPill status={order.status} locale="en" />
              <span className="mt-1 block font-extrabold">{taka(order.total)}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
