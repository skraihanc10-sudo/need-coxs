import Link from "next/link"
import { PageBanner } from "@/components/site/chrome"
import { plans } from "@/content/public"

export default function PricingPage() {
  return (
    <div>
      <PageBanner title="Price table" crumbs={["Pricing"]} />
      <div className="site-wrap grid gap-6 py-16 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className="border text-center" style={{ borderColor: plan.featured ? "var(--pub-green)" : "var(--pub-line)" }}>
            <div className="py-6 text-white" style={{ background: plan.featured ? "var(--pub-green)" : "var(--pub-navy)" }}>
              <h2 className="text-3xl">{plan.name}</h2>
              <p className="mt-2 text-4xl">{plan.price}<span className="text-base">{plan.unit}</span></p>
            </div>
            <ul className="space-y-3 px-6 py-6 text-sm">
              {plan.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
            <Link href={plan.href} className="pub-btn mb-6">Book now</Link>
          </article>
        ))}
      </div>
    </div>
  )
}
