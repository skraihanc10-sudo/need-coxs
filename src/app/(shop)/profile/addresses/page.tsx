import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { copy } from "@/lib/i18n"
import { PageHeader, ErrorNote } from "@/components/bits"
import { deleteAddress, saveAddress, setDefaultAddress } from "@/actions/shop"
import { mapsUrl } from "@/lib/format"
import { AreaPicker } from "@/components/area-picker"

export default async function AddressesPage({ searchParams }: { searchParams: Promise<{ error?: string; back?: string }> }) {
  const user = await requireUser(["CUSTOMER"], "/profile/addresses")
  const locale = await getLocale()
  const t = copy(locale)
  const sp = await searchParams
  const addresses = await db.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } })
  const back = sp.back || "/profile/addresses"
  return (
    <div>
      <PageHeader title={t.addresses} back="/profile" />
      <ErrorNote message={sp.error} />
      <div className="space-y-3 px-4">
        {addresses.map((address) => (
          <article key={address.id} className="rounded-2xl border p-3">
            <p className="text-xs font-extrabold text-[var(--accent-ink)]">{address.label}{address.isDefault ? " · default" : ""}</p>
            <p className="font-semibold">{address.line1}</p>
            <p className="text-sm text-muted-foreground">{address.area} · {address.phone}</p>
            <a className="text-sm font-bold text-[var(--brand)]" href={mapsUrl(address.lat, address.lng, `${address.line1} ${address.area}`)}>Map</a>
            <div className="mt-2 flex gap-2">
              {!address.isDefault ? (
                <form action={setDefaultAddress}>
                  <input type="hidden" name="id" value={address.id} />
                  <button className="text-sm font-bold">Make default</button>
                </form>
              ) : null}
              <form action={deleteAddress}>
                <input type="hidden" name="id" value={address.id} />
                <button className="text-sm font-bold text-rose-600">Delete</button>
              </form>
            </div>
          </article>
        ))}
      </div>
      <form action={saveAddress} className="mt-4 space-y-3 px-4 pb-8">
        <input type="hidden" name="back" value={back} />
        <div className="seg">
          {["Home", "Office", "Other"].map((label) => (
            <label key={label} className="px-1">
              <input type="radio" name="label" value={label} defaultChecked={label === "Home"} className="mr-1" />
              {label === "Home" ? t.home : label === "Office" ? t.office : t.otherLabel}
            </label>
          ))}
        </div>
        <input name="line1" required placeholder="House, road" className="h-12 w-full rounded-xl border px-3" />
        <AreaPicker />
        <input name="phone" defaultValue={user.phone} placeholder={t.phone} className="h-12 w-full rounded-xl border px-3" />
        <button className="pill w-full bg-primary text-primary-foreground">{t.addAddress}</button>
      </form>
    </div>
  )
}
