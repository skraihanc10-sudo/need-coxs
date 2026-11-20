import { PageBanner, Partners } from "@/components/site/chrome"
import { db } from "@/lib/db"

const extras = [
  ["Farhana Islam", "I checked the saree price before I booked dry clean."],
  ["Tanvir Ahmed", "Cash at the door. The rider had the building pin."],
  ["Lina Chowdhury", "School uniforms came back the next evening."],
  ["Rafi Ahmed", "The Bangla screens made it easy for my parents to track the bag."],
]

export default async function TestimonialsPage() {
  const reviews = await db.review.findMany({ include: { customer: true, store: true } })
  const cards = [
    ...reviews.map((review) => [review.customer.name, review.comment, review.store.name] as const),
    ...extras.map(([name, quote]) => [name, quote, "Need Cox's customer"] as const),
  ]
  return (
    <div>
      <PageBanner title="Testimonials" crumbs={["Testimonials"]} />
      <section className="site-wrap py-16">
        <p className="text-center text-sm font-bold text-[var(--pub-green)]">● What client says?</p>
        <h2 className="mt-2 text-center text-5xl">Our testimonials</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {cards.map(([name, quote, meta]) => (
            <article key={quote} className="relative bg-[#f4f7f8] p-6">
              <h3 className="text-2xl normal-case">{name}</h3>
              <p className="text-xs text-[var(--pub-muted)]">{meta}</p>
              <p className="mt-3 text-sm leading-6">{quote}</p>
              <span className="absolute top-4 right-4 text-5xl text-[#d5dde1]">”</span>
            </article>
          ))}
        </div>
      </section>
      <Partners />
    </div>
  )
}
