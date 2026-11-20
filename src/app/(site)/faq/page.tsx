import { PageBanner } from "@/components/site/chrome"
import { db } from "@/lib/db"

export default async function FaqPage() {
  const faqs = await db.faq.findMany({ where: { storeId: null }, orderBy: { sort: "asc" } })
  return (
    <div>
      <PageBanner title="FAQ" crumb="FAQ" />
      <div className="site-wrap max-w-3xl space-y-3 py-14">
        {faqs.map((faq) => (
          <details key={faq.id} className="rounded-2xl border px-5 py-4" open>
            <summary className="cursor-pointer text-lg font-extrabold">{faq.question}</summary>
            <p className="pt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
