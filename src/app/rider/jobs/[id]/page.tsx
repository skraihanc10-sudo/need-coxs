import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, ErrorNote, StatusPill } from "@/components/bits"
import { riderUpdate } from "@/actions/rider"
import { mapsUrl, taka } from "@/lib/format"

export default async function RiderJob({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["DELIVERY"], "/rider")
  const { id } = await params
  const sp = await searchParams
  const order = await db.order.findFirst({
    where: { id, riderId: user.rider!.id },
    include: { customer: true, store: true, items: true },
  })
  if (!order) notFound()
  const snap = JSON.parse(order.addressSnapshot) as { line1?: string; area?: string; phone?: string; lat?: number; lng?: number }
  const action = order.status === "PICKUP_ASSIGNED" ? "PICKED_UP" : order.status === "READY" || order.status === "OUT_FOR_DELIVERY" ? "DELIVERED" : ""
  return (
    <div className="pb-8">
      <PageHeader title={order.code} back="/rider" />
      <ErrorNote message={sp.error} />
      <div className="space-y-3 px-4">
        <StatusPill status={order.status} locale="en" />
        <h1 className="text-xl font-extrabold">{order.customer.name}</h1>
        <p>{snap.line1}, {snap.area}</p>
        <p className="text-sm text-muted-foreground">{order.store.name} · {order.store.phone}</p>
        <div className="flex gap-2">
          <a className="pill flex flex-1 items-center justify-center border" href={`tel:${snap.phone || order.customer.phone}`}>Call</a>
          <a className="pill flex flex-1 items-center justify-center border" href={mapsUrl(snap.lat, snap.lng, `${snap.line1 || ""} ${snap.area || ""}`)}>Navigate</a>
        </div>
        <section>
          <h2 className="font-bold">Cloth list</h2>
          {order.items.map((item) => (
            <p key={item.id} className="text-sm">{item.quantity} × {item.name} · {item.kind}</p>
          ))}
        </section>
        <p className="text-sm">Pickup {order.pickupDate} {order.pickupSlot}</p>
        <p className="text-sm">Delivery {order.deliveryDate} {order.deliverySlot}</p>
        {order.notes ? <p className="rounded-xl bg-muted p-3 text-sm">{order.notes}</p> : null}
        <div className="surface-card p-4">
          <p className="text-xs font-bold text-[var(--accent-ink)]">Cash on delivery</p>
          <p className="text-3xl font-extrabold">{taka(order.total)}</p>
          <p className="text-xs text-muted-foreground">{order.paymentStatus}</p>
        </div>
        {action ? (
          <form action={riderUpdate}>
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="to" value={action} />
            <button className="pill w-full bg-primary text-primary-foreground">{action === "PICKED_UP" ? "Mark picked up" : "Mark delivered"}</button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">Waiting on the laundry before the next step.</p>
        )}
      </div>
    </div>
  )
}
