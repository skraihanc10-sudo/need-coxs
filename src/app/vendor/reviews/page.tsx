import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/bits"

export default async function ReviewsPage() {
  const user = await requireUser(["STORE"], "/vendor/reviews")
  const reviews = await db.review.findMany({
    where: { storeId: user.store!.id },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  })
  return (
    <div>
      <PageHeader title="Reviews" back="/vendor/account" />
      <div className="space-y-3 px-4">
        {reviews.map((review) => (
          <article key={review.id}>
            <p className="font-bold">{review.customer.name} · ★ {review.rating}</p>
            <p className="text-sm">{review.comment}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
