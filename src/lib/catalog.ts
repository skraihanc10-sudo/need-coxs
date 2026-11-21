import { db } from "./db"

export async function activeCategories() {
  return db.serviceCategory.findMany({
    where: { active: true },
    orderBy: { sort: "asc" },
    include: { offerings: { where: { active: true }, orderBy: { sort: "asc" } } },
  })
}

export async function categoryBySlug(slug: string) {
  return db.serviceCategory.findFirst({
    where: { slug, active: true },
    include: { offerings: { where: { active: true }, orderBy: { sort: "asc" } } },
  })
}

export async function activeAreas() {
  return db.serviceArea.findMany({ where: { active: true }, orderBy: { sort: "asc" } })
}

export async function publishedReviews(take = 6) {
  return db.bookingReview.findMany({
    where: { published: true, rating: { gte: 4 } },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      customer: { select: { name: true } },
      booking: { select: { offering: { select: { name: true, nameBn: true } }, area: { select: { name: true, nameBn: true } } } },
    },
  })
}

export async function activeFaqs() {
  return db.faq.findMany({ where: { active: true }, orderBy: { sort: "asc" } })
}

/** Lowest "from" price in a category, for the grid cards. */
export function fromPrice(offerings: Array<{ price: number; pricing: string }>) {
  const priced = offerings.filter((o) => o.pricing !== "QUOTE" && o.price > 0)
  if (!priced.length) return null
  return Math.min(...priced.map((o) => o.price))
}
