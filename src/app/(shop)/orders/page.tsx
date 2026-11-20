import Link from "next/link"
import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { copy } from "@/lib/i18n"
import { PageHeader, StatusPill, EmptyState } from "@/components/bits"
import { formatDay, taka } from "@/lib/format"

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireUser(["CUSTOMER"], "/orders")
  const locale = await getLocale()
  const t = copy(locale)
  const { tab = "current" } = await searchParams
  const past = tab === "past"
  const orders = await db.order.findMany({
    where: {
      customerId: user.id,
      status: past ? { in: ["DELIVERED", "CANCELLED", "REJECTED"] } : { notIn: ["DELIVERED", "CANCELLED", "REJECTED"] },
    },
    include: { store: true, items: true },
    orderBy: { createdAt: "desc" },
  })
  return (
    <div>
      <PageHeader title={t.navOrders} />
      <div className="seg px-4">
        <Link href="/orders" data-on={!past}>{t.current}</Link>
        <Link href="/orders?tab=past" data-on={past}>{t.past}</Link>
      </div>
      <div className="mt-4 space-y-3 px-4 pb-6">
        {!orders.length ? <EmptyState title={t.noOrders} body={t.emptyBagBody} href="/stores" action={t.browse} /> : null}
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.code}`} className="surface-card block p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-extrabold">{order.store.name}</p>
                <p className="text-xs text-muted-foreground">{order.code} · {formatDay(order.pickupDate, locale)}</p>
              </div>
              <StatusPill status={order.status} locale={locale} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}</p>
            <p className="mt-2 font-extrabold">{taka(order.total, locale)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
