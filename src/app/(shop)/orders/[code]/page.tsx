import Link from "next/link"
import { notFound } from "next/navigation"
import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { copy } from "@/lib/i18n"
import { PageHeader, StatusPill, Money } from "@/components/bits"
import { FLOW } from "@/lib/status"
import { formatDay, formatWhen, mapsUrl, taka } from "@/lib/format"
import { SuccessArt } from "@/components/art"

export default async function OrderDetail({ params }: { params: Promise<{ code: string }> }) {
  const user = await requireUser(["CUSTOMER"], "/orders")
  const locale = await getLocale()
  const t = copy(locale)
  const { code } = await params
  const order = await db.order.findFirst({
    where: { code, customerId: user.id },
    include: { store: true, items: true, events: { orderBy: { createdAt: "asc" } }, review: true },
  })
  if (!order) notFound()
  const snap = JSON.parse(order.addressSnapshot) as { label?: string; line1?: string; area?: string; phone?: string; lat?: number; lng?: number }
  const done = new Set(order.events.map((event) => event.status))
  const closed = order.status === "CANCELLED" || order.status === "REJECTED"
  return (
    <div className="pb-8">
      <PageHeader title={order.code} back="/orders" />
      <div className="px-4 text-center">
        {order.status === "DELIVERED" ? <SuccessArt /> : <div className="mx-auto grid size-20 place-items-center rounded-full bg-[var(--brand-soft)] text-3xl font-extrabold text-[var(--brand)]">{order.status.slice(0, 1)}</div>}
        <div className="mt-3 flex justify-center"><StatusPill status={order.status} locale={locale} /></div>
        <p className="mt-2 font-extrabold">{order.store.name}</p>
      </div>
      {!closed ? (
        <ol className="mx-4 mt-4 space-y-2">
          {FLOW.map((step) => (
            <li key={step} className="flex items-center gap-2 text-sm">
              <span className={`size-2.5 rounded-full ${done.has(step) || order.status === step ? "bg-[var(--brand)]" : "bg-muted"}`} />
              <span className={order.status === step ? "font-extrabold" : ""}>{step.replaceAll("_", " ").toLowerCase()}</span>
            </li>
          ))}
        </ol>
      ) : null}
      <section className="mx-4 mt-5">
        <h2 className="font-extrabold">{t.clothList}</h2>
        {order.items.map((item) => (
          <div key={item.id} className="mt-2 flex justify-between text-sm">
            <span>{item.quantity} × {item.name} · {item.kind}</span>
            <Money value={item.price * item.quantity} locale={locale} />
          </div>
        ))}
        <div className="mt-2 flex justify-between font-extrabold">
          <span>{t.toPay}</span>
          <span>{taka(order.total, locale)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{order.paymentMethod} · {order.paymentStatus}</p>
      </section>
      <section className="mx-4 mt-5 text-sm">
        <p className="font-extrabold">{t.pickup} · {formatDay(order.pickupDate, locale)} · {order.pickupSlot}</p>
        <p className="font-extrabold">{t.dropoff} · {formatDay(order.deliveryDate, locale)} · {order.deliverySlot}</p>
        <p className="mt-2">{snap.label} · {snap.line1}, {snap.area}</p>
        <p>{snap.phone}</p>
        <a className="mt-2 inline-block font-bold text-[var(--brand)]" href={mapsUrl(snap.lat, snap.lng, `${snap.line1 || ""} ${snap.area || ""}`)}>{t.navigate}</a>
      </section>
      <section className="mx-4 mt-5 space-y-1 text-xs text-muted-foreground">
        {order.events.map((event) => (
          <p key={event.id}>{formatWhen(event.createdAt, locale)} · {event.status}{event.note ? ` · ${event.note}` : ""}</p>
        ))}
      </section>
      <div className="mx-4 mt-5 space-y-2">
        {["PENDING", "ACCEPTED", "PICKUP_ASSIGNED"].includes(order.status) ? (
          <Link href={`/orders/${order.code}/cancel`} className="pill flex items-center justify-center border text-rose-600">{t.cancel}</Link>
        ) : null}
        {order.status === "DELIVERED" && !order.review ? (
          <Link href={`/orders/${order.code}/review`} className="pill flex items-center justify-center bg-primary text-primary-foreground">{t.writeReview}</Link>
        ) : null}
      </div>
    </div>
  )
}
