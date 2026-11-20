import Link from "next/link"
import { requireUser } from "@/lib/auth"
import { getCart } from "@/lib/queries"
import { copy } from "@/lib/i18n"
import { getLocale } from "@/lib/auth"
import { PageHeader, EmptyState, Money } from "@/components/bits"
import { setQty } from "@/actions/shop"
import { taka } from "@/lib/format"

export default async function CartPage() {
  const user = await requireUser(["CUSTOMER"], "/cart")
  const locale = await getLocale()
  const t = copy(locale)
  const cart = await getCart(user.id)
  return (
    <div>
      <PageHeader title={t.bag} back="/" />
      {!cart.items.length || !cart.store ? (
        <EmptyState title={t.emptyBag} body={t.emptyBagBody} href="/stores" action={t.browse} />
      ) : (
        <div className="space-y-3 px-4 pb-8">
          <p className="text-sm font-bold text-[var(--brand)]">{cart.store.name}</p>
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl border p-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{item.price.item.name}</p>
                <p className="text-sm text-muted-foreground">{item.price.kind.name}</p>
                <p className="price text-sm">{taka(item.price.amount * item.quantity, locale)}</p>
              </div>
              <div className="flex items-center gap-2">
                <form action={setQty}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="quantity" value={item.quantity - 1} />
                  <button className="grid size-8 place-items-center rounded-full bg-muted font-bold" aria-label="Decrease">−</button>
                </form>
                <span className="w-5 text-center font-bold">{item.quantity}</span>
                <form action={setQty}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="quantity" value={item.quantity + 1} />
                  <button className="grid size-8 place-items-center rounded-full bg-primary font-bold text-primary-foreground" aria-label="Increase">+</button>
                </form>
              </div>
            </div>
          ))}
          <div className="flex justify-between font-extrabold">
            <span>{t.subtotal}</span>
            <Money value={cart.subtotal} locale={locale} />
          </div>
          <Link href="/checkout/review" className="pill flex items-center justify-center bg-primary text-primary-foreground">{t.review}</Link>
        </div>
      )}
    </div>
  )
}
