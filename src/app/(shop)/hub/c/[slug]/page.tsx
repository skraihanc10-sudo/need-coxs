import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { getLocale } from "@/lib/auth"
import { PageHeader } from "@/components/bits"
import { CategoryIcon } from "@/components/category-icon"
import { taka } from "@/lib/format"

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const bn = locale === "bn"
  const category = await db.serviceCategory.findUnique({
    where: { slug },
    include: {
      offerings: { where: { active: true }, orderBy: { sort: "asc" } },
      providers: {
        where: { store: { status: "APPROVED" } },
        include: { store: { include: { providerAreas: { include: { area: true } } } } },
      },
    },
  })
  if (!category || !category.active) notFound()
  return (
    <div className="pb-8">
      <PageHeader title={bn ? category.nameBn : category.name} back="/hub" />
      <img src={category.cover || "/services/labour.svg"} alt="" className="h-40 w-full object-cover" />
      <div className="px-4 pt-4">
        <span className="icon-chip"><CategoryIcon name={category.icon} /></span>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{bn ? category.blurbBn : category.blurb}</p>
        {category.laundry ? (
          <Link href="/app" className="pill mt-4 flex items-center justify-center bg-primary text-primary-foreground">
            {bn ? "লন্ড্রি ডেস্ক খুলুন" : "Open the laundry desk"}
          </Link>
        ) : null}
      </div>
      <h2 className="px-4 pt-6 font-extrabold">{bn ? "সেবা" : "Services"}</h2>
      <div className="mt-2 space-y-2 px-4">
        {category.offerings.map((offering) => {
          const href = category.laundry ? "/app" : `/hub/c/${category.slug}/${offering.slug}`
          return (
            <Link key={offering.id} href={href} className="surface-card flex items-center justify-between gap-3 p-3">
              <span>
                <span className="block font-bold">{bn ? offering.nameBn : offering.name}</span>
                <span className="text-xs text-muted-foreground">{bn ? offering.detailBn : offering.detail}</span>
              </span>
              <span className="shrink-0 text-sm font-extrabold">
                {offering.pricing === "QUOTE" ? (bn ? "ভিজিটে দাম" : "Quote") : taka(offering.price, locale)}
              </span>
            </Link>
          )
        })}
      </div>
      <h2 className="px-4 pt-6 font-extrabold">{bn ? "প্রোভাইডার" : "Providers"}</h2>
      <div className="mt-2 space-y-2 px-4">
        {category.providers.map(({ store }) => (
          <div key={store.id} className="rounded-2xl border px-3 py-3">
            <p className="font-bold">{store.name}</p>
            <p className="text-xs text-muted-foreground">
              {store.providerType === "COMPANY" ? (bn ? "দল" : "Team") : bn ? "একজন" : "Individual"} · {store.teamSize} · {store.area}
            </p>
            <p className="mt-1 text-xs">{store.providerAreas.map((row) => (bn ? row.area.nameBn : row.area.name)).join(", ")}</p>
          </div>
        ))}
        {!category.providers.length ? <p className="text-sm text-muted-foreground">{bn ? "এখনো কেউ অনুমোদিত নয়।" : "No approved provider yet."}</p> : null}
      </div>
    </div>
  )
}
