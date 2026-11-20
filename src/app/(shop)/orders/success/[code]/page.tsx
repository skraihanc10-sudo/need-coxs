import Link from "next/link"
import { notFound } from "next/navigation"
import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { copy } from "@/lib/i18n"
import { SuccessArt } from "@/components/art"
import { brand } from "@/theme/brand"

export default async function SuccessPage({ params }: { params: Promise<{ code: string }> }) {
  const user = await requireUser(["CUSTOMER"], "/orders")
  const locale = await getLocale()
  const t = copy(locale)
  const { code } = await params
  const order = await db.order.findFirst({ where: { code, customerId: user.id } })
  if (!order) notFound()
  return (
    <div className="px-6 py-16 text-center">
      <SuccessArt />
      <p className="mt-4 text-sm font-bold text-[var(--brand)]">{brand.name}</p>
      <h1 className="mt-1 text-2xl font-extrabold">{t.orderPlaced}</h1>
      <p className="mt-2 text-muted-foreground">{order.code}</p>
      <Link href={`/orders/${order.code}`} className="pill mt-6 flex items-center justify-center bg-primary text-primary-foreground">{t.track}</Link>
    </div>
  )
}
