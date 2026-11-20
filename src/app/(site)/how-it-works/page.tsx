import Link from "next/link"
import { PageBanner } from "@/components/site/chrome"
import { steps } from "@/content/public"

export default function HowPage() {
  return (
    <div>
      <PageBanner title="How we work" crumbs={["How it works"]} />
      <ol className="site-wrap grid gap-6 py-14 md:grid-cols-4">
        {steps.map((step) => (
          <li key={step.n} className="bg-[#f6f8f8] p-6 text-center">
            <p className="text-4xl text-[var(--pub-green)]">{step.n}</p>
            <h2 className="mt-2 text-2xl">{step.title}</h2>
            <p className="mt-2 text-sm text-[var(--pub-muted)]">{step.text}</p>
          </li>
        ))}
      </ol>
      <div className="site-wrap pb-14"><Link href="/app" className="pub-btn">Book now</Link></div>
    </div>
  )
}
