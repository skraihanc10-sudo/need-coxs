import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { getSettings } from "@/lib/settings"
import { Wallet } from "lucide-react"
import { PageHeader } from "@/components/bits"
import { formatWhen, taka } from "@/lib/format"

export default async function EarningsPage() {
  const user = await requireUser(["DELIVERY"], "/rider/earnings")
  const settings = await getSettings()
  const fee = Number(settings.riderFee)
  const orders = await db.order.findMany({
    where: { riderId: user.rider!.id, status: "DELIVERED" },
    orderBy: { updatedAt: "desc" },
  })
  return (
    <div>
      <PageHeader title="Earnings" />
      <div className="mx-4 rounded-3xl bg-primary p-5 text-primary-foreground">
        <Wallet className="size-6" />
        <p className="mt-3 text-xs uppercase tracking-wide text-white/80">Collected jobs</p>
        <p className="text-4xl font-extrabold">{taka(orders.length * fee)}</p>
      </div>
      <p className="px-4 text-sm text-muted-foreground">{taka(fee)} each completed job</p>
      <div className="mt-4 space-y-3 px-4">
        {orders.map((order) => (
          <div key={order.id} className="flex justify-between text-sm">
            <span>
              <span className="block font-bold">{order.code}</span>
              <span className="text-muted-foreground">{formatWhen(order.updatedAt, "en")}</span>
            </span>
            <span className="font-extrabold">{taka(fee)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
