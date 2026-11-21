import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { saveCategoryAction, saveOfferingAction } from "@/actions/marketplace"
import { taka } from "@/lib/format"

export default async function AdminCategories({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser(["ADMIN"], "/admin")
  const { error } = await searchParams
  const categories = await db.serviceCategory.findMany({
    orderBy: { sort: "asc" },
    include: { offerings: { orderBy: { sort: "asc" } }, _count: { select: { bookings: true, providers: true } } },
  })
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Categories</h1>
      {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
      <div className="mt-4 space-y-4">
        {categories.map((category) => (
          <section key={category.id} className="surface-card p-4">
            <form action={saveCategoryAction} className="grid gap-2 md:grid-cols-[1fr_1fr_120px_auto_auto]">
              <input type="hidden" name="id" value={category.id} />
              <input name="name" defaultValue={category.name} className="h-10 rounded-lg border px-2" />
              <input name="nameBn" defaultValue={category.nameBn} className="h-10 rounded-lg border px-2" />
              <input name="commissionRate" type="number" step="0.1" defaultValue={category.commissionRate} className="h-10 rounded-lg border px-2" aria-label="Commission percent" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={category.active} /> Active</label>
              <button className="rounded-full bg-primary px-3 text-sm font-bold text-primary-foreground">Save</button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">{category._count.providers} providers · {category._count.bookings} bookings · {category.laundry ? "Laundry desk" : "Visit booking"}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {category.offerings.map((offering) => (
                <li key={offering.id}>{offering.name} · {offering.pricing === "QUOTE" ? "Quote on visit" : taka(offering.price)}{offering.bulk ? " · team booking" : ""}</li>
              ))}
            </ul>
            <form action={saveOfferingAction} className="mt-3 grid gap-2 md:grid-cols-5">
              <input type="hidden" name="categoryId" value={category.id} />
              <input name="name" placeholder="New sub-service" className="h-10 rounded-lg border px-2" />
              <input name="nameBn" placeholder="বাংলা নাম" className="h-10 rounded-lg border px-2" />
              <select name="pricing" className="h-10 rounded-lg border px-2"><option value="FIXED">Fixed price</option><option value="QUOTE">Quote on visit</option></select>
              <input name="price" type="number" placeholder="৳" className="h-10 rounded-lg border px-2" />
              <button className="h-10 rounded-full border text-sm font-bold">Add service</button>
            </form>
          </section>
        ))}
      </div>
    </div>
  )
}
