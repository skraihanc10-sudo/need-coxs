import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, ErrorNote } from "@/components/bits"
import { deleteAttribute, saveAttribute } from "@/actions/vendor"

export default async function AttributesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["STORE"], "/vendor/attributes")
  const sp = await searchParams
  const rows = await db.productAttribute.findMany({ where: { storeId: user.store!.id } })
  return (
    <div>
      <PageHeader title="Attributes" back="/vendor/account" />
      <ErrorNote message={sp.error} />
      <div className="space-y-2 px-4">
        {rows.map((row) => (
          <div key={row.id} className="flex justify-between rounded-2xl border px-3 py-3 text-sm">
            <span>{row.name}: {row.value}</span>
            <form action={deleteAttribute}><input type="hidden" name="id" value={row.id} /><button className="text-rose-600">Delete</button></form>
          </div>
        ))}
      </div>
      <form action={saveAttribute} className="mt-4 grid gap-2 px-4">
        <input name="name" placeholder="Name, e.g. Finish" className="h-11 rounded-xl border px-3" />
        <input name="value" placeholder="Value, e.g. Hanger" className="h-11 rounded-xl border px-3" />
        <button className="pill bg-primary text-primary-foreground">Add attribute</button>
      </form>
    </div>
  )
}
