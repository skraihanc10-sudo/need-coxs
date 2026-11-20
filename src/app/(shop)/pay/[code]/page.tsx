import { notFound } from "next/navigation"
import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { providerView } from "@/lib/payments"
import { getSettings } from "@/lib/settings"
import { PageHeader } from "@/components/bits"
import { switchToCod } from "@/actions/shop"
import { taka } from "@/lib/format"
import { brand } from "@/theme/brand"

export default async function PayPage({ params }: { params: Promise<{ code: string }> }) {
  const user = await requireUser(["CUSTOMER"], "/orders")
  const locale = await getLocale()
  const { code } = await params
  const order = await db.order.findFirst({ where: { code, customerId: user.id }, include: { payment: true } })
  if (!order) notFound()
  const settings = await getSettings()
  const gateway = providerView(order.paymentMethod, settings)
  return (
    <div>
      <PageHeader title={gateway.label} back={`/orders/${order.code}`} />
      <div className="space-y-3 px-4 pb-8">
        <div className="surface-card p-4">
          <p className="text-sm text-muted-foreground">{brand.name} · {order.code}</p>
          <p className="text-2xl font-extrabold">{taka(order.total, locale)}</p>
          <p className="mt-2 text-sm">{gateway.configured ? "Keys are present. Wire the create-session call in src/lib/payments.ts." : "This gateway is not configured yet."}</p>
          {gateway.missing.length ? (
            <ul className="mt-2 list-disc pl-5 text-sm">
              {gateway.missing.map((key) => (
                <li key={key}>{key}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <form action={switchToCod}>
          <input type="hidden" name="code" value={order.code} />
          <button className="pill w-full bg-primary text-primary-foreground">Switch this order to cash on delivery</button>
        </form>
      </div>
    </div>
  )
}
