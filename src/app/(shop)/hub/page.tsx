import Link from "next/link"
import { Search } from "lucide-react"
import { db } from "@/lib/db"
import { getLocale, getUser } from "@/lib/auth"
import { PageHeader } from "@/components/bits"
import { CategoryIcon } from "@/components/category-icon"

export default async function HubPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const locale = await getLocale()
  const bn = locale === "bn"
  const user = await getUser()
  const { q = "" } = await searchParams
  const query = q.trim().toLowerCase()
  const categories = await db.serviceCategory.findMany({
    where: { active: true },
    orderBy: { sort: "asc" },
    include: { offerings: { where: { active: true }, select: { price: true, pricing: true } } },
  })
  const list = categories.filter((category) => {
    if (!query) return true
    return `${category.name} ${category.nameBn} ${category.blurb} ${category.blurbBn}`.toLowerCase().includes(query)
  })
  return (
    <div className="pb-6">
      <PageHeader title={bn ? "কী দরকার?" : "What do you need?"} />
      <form action="/hub" className="px-4">
        <label className="flex items-center gap-2 rounded-2xl border bg-white px-3 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input name="q" defaultValue={q} placeholder={bn ? "ওয়াইফাই, ইলেকট্রিশিয়ান, পরিষ্কার…" : "WiFi, electrician, cleaning…"} className="w-full bg-transparent text-sm outline-none" />
        </label>
      </form>
      <p className="px-4 pt-4 text-sm text-muted-foreground">
        {user ? (bn ? `হ্যালো, ${user.name.split(" ")[0]}` : `Hello, ${user.name.split(" ")[0]}`) : bn ? "কক্সবাজারের সেবা" : "Services in Cox's Bazar"}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 px-4">
        {list.map((category) => {
          const priced = category.offerings.filter((item) => item.pricing === "FIXED" && item.price > 0)
          const from = priced.length ? Math.min(...priced.map((item) => item.price)) : 0
          return (
            <Link key={category.id} href={`/hub/c/${category.slug}`} className="surface-card overflow-hidden">
              <img src={category.cover || "/services/labour.svg"} alt="" className="h-24 w-full object-cover" />
              <div className="p-3">
                <span className="icon-chip"><CategoryIcon name={category.icon} className="size-4" /></span>
                <p className="mt-2 text-sm font-extrabold leading-5">{bn ? category.nameBn : category.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{from ? (bn ? `৳${from} থেকে` : `From ৳${from}`) : bn ? "ভিজিটে দাম" : "Quote on visit"}</p>
              </div>
            </Link>
          )
        })}
      </div>
      {!list.length ? <p className="px-4 pt-6 text-sm">{bn ? "এই নামে কোনো সেবা নেই।" : "No service matches that search."}</p> : null}
      <div className="mx-4 mt-5">
        <Link href="/orders" className="text-sm font-bold text-[var(--brand)]">{bn ? "আমার বুকিং" : "My bookings"}</Link>
      </div>
    </div>
  )
}
