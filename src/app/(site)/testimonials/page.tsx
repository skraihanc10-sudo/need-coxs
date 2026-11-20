import { PageBanner } from "@/components/site/chrome"
import { db } from "@/lib/db"

const extras = [
  { name: "Farhana Islam", quote: "I priced a silk saree before I committed. Dry clean was dearer, and that was the point.", meta: "Banani · office order" },
  { name: "Tanvir Ahmed", quote: "The rider had the building pin and called from the gate. Cash at drop-off, no app wallet required.", meta: "Dhanmondi · family bag" },
]

export default async function TestimonialsPage() {
  const reviews = await db.review.findMany({ include: { customer: true, store: true }, orderBy: { createdAt: "desc" } })
  const stories = [
    ...reviews.map((review) => ({
      name: review.customer.name,
      quote: review.comment,
      meta: `${review.store.name} · ${"★".repeat(review.rating)}`,
    })),
    ...extras,
  ]
  return (
    <div>
      <PageBanner title="Stories" crumb="Stories" />
      <div className="site-wrap grid gap-4 py-14 md:grid-cols-2">
        {stories.map((story) => (
          <blockquote key={story.quote} className="surface-card p-6">
            <p className="text-lg leading-7">“{story.quote}”</p>
            <footer className="mt-4 font-extrabold">{story.name}</footer>
            <p className="text-sm text-muted-foreground">{story.meta}</p>
          </blockquote>
        ))}
      </div>
    </div>
  )
}
