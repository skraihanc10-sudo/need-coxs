import Link from "next/link"
import { PageBanner } from "@/components/site/chrome"
import { services } from "@/content/public"

export default function ServicesPage() {
  return (
    <div>
      <PageBanner title="Services" crumbs={["Services"]} />
      <div className="site-wrap grid gap-6 py-14 md:grid-cols-3">
        {services.map((service) => (
          <article key={service.slug} className="overflow-hidden bg-[#f6f8f8]">
            <img src={service.image} alt="" className="h-52 w-full object-cover" />
            <div className="p-5 text-center">
              <h2 className="text-2xl">{service.title}</h2>
              <p className="mt-2 text-sm text-[var(--pub-muted)]">{service.blurb}</p>
            </div>
            <Link href={`/services/${service.slug}`} className="flex items-center justify-between bg-[#eceff1] px-4 py-3 text-xs font-bold">
              {service.discount} <span>→</span>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
