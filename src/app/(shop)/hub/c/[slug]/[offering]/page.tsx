import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getLocale } from "@/lib/auth"
import { PageHeader, ErrorNote } from "@/components/bits"
import { upcomingDays, taka } from "@/lib/format"
import { VISIT_SLOTS } from "@/lib/marketplace"
import { createBookingAction } from "@/actions/marketplace"

export default async function BookServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; offering: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { slug, offering: offeringSlug } = await params
  const { error } = await searchParams
  const locale = await getLocale()
  const bn = locale === "bn"
  const offering = await db.serviceOffering.findFirst({
    where: { slug: offeringSlug, category: { slug } },
    include: { category: true },
  })
  if (!offering || offering.category.laundry) notFound()
  const [areas, providers] = await Promise.all([
    db.serviceArea.findMany({ where: { active: true }, orderBy: { sort: "asc" } }),
    db.store.findMany({
      where: { status: "APPROVED", providerCategories: { some: { categoryId: offering.categoryId } } },
      include: { providerAreas: true },
      orderBy: { name: "asc" },
    }),
  ])
  if (!providers.length) redirect(`/hub/c/${slug}`)
  const days = upcomingDays(14)
  const back = `/hub/c/${slug}/${offering.slug}`
  return (
    <div className="pb-8">
      <PageHeader title={bn ? offering.nameBn : offering.name} back={`/hub/c/${slug}`} />
      <ErrorNote message={error} />
      <p className="px-4 text-sm text-muted-foreground">{bn ? offering.detailBn : offering.detail}</p>
      <p className="px-4 pt-1 font-extrabold">
        {offering.pricing === "QUOTE" ? (bn ? "ভিজিটে দাম" : "Quote on visit") : taka(offering.price, locale)}
      </p>
      <form action={createBookingAction} className="mt-4 space-y-3 px-4">
        <input type="hidden" name="offeringId" value={offering.id} />
        <input type="hidden" name="back" value={back} />
        <label className="block text-sm font-bold">
          {bn ? "প্রোভাইডার" : "Provider"}
          <select name="storeId" required className="mt-1 h-12 w-full rounded-xl border px-3 font-normal">
            {providers.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} · {store.providerAreas.length} {bn ? "এলাকা" : "areas"}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold">
          {bn ? "এলাকা" : "Area"}
          <select name="areaId" required className="mt-1 h-12 w-full rounded-xl border px-3 font-normal">
            {areas.map((area) => (
              <option key={area.id} value={area.id}>{bn ? area.nameBn : area.name}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold">
          {bn ? "ঠিকানা" : "Address"}
          <input name="addressLine" required minLength={4} className="mt-1 h-12 w-full rounded-xl border px-3 font-normal" placeholder={bn ? "হোটেল, বাড়ি, রোড" : "Hotel, house, road"} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm font-bold">
            {bn ? "ম্যাপ পিন (ঐচ্ছিক)" : "Map pin (optional)"}
            <input name="lat" inputMode="decimal" className="mt-1 h-12 w-full rounded-xl border px-3 font-normal" placeholder="21.427" />
          </label>
          <label className="block text-sm font-bold">
            &nbsp;
            <input name="lng" inputMode="decimal" className="mt-1 h-12 w-full rounded-xl border px-3 font-normal" placeholder="91.980" />
          </label>
        </div>
        <label className="block text-sm font-bold">
          {bn ? "তারিখ" : "Date"}
          <select name="visitDate" required className="mt-1 h-12 w-full rounded-xl border px-3 font-normal">
            {days.map((day) => <option key={day}>{day}</option>)}
          </select>
        </label>
        <label className="block text-sm font-bold">
          {bn ? "সময়" : "Time"}
          <select name="visitSlot" required className="mt-1 h-12 w-full rounded-xl border px-3 font-normal">
            {VISIT_SLOTS.map((slot) => <option key={slot}>{slot}</option>)}
          </select>
        </label>
        {offering.bulk ? (
          <div className="grid grid-cols-3 gap-2">
            <label className="text-sm font-bold">{bn ? "রুম" : "Rooms"}<input name="rooms" type="number" min={1} defaultValue={offering.slug === "resort-team" ? 20 : 1} className="mt-1 h-12 w-full rounded-xl border px-2 font-normal" /></label>
            <label className="text-sm font-bold">{bn ? "দল" : "Team"}<input name="teamSize" type="number" min={1} defaultValue={6} className="mt-1 h-12 w-full rounded-xl border px-2 font-normal" /></label>
            <label className="text-sm font-bold">{bn ? "দিন" : "Days"}<input name="days" type="number" min={1} defaultValue={2} className="mt-1 h-12 w-full rounded-xl border px-2 font-normal" /></label>
          </div>
        ) : null}
        <label className="block text-sm font-bold">
          {bn ? "নোট" : "Notes"}
          <textarea name="notes" rows={3} className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" placeholder={bn ? "গেট, ফ্লোর, কী ভাঙা" : "Gate, floor, what is broken"} />
        </label>
        <label className="block text-sm font-bold">
          {bn ? "ছবির লিংক (ঐচ্ছিক)" : "Photo link (optional)"}
          <input name="photos" className="mt-1 h-12 w-full rounded-xl border px-3 font-normal" placeholder="https://" />
        </label>
        <fieldset>
          <legend className="text-sm font-bold">{bn ? "পেমেন্ট" : "Payment"}</legend>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            {[["CASH", bn ? "ক্যাশ" : "Cash"], ["BKASH", "bKash"], ["NAGAD", "Nagad"]].map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 rounded-xl border px-2 py-3">
                <input type="radio" name="paymentMethod" value={value} defaultChecked={value === "CASH"} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="pill w-full bg-primary text-primary-foreground">{bn ? "বুক করুন" : "Request booking"}</button>
      </form>
      <p className="px-4 pt-3 text-xs text-muted-foreground">
        <Link href="/login?next=/hub">{bn ? "লগইন না থাকলে সাইন ইন করতে বলবে।" : "You will be asked to sign in if you are not."}</Link>
      </p>
    </div>
  )
}
