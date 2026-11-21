import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { listBookings } from "@/lib/office"
import { pick } from "@/lib/i18n"
import { PageHeader } from "@/components/bits"
import { BookingTable } from "@/components/booking/table"
import { BookingFilters } from "@/components/booking/filters"

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const [sp, , locale] = await Promise.all([searchParams, requireUser(["ADMIN"], "/admin/bookings"), getLocale()])
  const [rows, categories, areas] = await Promise.all([listBookings(sp), db.serviceCategory.findMany({ orderBy: { sort: "asc" } }), db.serviceArea.findMany({ orderBy: { sort: "asc" } })])
  return (
    <div>
      <PageHeader title={pick(locale, "বুকিং", "Bookings")} sub={pick(locale, `${rows.length}টা দেখানো হচ্ছে`, `${rows.length} shown`)} />
      <BookingFilters locale={locale} values={sp} categories={categories} areas={areas} base="/admin/bookings" />
      <BookingTable rows={rows} locale={locale} base="/admin/bookings" />
    </div>
  )
}
