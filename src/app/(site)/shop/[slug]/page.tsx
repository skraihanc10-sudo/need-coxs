import Link from "next/link"
import { notFound } from "next/navigation"
import { PageBanner } from "@/components/site/chrome"
import { serviceBySlug } from "@/content/public"

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const service = serviceBySlug((await params).slug)
  if (!service) notFound()
  return (
    <div>
      <PageBanner title={service.title} crumbs={["Shop", service.title]} />
      <article className="site-wrap grid gap-8 py-14 md:grid-cols-2">
        <img src={service.image} alt="" className="h-[420px] w-full object-cover" />
        <div>
          <p className="text-3xl font-extrabold text-[var(--pub-green)]">{service.price} <span className="text-base font-semibold text-[var(--pub-muted)]">{service.unit}</span></p>
          <p className="mt-4 text-sm leading-7">{service.body}</p>
          <Link href="/app" className="pub-btn mt-6">Book now</Link>
        </div>
      </article>
    </div>
  )
}
