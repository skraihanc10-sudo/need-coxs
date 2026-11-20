import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, ErrorNote } from "@/components/bits"
import { savePrice } from "@/actions/vendor"
import { AUDIENCES } from "@/lib/status"

export default async function PricesPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const user = await requireUser(["STORE"], "/vendor/prices")
  const sp = await searchParams
  const [items, kinds, prices] = await Promise.all([
    db.item.findMany({ where: { active: true }, orderBy: [{ audience: "asc" }, { sort: "asc" }] }),
    db.kind.findMany({ orderBy: { sort: "asc" } }),
    db.price.findMany({ where: { storeId: user.store!.id } }),
  ])
  const map = new Map(prices.map((price) => [`${price.itemId}:${price.kindId}`, price.amount]))
  return (
    <div>
      <PageHeader title="Prices" />
      <ErrorNote message={sp.error} />
      {sp.ok ? <p className="px-4 text-sm text-emerald-700">Saved.</p> : null}
      <div className="space-y-4 px-4 pb-8">
        {[...AUDIENCES, { id: "BULK" as const, en: "By the kilo", bn: "কেজি" }].map((group) => (
          <section key={group.id}>
            <h2 className="font-extrabold">{group.en}</h2>
            {items.filter((item) => item.audience === group.id).map((item) => (
              <div key={item.id} className="mt-2 rounded-2xl border p-3">
                <p className="font-bold">{item.name}</p>
                {kinds.map((kind) => (
                  <form key={kind.id} action={savePrice} className="mt-2 flex items-center gap-2">
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="kindId" value={kind.id} />
                    <span className="w-28 text-xs">{kind.name}</span>
                    <input name="amount" type="number" min={0} defaultValue={map.get(`${item.id}:${kind.id}`) ?? ""} placeholder="৳" className="h-10 w-24 rounded-xl border px-2" />
                    <button className="text-sm font-bold text-[var(--brand)]">Save</button>
                  </form>
                ))}
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
