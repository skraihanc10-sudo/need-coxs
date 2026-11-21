import { notFound, redirect } from "next/navigation"
import { getLocale, getUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { activeAreas } from "@/lib/catalog"
import { getSettings } from "@/lib/settings"
import { enabledProviders } from "@/lib/payments"
import { BOOKING_DAYS, SLOTS } from "@/lib/bookings"
import { upcomingDays } from "@/lib/format"
import { named, pick } from "@/lib/i18n"
import { homeFor } from "@/lib/roles"
import { PageHeader } from "@/components/bits"
import { BookingWizard } from "@/components/booking-wizard"

export default async function BookPage({ params }: { params: Promise<{ category: string; offering: string }> }) {
  const [{ category: catSlug, offering: offerSlug }, locale, user, areas, settings] = await Promise.all([params, getLocale(), getUser(), activeAreas(), getSettings()])
  if (user && user.role !== "CUSTOMER") redirect(homeFor(user.role))
  const category = await db.serviceCategory.findFirst({ where: { slug: catSlug, active: true } })
  const offering = category ? await db.serviceOffering.findFirst({ where: { categoryId: category.id, slug: offerSlug, active: true } }) : null
  if (!category || !offering) notFound()
  const addresses = user ? await db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] }) : []

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader back={`/services/${category.slug}`} title={pick(locale, "বুকিং", "Book")} sub={`${named(locale, category)} · ${named(locale, offering)}`} />
      <BookingWizard
        locale={locale}
        category={{ slug: category.slug, name: category.name, nameBn: category.nameBn, flow: category.flow }}
        offering={{ id: offering.id, name: offering.name, nameBn: offering.nameBn, pricing: offering.pricing, price: offering.price, minQty: offering.minQty, detail: offering.detail, detailBn: offering.detailBn }}
        areas={areas.map((a) => ({ id: a.id, name: a.name, nameBn: a.nameBn, charge: a.charge }))}
        slots={SLOTS}
        days={upcomingDays(BOOKING_DAYS)}
        payments={enabledProviders(settings).map((p) => ({ id: p.id, label: p.label, labelBn: p.labelBn, hint: p.hint, hintBn: p.hintBn }))}
        user={user ? { name: user.name, phone: user.phone ?? "", addresses: addresses.map((a) => ({ id: a.id, label: a.label, areaId: a.areaId, line: a.line, landmark: a.landmark, phone: a.phone })) } : null}
      />
    </div>
  )
}
