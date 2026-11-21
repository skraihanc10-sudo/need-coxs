import { notFound } from "next/navigation"
import { requireUser, getLocale } from "@/lib/auth"
import { AppError } from "@/lib/errors"
import { bookingChat } from "@/lib/support"
import { replyTemplates, workerOptions } from "@/lib/office"
import { named } from "@/lib/i18n"
import { PageHeader, StatusPill } from "@/components/bits"
import { OfficeBooking } from "@/components/booking/office"

export default async function AdminBookingPage({ params }: { params: Promise<{ code: string }> }) {
  const [{ code }, user, locale] = await Promise.all([params, requireUser(["ADMIN"], "/admin/bookings"), getLocale()])
  let data
  try {
    data = await bookingChat(user, code)
  } catch (error) {
    if (error instanceof AppError) notFound()
    throw error
  }
  const { booking, thread } = data
  const [workers, templates] = await Promise.all([workerOptions(booking.categoryId, booking.areaId), replyTemplates()])
  return (
    <div>
      <PageHeader back="/admin/bookings" title={`${booking.code} · ${named(locale, booking.offering)}`} sub={named(locale, booking.category)} action={<StatusPill status={booking.status} locale={locale} className="mt-1" />} />
      <OfficeBooking booking={booking} locale={locale} me={user.id} isAdmin workers={workers} messages={thread.messages} templates={templates} />
    </div>
  )
}
