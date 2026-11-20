import { requireUser, getLocale } from "@/lib/auth"
import { getCart } from "@/lib/queries"
import { getDraft } from "@/lib/draft"
import { db } from "@/lib/db"
import { copy } from "@/lib/i18n"
import { PageHeader, ErrorNote, Money } from "@/components/bits"
import { saveCoupon } from "@/actions/shop"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const user = await requireUser(["CUSTOMER"], "/checkout/review")
  const locale = await getLocale()
  const t = copy(locale)
  const sp = await searchParams
  const cart = await getCart(user.id)
  if (!cart.store) redirect("/cart")
  const draft = await getDraft()
  const coupon = draft.coupon ? await db.coupon.findUnique({ where: { code: draft.coupon } }) : null
  let discount = 0
  if (coupon && coupon.active && cart.subtotal >= coupon.minOrder && (!coupon.storeId || coupon.storeId === cart.store.id)) {
    discount = coupon.type === "PERCENT" ? Math.round((cart.subtotal * coupon.value) / 100) : coupon.value
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
    discount = Math.min(discount, cart.subtotal)
  }
  const payable = cart.subtotal + cart.store.deliveryFee - discount
  return (
    <div>
      <PageHeader title={t.review} back="/cart" />
      <ErrorNote message={sp.error} />
      <div className="space-y-3 px-4 pb-8">
        <p className="font-extrabold">{cart.store.name}</p>
        {cart.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.quantity} × {item.price.item.name} · {item.price.kind.name}</span>
            <Money value={item.price.amount * item.quantity} locale={locale} />
          </div>
        ))}
        <form action={saveCoupon} className="flex gap-2">
          <input name="coupon" defaultValue={draft.coupon || ""} placeholder={t.promo} className="h-12 flex-1 rounded-xl border px-3 uppercase" />
          <button className="rounded-full bg-[var(--accent)] px-4 text-sm font-extrabold text-[#06283a]">{t.apply}</button>
        </form>
        {sp.ok ? <p className="text-sm text-emerald-700">Code saved.</p> : null}
        <Bill label={t.subtotal} value={cart.subtotal} locale={locale} />
        <Bill label={t.delivery} value={cart.store.deliveryFee} locale={locale} />
        <Bill label={t.discount} value={-discount} locale={locale} />
        <div className="flex justify-between text-lg font-extrabold">
          <span>{t.toPay}</span>
          <Money value={payable} locale={locale} />
        </div>
        <Link href="/checkout/schedule" className="pill flex items-center justify-center bg-primary text-primary-foreground">{t.next}</Link>
      </div>
    </div>
  )
}

function Bill({ label, value, locale }: { label: string; value: number; locale: "en" | "bn" }) {
  return (
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <Money value={value} locale={locale} />
    </div>
  )
}
