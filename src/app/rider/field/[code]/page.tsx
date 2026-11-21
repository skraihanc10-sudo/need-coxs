import Link from "next/link"
import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { ErrorNote, StatusPill } from "@/components/bits"
import { taka } from "@/lib/format"
import { workerJobAction } from "@/actions/marketplace"
import { SERVICE_NEXT } from "@/lib/marketplace"

export default async function FieldJob({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["DELIVERY"], "/rider")
  const { code } = await params
  const { error } = await searchParams
  const job = await db.serviceBooking.findUnique({
    where: { code },
    include: { customer: true, store: true, offering: true, area: true },
  })
  if (!job || job.workerId !== user.rider?.id) notFound()
  const next = (SERVICE_NEXT[job.status] ?? []).filter((status) => ["ON_THE_WAY", "IN_PROGRESS", "COMPLETED"].includes(status))
  return (
    <div className="px-4 py-5">
      <ErrorNote message={error} />
      <div className="flex items-start justify-between">
        <h1 className="text-xl font-extrabold">{job.offering.name}</h1>
        <StatusPill status={job.status} locale="en" />
      </div>
      <p className="text-sm">{job.customer.name} · {job.customer.phone}</p>
      <p className="mt-2 text-sm">{job.addressLine}</p>
      <p className="text-sm text-muted-foreground">{job.area?.name} · {job.visitDate} · {job.visitSlot}</p>
      <p className="mt-2 text-sm">{job.store.name}</p>
      {job.notes ? <p className="mt-2 text-sm">{job.notes}</p> : null}
      <p className="mt-2 font-extrabold">{job.paymentMethod} · {job.price ? taka(job.price) : "Quote pending"}</p>
      <Link href={`/rider/chat/${job.code}`} className="mt-3 inline-block text-sm font-bold text-[var(--brand)]">Open job chat</Link>
      <div className="mt-4 space-y-2">
        {next.map((status) => (
          <form key={status} action={workerJobAction}>
            <input type="hidden" name="code" value={job.code} />
            <input type="hidden" name="status" value={status} />
            <button type="submit" className="pill w-full bg-primary text-primary-foreground">{status.replaceAll("_", " ")}</button>
          </form>
        ))}
      </div>
    </div>
  )
}
