import { PageBanner } from "@/components/site/chrome"
import { db } from "@/lib/db"

export default async function FaqPage() {
  const faqs = await db.faq.findMany({ where: { storeId: null }, orderBy: { sort: "asc" } })
  const padded = faqs.length >= 6 ? faqs : [
    ...faqs,
    { id: "a", question: "How do I book?", answer: "Open the app, pick a service in Cox's Bazar, choose an area and a time. Laundry still uses the clothes desk." },
    { id: "b", question: "How do I pay?", answer: "Cash, bKash, and Nagad are recorded on the visit. They are not charged online." },
    { id: "c", question: "Can I cancel?", answer: "Yes, until the visit is completed. Decline a quote if the price does not work." },
  ]
  return (
    <div>
      <PageBanner title="FAQ" crumbs={["Faq"]} />
      <section className="site-wrap grid gap-10 py-16 lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          <h2 className="max-w-md text-5xl">Frequency and questions?</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {padded.slice(0, 6).map((faq, index) => (
              <article key={faq.id}>
                <p className="text-sm font-bold text-[var(--pub-green)]">Q.{index + 1} {faq.question}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--pub-muted)]">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
        <img src="/marketing/svc-fold.jpg" alt="Folded laundry" className="h-80 w-full object-cover" />
      </section>
    </div>
  )
}
