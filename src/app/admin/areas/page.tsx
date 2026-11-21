import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { saveAreaAction, toggleAreaAction } from "@/actions/marketplace"

export default async function AdminAreas({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser(["ADMIN"], "/admin")
  const { error } = await searchParams
  const areas = await db.serviceArea.findMany({ orderBy: { sort: "asc" }, include: { _count: { select: { providers: true, bookings: true } } } })
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Cox&apos;s Bazar areas</h1>
      {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
      <form action={saveAreaAction} className="mt-4 flex flex-wrap gap-2">
        <input name="name" placeholder="Area name" className="h-11 rounded-xl border px-3" required />
        <input name="nameBn" placeholder="বাংলা" className="h-11 rounded-xl border px-3" />
        <button className="pill bg-primary px-4 text-primary-foreground">Add area</button>
      </form>
      <ul className="mt-4 space-y-2">
        {areas.map((area) => (
          <li key={area.id} className="flex items-center justify-between rounded-2xl border px-3 py-3">
            <span>
              <span className="font-bold">{area.name}</span>
              <span className="ml-2 text-sm text-muted-foreground">{area.nameBn} · {area._count.providers} providers · {area._count.bookings} bookings</span>
            </span>
            <form action={toggleAreaAction}>
              <input type="hidden" name="id" value={area.id} />
              <button className="text-sm font-bold">{area.active ? "Hide" : "Show"}</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  )
}
