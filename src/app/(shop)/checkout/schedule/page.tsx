import Link from "next/link"
import { redirect } from "next/navigation"
import { requireUser, getLocale } from "@/lib/auth"
import { getCart } from "@/lib/queries"
import { getDraft } from "@/lib/draft"
import { db } from "@/lib/db"
import { copy } from "@/lib/i18n"
import { upcomingDays } from "@/lib/format"
import { PageHeader, ErrorNote } from "@/components/bits"
import { ScheduleForm } from "@/components/schedule-form"

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["CUSTOMER"], "/checkout/schedule")
  const locale = await getLocale()
  const t = copy(locale)
  const sp = await searchParams
  const cart = await getCart(user.id)
  if (!cart.store) redirect("/cart")
  const [slots, addresses, draft] = await Promise.all([
    db.timeSlot.findMany({ where: { storeId: cart.store.id, active: true }, orderBy: { startTime: "asc" } }),
    db.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } }),
    getDraft(),
  ])
  return (
    <div>
      <PageHeader title={t.schedule} back="/checkout/review" />
      <ErrorNote message={sp.error} />
      {!addresses.length ? (
        <div className="px-4">
          <p className="mb-3 text-sm">Add an address before choosing a slot.</p>
          <Link href="/profile/addresses?back=/checkout/schedule" className="pill flex items-center justify-center bg-primary text-primary-foreground">{t.addAddress}</Link>
        </div>
      ) : (
        <ScheduleForm
          days={upcomingDays(8)}
          slots={slots.map((slot) => slot.label)}
          addresses={addresses}
          draft={draft}
          locale={locale}
          labels={{
            pickup: t.pickup,
            dropoff: t.dropoff,
            next: t.next,
            address: t.address,
            preference: t.preference,
            regular: t.regular,
            free: t.free,
            baby: t.baby,
            notes: t.notes,
          }}
        />
      )}
    </div>
  )
}
