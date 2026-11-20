import { requireUser } from "@/lib/auth"
import { PageHeader, ErrorNote } from "@/components/bits"
import { updateStoreProfile } from "@/actions/vendor"

export default async function StoreProfile({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const user = await requireUser(["STORE"], "/vendor/profile")
  const store = user.store!
  const sp = await searchParams
  return (
    <div>
      <PageHeader title="Laundry profile" back="/vendor/account" />
      <ErrorNote message={sp.error} />
      {sp.ok ? <p className="px-4 text-sm text-emerald-700">Saved.</p> : null}
      <form action={updateStoreProfile} className="space-y-2 px-4 pb-8">
        {[
          ["name", store.name],
          ["tagline", store.tagline],
          ["phone", store.phone],
          ["area", store.area],
          ["address", store.address],
          ["openTime", store.openTime],
          ["closeTime", store.closeTime],
        ].map(([name, value]) => (
          <input key={name} name={name} defaultValue={value} className="h-11 w-full rounded-xl border px-3" />
        ))}
        <textarea name="about" defaultValue={store.about} className="min-h-24 w-full rounded-xl border px-3 py-2" />
        <input name="deliveryFee" type="number" defaultValue={store.deliveryFee} className="h-11 w-full rounded-xl border px-3" />
        <input name="minOrder" type="number" defaultValue={store.minOrder} className="h-11 w-full rounded-xl border px-3" />
        <button className="pill w-full bg-primary text-primary-foreground">Save</button>
      </form>
    </div>
  )
}
