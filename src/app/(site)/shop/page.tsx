import Link from "next/link"
import { PageBanner } from "@/components/site/chrome"
import { services } from "@/content/public"

export default function ShopPage() {
  return (
    <div>
      <PageBanner title="Shop" crumbs={["Shop"]} />
      <div className="site-wrap grid gap-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <article key={service.slug} className="border">
            <img src={service.image} alt="" className="h-44 w-full object-cover" />
            <div className="p-4">
              <h2 className="text-xl normal-case">{service.title}</h2>
              <p className="mt-1 font-extrabold text-[var(--pub-green)]">{service.price}</p>
              <Link href={`/shop/${service.slug}`} className="mt-3 inline-block text-sm font-bold">View</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
