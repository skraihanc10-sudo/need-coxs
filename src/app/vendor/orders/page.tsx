import Link from "next/link"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, StatusPill } from "@/components/bits"
import { taka } from "@/lib/format"

export default async function VendorOrders({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireUser(["STORE"], "/vendor/orders")
  const { tab = "new" } = await searchParams
  const past = tab === "past"
  const orders = await db.order.findMany({
    where: {
      storeId: user.store!.id,
      status: past ? { in: ["DELIVERED", "CANCELLED", "REJECTED"] } : { notIn: ["DELIVERED", "CANCELLED", "REJECTED"] },
    },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  })
  return (
    <div>
      <PageHeader title="Orders" />
      <div className="seg px-4">
        <Link href="/vendor/orders" data-on={!past}>New</Link>
        <Link href="/vendor/orders?tab=past" data-on={past}>Past</Link>
      </div>
      <div className="mt-3 space-y-2 px-4 pb-6">
        {orders.map((order) => (
          <Link key={order.id} href={`/vendor/orders/${order.id}`} className="surface-card block p-3">
            <div className="flex justify-between gap-2">
              <p className="font-bold">{order.customer.name}</p>
              <StatusPill status={order.status} locale="en" />
            </div>
            <p className="text-xs text-muted-foreground">{order.code}</p>
            <p className="font-extrabold">{taka(order.total)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
