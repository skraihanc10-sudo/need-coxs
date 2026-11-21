import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { ErrorNote, StatusPill } from "@/components/bits"
import { taka } from "@/lib/format"
import { providerJobAction } from "@/actions/marketplace"
import { SERVICE_NEXT } from "@/lib/marketplace"

export default async function VendorJob({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["STORE"], "/vendor")
  const { code } = await params
  const { error } = await searchParams
  const job = await db.serviceBooking.findUnique({
    where: { code },
    include: { customer: true, offering: true, area: true, worker: { include: { user: true } }, events: { orderBy: { createdAt: "asc" } } },
  })
  if (!job || job.storeId !== user.store!.id) notFound()
  const workers = await db.deliveryProfile.findMany({ where: { storeId: user.store!.id }, include: { user: true } })
  const next = SERVICE_NEXT[job.status] ?? []
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
      {job.rooms ? <p className="text-sm">Rooms {job.rooms} · team {job.teamSize} · {job.days} days</p> : null}
      {job.notes ? <p className="mt-2 text-sm">{job.notes}</p> : null}
      <p className="mt-2 font-extrabold">{job.pricing === "QUOTE" && job.status === "REQUESTED" ? "Needs a quote" : taka(job.quoteAmount && !job.price ? job.quoteAmount : job.price)} · {job.paymentMethod}</p>
      {job.worker ? <p className="text-sm">Assigned: {job.worker.user.name} ({job.worker.trade})</p> : null}
      {job.status === "REQUESTED" && job.pricing === "QUOTE" ? (
        <form action={providerJobAction} className="mt-4 flex gap-2">
          <input type="hidden" name="code" value={job.code} />
          <input type="hidden" name="intent" value="quote" />
          <input name="amount" type="number" min={1} required placeholder="Quote ৳" className="h-12 flex-1 rounded-xl border px-3" />
          <button type="submit" className="pill bg-primary px-4 text-primary-foreground">Send quote</button>
        </form>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {next.filter((status) => status !== "QUOTED").map((status) => (
          <form key={status} action={providerJobAction}>
            <input type="hidden" name="code" value={job.code} />
            <input type="hidden" name="intent" value={status} />
            <button type="submit" className="rounded-full border px-3 py-2 text-sm font-bold">{status.replaceAll("_", " ")}</button>
          </form>
        ))}
      </div>
      {workers.length && !["COMPLETED", "CANCELLED", "REQUESTED"].includes(job.status) ? (
        <form action={providerJobAction} className="mt-4 flex gap-2">
          <input type="hidden" name="code" value={job.code} />
          <input type="hidden" name="intent" value="assign" />
          <select name="workerId" className="h-12 flex-1 rounded-xl border px-2 text-sm">
            {workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.user.name} · {worker.trade}</option>)}
          </select>
          <button type="submit" className="pill bg-primary px-4 text-primary-foreground">Assign</button>
        </form>
      ) : null}
      <ol className="mt-4 space-y-1 text-xs text-muted-foreground">
        {job.events.map((event) => <li key={event.id}>{event.status} — {event.note}</li>)}
      </ol>
    </div>
  )
}
