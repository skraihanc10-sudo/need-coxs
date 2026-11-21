import Link from "next/link"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { StatusPill } from "@/components/bits"
import { taka } from "@/lib/format"

export default async function VendorJobs() {
  const user = await requireUser(["STORE"], "/vendor")
  const jobs = await db.serviceBooking.findMany({
    where: { storeId: user.store!.id },
    include: { customer: true, offering: true },
    orderBy: { createdAt: "desc" },
  })
  return (
    <div className="px-4 py-5">
      <h1 className="text-2xl font-extrabold">Service jobs</h1>
      <p className="text-sm text-muted-foreground">{user.store!.name}</p>
      <div className="mt-4 space-y-2">
        {!jobs.length ? <p className="text-sm text-muted-foreground">No service bookings yet. Laundry orders stay under Laundry.</p> : null}
        {jobs.map((job) => (
          <Link key={job.id} href={`/vendor/jobs/${job.code}`} className="flex items-center justify-between rounded-2xl border px-3 py-3">
            <span>
              <span className="block font-bold">{job.offering.name}</span>
              <span className="text-xs text-muted-foreground">{job.code} · {job.customer.name}</span>
            </span>
            <span className="text-right">
              <StatusPill status={job.status} locale="en" />
              <span className="mt-1 block text-xs">{job.price ? taka(job.price) : job.quoteAmount ? taka(job.quoteAmount) : "Quote"}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
