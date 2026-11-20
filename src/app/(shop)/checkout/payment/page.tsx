import { redirect } from "next/navigation"
import { requireUser, getLocale } from "@/lib/auth"
import { getCart } from "@/lib/queries"
import { getDraft } from "@/lib/draft"
import { getSettings } from "@/lib/settings"
import { providerView } from "@/lib/payments"
import { copy } from "@/lib/i18n"
import { PageHeader } from "@/components/bits"
import { PaymentForm } from "./form"
import { taka } from "@/lib/format"
import { db } from "@/lib/db"

export default async function PaymentPage() {
  const user = await requireUser(["CUSTOMER"], "/checkout/payment")
  const locale = await getLocale()
  const t = copy(locale)
  const cart = await getCart(user.id)
  if (!cart.store) redirect("/cart")
  const draft = await getDraft()
  if (!draft.addressId || !draft.pickupSlot) redirect("/checkout/schedule")
  const settings = await getSettings()
  const methods = ["COD", "BKASH", "SSLCOMMERZ", "STRIPE"]
    .map((id) => providerView(id, settings))
    .filter((item) => item.enabled)
  const wallet = await db.wallet.findUnique({ where: { userId: user.id } })
  return (
    <div>
      <PageHeader title={t.payment} back="/checkout/schedule" />
      <div className="px-4 pb-2 text-sm text-muted-foreground">
        {t.toPay} <span className="price">{taka(cart.subtotal + cart.store.deliveryFee, locale)}</span>
      </div>
      <PaymentForm
        methods={methods.map((item) => ({
          id: item.id,
          label: locale === "bn" ? item.labelBn : item.label,
          hint: item.hint,
          configured: item.configured,
        }))}
        wallet={wallet?.balance ?? 0}
        locale={locale}
        labels={{ place: t.placeOrder, wallet: t.useWallet, notes: t.notes }}
      />
    </div>
  )
}
