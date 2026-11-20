import Link from "next/link"
import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { ErrorNote, StatusPill } from "@/components/bits"
import { StatusSheet } from "@/components/status-sheet"
import { formatDay, taka } from "@/lib/format"

export default async function AdminOrder({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string; error?: string }>
}) {
  await requireUser(["ADMIN"], "/admin/orders")
  const { id } = await params
  const sp = await searchParams
  const order = await db.order.findUnique({
    where: { id },
    include: { customer: true, store: true, items: true, rider: { include: { user: true } } },
  })
  if (!order) notFound()
  const riders = await db.deliveryProfile.findMany({ where: { available: true }, include: { user: true } })
  const snap = JSON.parse(order.addressSnapshot) as { line1?: string; area?: string; phone?: string }
  const customerTab = sp.tab === "customer"
  return (
    <div className="p-4 md:p-8">
      <Link href="/admin/orders" className="text-sm font-bold text-[var(--brand)]">Back</Link>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-extrabold">{order.code}</h1>
        <StatusPill status={order.status} locale="en" />
      </div>
      <ErrorNote message={sp.error} />
      <div className="seg mt-3">
        <Link href={`/admin/orders/${order.id}`} data-on={!customerTab}>Ordered items</Link>
        <Link href={`/admin/orders/${order.id}?tab=customer`} data-on={customerTab}>Customer info</Link>
      </div>
      {!customerTab ? (
        <div className="surface-card mt-4 p-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-1 text-sm">
              <span>{item.quantity} × {item.name} · {item.kind}</span>
              <span>{taka(item.price * item.quantity)}</span>
            </div>
          ))}
          <p className="mt-2 font-extrabold">Total {taka(order.total)}</p>
          <p className="text-sm text-muted-foreground">{order.paymentMethod} · {order.paymentStatus}</p>
        </div>
      ) : (
        <div className="surface-card mt-4 space-y-1 p-4 text-sm">
          <p className="font-bold">{order.customer.name}</p>
          <p>{order.customer.email}</p>
          <p>{order.customer.phone || snap.phone}</p>
          <p>{snap.line1}, {snap.area}</p>
          <p>Pickup {formatDay(order.pickupDate, "en")} {order.pickupSlot}</p>
          <p>Delivery {formatDay(order.deliveryDate, "en")} {order.deliverySlot}</p>
          <p>Laundry {order.store.name}</p>
          <p>Rider {order.rider?.user.name ?? "None"}</p>
        </div>
      )}
      <div className="mt-4 max-w-md">
        <StatusSheet orderId={order.id} status={order.status} riders={riders.map((rider) => ({ id: rider.id, name: rider.user.name }))} />
      </div>
    </div>
  )
}
