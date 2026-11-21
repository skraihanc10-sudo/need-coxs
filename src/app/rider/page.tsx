import Link from "next/link"
import { Bike, Wallet } from "lucide-react"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { StatusPill } from "@/components/bits"
import { getSettings } from "@/lib/settings"
import { taka } from "@/lib/format"

export default async function RiderHome({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireUser(["DELIVERY"], "/rider")
  const { tab = "assigned" } = await searchParams
  const done = tab === "done"
  const settings = await getSettings()
  const orders = await db.order.findMany({
    where: {
      riderId: user.rider!.id,
      status: done ? "DELIVERED" : { notIn: ["DELIVERED", "CANCELLED", "REJECTED"] },
    },
    include: { customer: true, store: true },
    orderBy: { updatedAt: "desc" },
  })
  const completed = await db.order.count({ where: { riderId: user.rider!.id, status: "DELIVERED" } })
  const fieldJobs = await db.serviceBooking.findMany({
    where: {
      workerId: user.rider!.id,
      status: done ? "COMPLETED" : { notIn: ["COMPLETED", "CANCELLED"] },
    },
    include: { customer: true, offering: true, store: true },
    orderBy: { updatedAt: "desc" },
  })
  return (
    <div className="px-4 py-5">
      <h1 className="text-2xl font-extrabold">Field jobs</h1>
      <p className="text-sm text-muted-foreground">{user.name} · {user.rider!.zone}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="surface-card p-3"><span className="icon-chip"><Bike className="size-5" /></span><p className="mt-2 text-xs">Assigned</p><p className="text-2xl font-extrabold">{done ? "—" : orders.length}</p></div>
        <div className="surface-card p-3"><span className="icon-chip"><Wallet className="size-5" /></span><p className="mt-2 text-xs">Earned</p><p className="text-2xl font-extrabold">{taka(completed * Number(settings.riderFee))}</p></div>
      </div>
      <div className="seg mt-4">
        <Link href="/rider" data-on={!done}>Assigned</Link>
        <Link href="/rider?tab=done" data-on={done}>Completed</Link>
      </div>
      <div className="mt-3 space-y-3">
        {fieldJobs.map((job) => (
          <Link key={job.id} href={`/rider/field/${job.code}`} className="surface-card block p-3">
            <div className="flex justify-between">
              <p className="font-bold">{job.offering.name}</p>
              <StatusPill status={job.status} locale="en" />
            </div>
            <p className="text-xs text-muted-foreground">{job.code} · {job.customer.name}</p>
            <p className="mt-1 text-sm">{job.store.name} · {job.visitSlot}</p>
            <p className="font-extrabold">{job.paymentMethod} {job.price ? taka(job.price) : ""}</p>
          </Link>
        ))}
        {orders.map((order) => (
          <Link key={order.id} href={`/rider/jobs/${order.id}`} className="surface-card block p-3">
            <div className="flex justify-between">
              <p className="font-bold">{order.customer.name}</p>
              <StatusPill status={order.status} locale="en" />
            </div>
            <p className="text-xs text-muted-foreground">{order.code} · {order.store.name}</p>
            <p className="mt-1 text-sm">{order.status === "PICKUP_ASSIGNED" ? `Pickup ${order.pickupSlot}` : `Drop ${order.deliverySlot}`}</p>
            <p className="font-extrabold">{taka(order.total)} cash</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
