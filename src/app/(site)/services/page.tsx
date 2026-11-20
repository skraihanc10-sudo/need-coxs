import Link from "next/link"
import { PageBanner } from "@/components/site/chrome"
import { db } from "@/lib/db"

const blocks = [
  { title: "Wash only", body: "Machine wash and dry. Folded, not pressed. Priced per piece or per kilo depending on the shop.", href: "/c/wash" },
  { title: "Iron only", body: "For clothes you already washed. The shop presses them and hangs the shirts.", href: "/c/iron" },
  { title: "Wash and iron", body: "The everyday office order. Washed, then pressed. This is the default for shirts and panjabis.", href: "/c/both" },
  { title: "Dry clean", body: "Solvent clean for sarees, suits, and anything labelled do-not-wash. Each cloth has its own rate.", href: "/c/dry" },
]

export default async function ServicesPage() {
  const stores = await db.store.findMany({ where: { status: "APPROVED" }, orderBy: { rating: "desc" } })
  return (
    <div>
      <PageBanner title="Services" crumb="Services" />
      <div className="site-wrap grid gap-4 py-14 md:grid-cols-2">
        {blocks.map((block) => (
          <article key={block.title} className="surface-card p-6">
            <h2 className="text-2xl font-extrabold">{block.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{block.body}</p>
            <Link href={block.href} className="mt-4 inline-block font-bold text-[var(--brand)]">See which shops offer it</Link>
          </article>
        ))}
      </div>
      <section className="site-wrap pb-16">
        <h2 className="text-2xl font-extrabold">Shops on the desk</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {stores.map((store) => (
            <Link key={store.id} href={`/stores/${store.slug}`} className="rounded-2xl border p-4">
              <p className="font-extrabold">{store.name}</p>
              <p className="text-sm text-muted-foreground">{store.area} · ★ {store.rating.toFixed(1)} · {store.tagline}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
