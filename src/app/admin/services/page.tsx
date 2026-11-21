import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { named, pick } from "@/lib/i18n"
import type { Locale } from "@/lib/format"
import { taka } from "@/lib/format"
import { PRICING, PRICING_TEXT, unitLabel } from "@/lib/pricing"
import { saveCategoryAction, saveOfferingAction, toggleCategoryAction, toggleOfferingAction } from "@/actions/admin"
import { ActionForm, SubmitButton } from "@/components/forms"
import { PageHeader, Section } from "@/components/bits"
import { CategoryIcon, ICON_NAMES } from "@/components/category-icon"

const FLOWS = { STANDARD: ["সাধারণ ভিজিট", "Standard visit"], LAUNDRY: ["লন্ড্রি (পিকআপ-ডেলিভারি)", "Laundry (pickup & delivery)"], TEAM: ["টিম (রুম × দিন)", "Team (rooms × days)"], CUSTOM: ["কাস্টম (কাজ লিখুন)", "Custom (describe the job)"] }

export default async function ServicesAdminPage() {
  const [, locale] = await Promise.all([requireUser(["ADMIN"], "/admin/services"), getLocale()])
  const categories = await db.serviceCategory.findMany({ orderBy: { sort: "asc" }, include: { offerings: { orderBy: { sort: "asc" } }, _count: { select: { bookings: true } } } })
  const bn = locale === "bn"

  return (
    <div className="space-y-4">
      <PageHeader title={pick(locale, "সেবা ও দাম", "Services & prices")} sub={pick(locale, "ক্যাটাগরি আর সাব-সার্ভিস এখান থেকে যোগ, এডিট বা বন্ধ করুন। বন্ধ করলে কাস্টমার দেখবে না, পুরনো বুকিং থাকবে।", "Add, edit or switch off categories and sub-services. Switched-off items hide from customers; old bookings stay.")} />
      {categories.map((c) => (
        <details key={c.id} className={`card group p-4 ${c.active ? "" : "opacity-60"}`}>
          <summary className="flex cursor-pointer list-none items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand"><CategoryIcon name={c.icon} className="size-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-extrabold text-ink">{named(locale, c)} <span className="text-xs font-semibold text-muted-foreground">· {bn ? FLOWS[c.flow as keyof typeof FLOWS]?.[0] : FLOWS[c.flow as keyof typeof FLOWS]?.[1]} · {c.offerings.length} {pick(locale, "সাব-সার্ভিস", "sub-services")} · {c._count.bookings} {pick(locale, "বুকিং", "bookings")}</span></span>
            </span>
            <form action={toggleCategoryAction}><input type="hidden" name="id" value={c.id} /><button className={`pill ${c.active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"}`}>{c.active ? pick(locale, "চালু", "On") : pick(locale, "বন্ধ", "Off")}</button></form>
          </summary>
          <div className="mt-4 space-y-4">
            <ActionForm action={saveCategoryAction} resetOnSuccess={false}>
              <CategoryFields c={c} locale={locale} count={categories.length} />
              <SubmitButton className="btn-soft mt-2 h-10 px-4 text-sm">{pick(locale, "ক্যাটাগরি সেভ", "Save category")}</SubmitButton>
            </ActionForm>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>{pick(locale, "সাব-সার্ভিস", "Sub-service")}</th><th>{pick(locale, "দামের ধরন", "Pricing")}</th><th>{pick(locale, "দাম", "Price")}</th><th>{pick(locale, "সর্বনিম্ন", "Min")}</th><th>{pick(locale, "সময় (মিনিট)", "Minutes")}</th><th></th></tr></thead>
                <tbody>
                  {c.offerings.map((o) => (
                    <tr key={o.id} className={o.active ? "" : "opacity-50"}>
                      <td colSpan={5}>
                        <ActionForm action={saveOfferingAction} resetOnSuccess={false} className="grid gap-2 md:grid-cols-[1fr_1fr_120px_150px_90px_80px_90px_auto]">
                          <input type="hidden" name="id" value={o.id} />
                          <input type="hidden" name="categoryId" value={c.id} />
                          <input type="hidden" name="slug" value={o.slug} />
                          <input type="hidden" name="sort" value={o.sort} />
                          <input name="nameBn" defaultValue={o.nameBn} className="field h-9 text-sm" required />
                          <input name="name" defaultValue={o.name} className="field h-9 text-sm" required />
                          <input name="detailBn" defaultValue={o.detailBn} className="field h-9 text-sm md:hidden" placeholder="বিবরণ" />
                          <select name="pricing" defaultValue={o.pricing} className="field h-9 text-sm">{PRICING.map((p) => <option key={p} value={p}>{PRICING_TEXT[p][locale]}</option>)}</select>
                          <input name="price" type="number" defaultValue={o.price} className="field h-9 text-sm" min={0} />
                          <input name="minQty" type="number" defaultValue={o.minQty} className="field h-9 text-sm" min={1} />
                          <input name="durationMin" type="number" defaultValue={o.durationMin} className="field h-9 text-sm" min={10} />
                          <SubmitButton className="btn-soft h-9 px-3 text-xs">{pick(locale, "সেভ", "Save")}</SubmitButton>
                          <input name="detailBn" defaultValue={o.detailBn} className="field hidden h-9 text-sm md:col-span-4 md:block" placeholder={pick(locale, "বাংলা বিবরণ", "Bangla detail")} />
                          <input name="detail" defaultValue={o.detail} className="field h-9 text-sm md:col-span-4" placeholder={pick(locale, "ইংরেজি বিবরণ", "English detail")} />
                        </ActionForm>
                      </td>
                      <td className="text-right">
                        <form action={toggleOfferingAction}><input type="hidden" name="id" value={o.id} /><button className="text-xs font-bold text-muted-foreground hover:text-ink">{o.active ? pick(locale, "বন্ধ", "Off") : pick(locale, "চালু", "On")}</button></form>
                        <p className="mt-1 text-[10px] text-muted-foreground">{taka(o.price, locale)}/{unitLabel(o.pricing, locale)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ActionForm action={saveOfferingAction} className="grid gap-2 rounded-xl bg-canvas p-3 md:grid-cols-[1fr_1fr_120px_150px_90px_90px_auto]">
              <input type="hidden" name="categoryId" value={c.id} />
              <input type="hidden" name="sort" value={c.offerings.length} />
              <input name="nameBn" className="field h-9 text-sm" placeholder={pick(locale, "নতুন সাব-সার্ভিস (বাংলা)", "New sub-service (Bangla)")} required />
              <input name="name" className="field h-9 text-sm" placeholder="English name" required />
              <input name="slug" className="field h-9 text-sm" placeholder="slug" required pattern="[a-z0-9-]{2,40}" />
              <select name="pricing" defaultValue="FIXED" className="field h-9 text-sm">{PRICING.map((p) => <option key={p} value={p}>{PRICING_TEXT[p][locale]}</option>)}</select>
              <input name="price" type="number" className="field h-9 text-sm" placeholder="৳" min={0} required />
              <input name="durationMin" type="number" className="field h-9 text-sm" placeholder="min" defaultValue={60} />
              <SubmitButton className="btn-primary h-9 px-3 text-xs">{pick(locale, "যোগ", "Add")}</SubmitButton>
            </ActionForm>
          </div>
        </details>
      ))}
      <Section title={pick(locale, "নতুন ক্যাটাগরি", "New category")}>
        <ActionForm action={saveCategoryAction}>
          <CategoryFields locale={locale} count={categories.length} />
          <SubmitButton className="btn-primary mt-3 h-10 px-4 text-sm">{pick(locale, "ক্যাটাগরি যোগ করুন", "Add category")}</SubmitButton>
        </ActionForm>
      </Section>
    </div>
  )
}

function CategoryFields({ c, locale, count }: { c?: { id: string; nameBn: string; name: string; slug: string; flow: string; blurbBn: string; blurb: string; icon: string; sort: number }; locale: Locale; count: number }) {
  const bn = locale === "bn"
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {c ? <input type="hidden" name="id" value={c.id} /> : null}
      <input name="nameBn" defaultValue={c?.nameBn} className="field h-10" placeholder={pick(locale, "বাংলা নাম", "Bangla name")} required />
      <input name="name" defaultValue={c?.name} className="field h-10" placeholder={pick(locale, "ইংরেজি নাম", "English name")} required />
      <input name="slug" defaultValue={c?.slug} className="field h-10" placeholder="slug (a-z, -)" required pattern="[a-z0-9-]{2,40}" />
      <select name="flow" defaultValue={c?.flow ?? "STANDARD"} className="field h-10">{Object.entries(FLOWS).map(([k, v]) => <option key={k} value={k}>{bn ? v[0] : v[1]}</option>)}</select>
      <input name="blurbBn" defaultValue={c?.blurbBn} className="field h-10" placeholder={pick(locale, "বাংলা এক লাইন", "Bangla one-liner")} />
      <input name="blurb" defaultValue={c?.blurb} className="field h-10" placeholder={pick(locale, "ইংরেজি এক লাইন", "English one-liner")} />
      <select name="icon" defaultValue={c?.icon ?? "spark"} className="field h-10">{ICON_NAMES.map((i) => <option key={i} value={i}>{i}</option>)}</select>
      <input name="sort" type="number" defaultValue={c?.sort ?? count} className="field h-10" placeholder={pick(locale, "ক্রম", "Order")} />
      <label className="text-xs text-muted-foreground sm:col-span-2">{pick(locale, "ছবি বা আইকন ফাইল (ঐচ্ছিক)", "Image or icon file (optional)")} <input type="file" name="imageFile" accept="image/*" className="ml-2 text-xs" /></label>
    </div>
  )
}
