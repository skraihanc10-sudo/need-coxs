import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/bits"
import { deleteStoreCategory, saveStoreCategory } from "@/actions/vendor"

export default async function CategoriesPage() {
  const user = await requireUser(["STORE"], "/vendor/categories")
  const rows = await db.storeCategory.findMany({ where: { storeId: user.store!.id } })
  return (
    <div>
      <PageHeader title="Categories" back="/vendor/account" />
      <div className="space-y-2 px-4">
        {rows.map((row) => (
          <div key={row.id} className="flex justify-between rounded-2xl border px-3 py-3">
            <span>{row.name}</span>
            <form action={deleteStoreCategory}><input type="hidden" name="id" value={row.id} /><button className="text-sm text-rose-600">Delete</button></form>
          </div>
        ))}
      </div>
      <form action={saveStoreCategory} className="mt-4 flex gap-2 px-4">
        <input name="name" required placeholder="Category" className="h-11 flex-1 rounded-xl border px-3" />
        <button className="pill bg-primary px-4 text-primary-foreground">Add</button>
      </form>
    </div>
  )
}
