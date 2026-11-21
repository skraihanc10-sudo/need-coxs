import Link from "next/link"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { StatusPill } from "@/components/bits"
import { taka } from "@/lib/format"
import { categoryStats } from "@/lib/marketplace"

export default async function AdminBookings() {
  await requireUser(["ADMIN"], "/admin")
  const [bookings, stats] = await Promise.all([
    db.serviceBooking.findMany({
      orderBy: { createdAt: "desc" },
      include: { customer: true, store: true, offering: true, category: true },
      take: 80,
    }),
    categoryStats(),
  ])
  const commission = stats.reduce((sum, row) => sum + row.commission, 0)
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Service bookings</h1>
      <p className="text-sm text-muted-foreground">Recorded commission on completed visits {taka(commission)}. Cash, bKash, and Nagad are recorded, not charged.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="py-2">Code</th>
              <th>Service</th>
              <th>Customer</th>
              <th>Provider</th>
              <th>Pay</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-t">
                <td className="py-2 font-bold">{booking.code}</td>
                <td>{booking.offering.name}</td>
                <td>{booking.customer.name}</td>
                <td><Link href="/admin/providers" className="font-bold text-[var(--brand)]">{booking.store.name}</Link></td>
                <td>{booking.paymentMethod}</td>
                <td><StatusPill status={booking.status} locale="en" /></td>
                <td>{booking.price ? taka(booking.price) : booking.quoteAmount ? taka(booking.quoteAmount) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
