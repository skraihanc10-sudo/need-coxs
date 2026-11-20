import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, ErrorNote } from "@/components/bits"
import { deleteSlot, saveSlot, toggleSlot } from "@/actions/vendor"

export default async function SlotsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["STORE"], "/vendor/slots")
  const sp = await searchParams
  const slots = await db.timeSlot.findMany({ where: { storeId: user.store!.id }, orderBy: { startTime: "asc" } })
  return (
    <div>
      <PageHeader title="Time slots" back="/vendor/account" />
      <ErrorNote message={sp.error} />
      <div className="space-y-2 px-4">
        {slots.map((slot) => (
          <div key={slot.id} className="flex items-center justify-between rounded-2xl border px-3 py-3">
            <span className={slot.active ? "" : "text-muted-foreground"}>{slot.label}</span>
            <span className="flex gap-3 text-sm font-bold">
              <form action={toggleSlot}><input type="hidden" name="id" value={slot.id} /><button>{slot.active ? "Pause" : "On"}</button></form>
              <form action={deleteSlot}><input type="hidden" name="id" value={slot.id} /><button className="text-rose-600">Delete</button></form>
            </span>
          </div>
        ))}
      </div>
      <form action={saveSlot} className="mt-4 grid grid-cols-2 gap-2 px-4 pb-8">
        <input name="label" placeholder="17:00–19:00" className="col-span-2 h-11 rounded-xl border px-3" required />
        <input name="start" placeholder="17:00" className="h-11 rounded-xl border px-3" required />
        <input name="end" placeholder="19:00" className="h-11 rounded-xl border px-3" required />
        <input name="capacity" type="number" defaultValue={8} className="h-11 rounded-xl border px-3" />
        <button className="pill bg-primary text-primary-foreground">Add slot</button>
      </form>
    </div>
  )
}
