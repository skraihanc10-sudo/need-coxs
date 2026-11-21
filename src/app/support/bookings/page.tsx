import { requireUser, getLocale } from "@/lib/auth"
import { listBookings } from "@/lib/office"
import { pick } from "@/lib/i18n"
import { PageHeader } from "@/components/bits"
import { BookingTable } from "@/components/booking/table"
import { BookingFilters } from "@/components/booking/filters"
import { db } from "@/lib/db"

export default async function SupportBookingsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const [sp, , locale] = await Promise.all([searchParams, requireUser(["SUPPORT", "ADMIN"], "/support/bookings"), getLocale()])
  const [rows, categories, areas] = await Promise.all([listBookings(sp), db.serviceCategory.findMany({ orderBy: { sort: "asc" } }), db.serviceArea.findMany({ orderBy: { sort: "asc" } })])
  return (
    <div>
      <PageHeader title={pick(locale, "বুকিং", "Bookings")} sub={pick(locale, `${rows.length}টা`, `${rows.length} shown`)} />
      <BookingFilters locale={locale} values={sp} categories={categories} areas={areas} base="/support/bookings" />
      <BookingTable rows={rows} locale={locale} base="/support/bookings" />
    </div>
  )
}
