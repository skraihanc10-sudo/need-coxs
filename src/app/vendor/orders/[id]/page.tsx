import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, StatusPill, ErrorNote } from "@/components/bits"
import { acceptOrder, advanceOrder, assignAndMaybeAdvance, rejectOrder } from "@/actions/vendor"
import { taka } from "@/lib/format"

const NEXT_LABEL: Record<string, [string, string]> = {
  PICKED_UP: ["PROCESSING", "Mark processing"],
  PROCESSING: ["READY", "Ready to deliver"],
  READY: ["OUT_FOR_DELIVERY", "Send for delivery"],
  ON_HOLD: ["PROCESSING", "Resume processing"],
}

export default async function VendorOrder({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["STORE"], "/vendor/orders")
  const { id } = await params
  const sp = await searchParams
  const order = await db.order.findFirst({
    where: { id, storeId: user.store!.id },
    include: { customer: true, items: true },
  })
  if (!order) notFound()
  const riders = await db.deliveryProfile.findMany({
    where: { available: true, OR: [{ storeId: null }, { storeId: user.store!.id }] },
    include: { user: true },
  })
  const snap = JSON.parse(order.addressSnapshot) as { line1?: string; area?: string; phone?: string }
  const next = NEXT_LABEL[order.status]
  return (
    <div className="pb-8">
      <PageHeader title={order.code} back="/vendor/orders" />
      <ErrorNote message={sp.error} />
      <div className="space-y-3 px-4">
        <StatusPill status={order.status} locale="en" />
        <p className="font-extrabold">{order.customer.name}</p>
        <p className="text-sm">{snap.line1}, {snap.area} · {snap.phone}</p>
        <p className="text-sm">Pickup {order.pickupDate} {order.pickupSlot}</p>
        <p className="text-sm">Delivery {order.deliveryDate} {order.deliverySlot}</p>
        {order.items.map((item) => (
          <p key={item.id} className="text-sm">{item.quantity} × {item.name} · {item.kind}</p>
        ))}
        <p className="text-lg font-extrabold">{taka(order.total)} · {order.paymentMethod}</p>
        {order.status === "PENDING" ? (
          <div className="space-y-2">
            <form action={acceptOrder}><input type="hidden" name="id" value={order.id} /><button className="pill w-full bg-primary text-primary-foreground">Accept</button></form>
            <form action={rejectOrder} className="space-y-2">
              <input type="hidden" name="id" value={order.id} />
              <input name="note" placeholder="Reason" className="h-11 w-full rounded-xl border px-3" />
              <button className="pill w-full border text-rose-600">Reject</button>
            </form>
          </div>
        ) : null}
        {["ACCEPTED", "PICKUP_ASSIGNED", "READY", "PENDING"].includes(order.status) ? (
          <form action={assignAndMaybeAdvance} className="space-y-2">
            <input type="hidden" name="id" value={order.id} />
            <select name="riderId" required className="h-12 w-full rounded-xl border px-3">
              {riders.map((rider) => (
                <option key={rider.id} value={rider.id}>{rider.user.name} · {rider.zone}</option>
              ))}
            </select>
            <button className="pill w-full bg-primary text-primary-foreground">Assign rider</button>
          </form>
        ) : null}
        {next ? (
          <form action={advanceOrder}>
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="to" value={next[0]} />
            <button className="pill w-full bg-[var(--accent)] text-[#06283a]">{next[1]}</button>
          </form>
        ) : null}
        {!["DELIVERED", "CANCELLED", "REJECTED"].includes(order.status) ? (
          <form action={advanceOrder}>
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="to" value="ON_HOLD" />
            <button className="w-full text-sm font-bold">Put on hold</button>
          </form>
        ) : null}
      </div>
    </div>
  )
}
