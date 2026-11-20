import Link from "next/link"
import { PageBanner } from "@/components/site/chrome"

const steps = [
  ["Schedule in the app", "Open a laundry, switch Men, Women, Kids, or Other, and tap a cloth. A sheet asks wash only, iron only, wash & iron, or dry clean, each with its own price."],
  ["Review the bag", "Apply a promo code on the review step. WELCOME100 takes ৳100 off bags over ৳500."],
  ["Two time tabs", "Pickup and delivery are separate. Pick a date chip and a slot the shop still has room for."],
  ["Pay on return", "Cash on delivery is collected by the rider. bKash, SSLCommerz, and card stay on the payment step until their keys are set."],
  ["The shop accepts", "The laundry can accept, reject, or assign a rider. You see the status change on the order."],
  ["Rider closes it", "Mark picked up, then later mark delivered. The admin desk records commission when it is completed."],
]

export default function HowPage() {
  return (
    <div>
      <PageBanner title="How it works" crumb="How it works" />
      <ol className="site-wrap space-y-4 py-14">
        {steps.map(([title, body], index) => (
          <li key={title} className="grid gap-4 rounded-[28px] border p-6 md:grid-cols-[80px_1fr]">
            <p className="text-3xl font-extrabold text-[var(--brand)]">{String(index + 1).padStart(2, "0")}</p>
            <div>
              <h2 className="text-xl font-extrabold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="site-wrap pb-16">
        <Link href="/app" className="inline-flex h-12 items-center rounded-full bg-primary px-6 font-extrabold text-primary-foreground">Start a booking</Link>
      </div>
    </div>
  )
}
