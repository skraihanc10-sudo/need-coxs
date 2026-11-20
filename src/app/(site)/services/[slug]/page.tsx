import Link from "next/link"
import { notFound } from "next/navigation"
import { PageBanner } from "@/components/site/chrome"
import { serviceBySlug } from "@/content/public"

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = serviceBySlug(slug)
  if (!service) notFound()
  return (
    <div>
      <PageBanner title={service.title} crumbs={["Services", service.title]} />
      <article className="site-wrap grid items-start gap-10 py-14 md:grid-cols-2">
        <img src={service.image} alt="" className="h-[420px] w-full object-cover" />
        <div>
          <p className="text-sm font-bold text-[var(--pub-green)]">{service.discount}</p>
          <h2 className="mt-2 text-5xl">{service.price}</h2>
          <p className="text-sm text-[var(--pub-muted)]">{service.unit}</p>
          <p className="mt-4 text-sm leading-7">{service.body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/app" className="pub-btn">Book now</Link>
            <Link href="/contact" className="pub-btn" style={{ background: "var(--pub-navy)" }}>Request a quote</Link>
          </div>
        </div>
      </article>
    </div>
  )
}
