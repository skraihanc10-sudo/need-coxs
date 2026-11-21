import { db } from "./db"
import { AppError } from "./errors"
import { upcomingDays } from "./format"

export const SERVICE_NEXT: Record<string, string[]> = {
  REQUESTED: ["QUOTED", "ACCEPTED", "CANCELLED"],
  QUOTED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["ON_THE_WAY", "CANCELLED"],
  ON_THE_WAY: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
}

export const VISIT_SLOTS = ["09:00–12:00", "12:00–15:00", "15:00–18:00", "18:00–21:00"]

const bookingInclude = {
  customer: true,
  store: true,
  category: true,
  offering: true,
  area: true,
  worker: { include: { user: true } },
  events: { orderBy: { createdAt: "asc" as const }, include: { actor: true } },
  review: true,
}

export type BookingInput = {
  customerId: string
  offeringId: string
  storeId: string
  areaId: string
  addressLine: string
  lat?: number | null
  lng?: number | null
  visitDate: string
  visitSlot: string
  notes: string
  photos: string
  paymentMethod: string
  rooms: number
  teamSize: number
  days: number
}

export async function createServiceBooking(input: BookingInput) {
  const offering = await db.serviceOffering.findUnique({
    where: { id: input.offeringId },
    include: { category: true },
  })
  if (!offering || !offering.active || !offering.category.active) throw new AppError("That service is not available.")
  if (offering.category.laundry) throw new AppError("Book laundry from the laundry desk.")
  if (!upcomingDays(14).includes(input.visitDate)) throw new AppError("Choose a visit date.")
  if (!VISIT_SLOTS.includes(input.visitSlot)) throw new AppError("Choose a time slot.")
  if (input.addressLine.trim().length < 4) throw new AppError("Add the address.")
  const method = input.paymentMethod
  if (!["CASH", "BKASH", "NAGAD"].includes(method)) throw new AppError("Choose cash, bKash, or Nagad.")

  const store = await db.store.findFirst({
    where: {
      id: input.storeId,
      status: "APPROVED",
      providerCategories: { some: { categoryId: offering.categoryId } },
      providerAreas: { some: { areaId: input.areaId } },
    },
  })
  if (!store) throw new AppError("That provider does not cover this area.")

  const rooms = offering.bulk ? Math.max(0, input.rooms) : 0
  const teamSize = offering.bulk ? Math.max(1, input.teamSize) : 1
  const days = offering.bulk ? Math.max(1, input.days) : 1
  if (offering.bulk && rooms < 1 && offering.slug === "resort-team") throw new AppError("Add the number of rooms.")

  const price = offering.pricing === "FIXED" ? offering.price : 0
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = `SVC-${Math.floor(10000 + Math.random() * 90000)}`
    try {
      return await db.serviceBooking.create({
        data: {
          code,
          customerId: input.customerId,
          storeId: store.id,
          categoryId: offering.categoryId,
          offeringId: offering.id,
          areaId: input.areaId,
          addressLine: input.addressLine.trim(),
          lat: input.lat ?? null,
          lng: input.lng ?? null,
          visitDate: input.visitDate,
          visitSlot: input.visitSlot,
          notes: input.notes.trim(),
          photos: input.photos.trim(),
          pricing: offering.pricing,
          price,
          rooms,
          teamSize,
          days,
          status: "REQUESTED",
          paymentMethod: method,
          paymentStatus: "UNPAID",
          commissionRate: offering.category.commissionRate,
          events: { create: { status: "REQUESTED", note: "Customer requested the visit", actorId: input.customerId } },
        },
        include: bookingInclude,
      })
    } catch (error) {
      if (attempt === 4) throw error
    }
  }
  throw new AppError("Could not save the booking.")
}

async function loadBooking(code: string) {
  const booking = await db.serviceBooking.findUnique({ where: { code }, include: bookingInclude })
  if (!booking) throw new AppError("Booking not found.")
  return booking
}

export async function quoteBooking(code: string, actorId: string, storeId: string, amount: number) {
  const booking = await loadBooking(code)
  if (booking.storeId !== storeId) throw new AppError("This booking is for another provider.")
  if (booking.pricing !== "QUOTE") throw new AppError("This visit already has a price.")
  if (!SERVICE_NEXT[booking.status]?.includes("QUOTED")) throw new AppError("This booking cannot be quoted now.")
  if (!Number.isFinite(amount) || amount < 1) throw new AppError("Enter a quote in taka.")
  return db.serviceBooking.update({
    where: { id: booking.id },
    data: {
      status: "QUOTED",
      quoteAmount: Math.round(amount),
      events: { create: { status: "QUOTED", note: `Quote ৳${Math.round(amount)}`, actorId } },
    },
  })
}

export async function acceptQuote(code: string, customerId: string) {
  const booking = await loadBooking(code)
  if (booking.customerId !== customerId) throw new AppError("This is not your booking.")
  if (booking.status !== "QUOTED" || !booking.quoteAmount) throw new AppError("There is no quote to accept.")
  return db.serviceBooking.update({
    where: { id: booking.id },
    data: {
      status: "ACCEPTED",
      price: booking.quoteAmount,
      events: { create: { status: "ACCEPTED", note: "Customer accepted the quote", actorId: customerId } },
    },
  })
}

export async function providerAdvance(code: string, actorId: string, storeId: string, status: string, note = "") {
  const booking = await loadBooking(code)
  if (booking.storeId !== storeId) throw new AppError("This booking is for another provider.")
  if (status === "ACCEPTED" && booking.pricing === "QUOTE" && booking.status === "REQUESTED") {
    throw new AppError("Send a quote before accepting.")
  }
  if (!SERVICE_NEXT[booking.status]?.includes(status)) throw new AppError("That status is not next.")
  return settle(booking.id, status, actorId, note || statusLabelNote(status))
}

export async function assignWorker(code: string, actorId: string, storeId: string, workerId: string) {
  const booking = await loadBooking(code)
  if (booking.storeId !== storeId) throw new AppError("This booking is for another provider.")
  if (["COMPLETED", "CANCELLED", "REQUESTED"].includes(booking.status)) throw new AppError("Assign a worker after the job is accepted.")
  const worker = await db.deliveryProfile.findFirst({ where: { id: workerId, storeId } })
  if (!worker) throw new AppError("That field worker is not on your team.")
  return db.serviceBooking.update({
    where: { id: booking.id },
    data: {
      workerId,
      events: { create: { status: booking.status, note: "Field worker assigned", actorId } },
    },
  })
}

export async function workerAdvance(code: string, workerProfileId: string, actorId: string, status: string) {
  const booking = await loadBooking(code)
  if (booking.workerId !== workerProfileId) throw new AppError("This job is not assigned to you.")
  if (!["ON_THE_WAY", "IN_PROGRESS", "COMPLETED"].includes(status)) throw new AppError("You cannot set that status.")
  if (!SERVICE_NEXT[booking.status]?.includes(status)) throw new AppError("That status is not next.")
  return settle(booking.id, status, actorId, statusLabelNote(status))
}

export async function cancelBooking(code: string, actorId: string, who: { customerId?: string; storeId?: string }, reason: string) {
  const booking = await loadBooking(code)
  if (who.customerId && booking.customerId !== who.customerId) throw new AppError("This is not your booking.")
  if (who.storeId && booking.storeId !== who.storeId) throw new AppError("This booking is for another provider.")
  if (!SERVICE_NEXT[booking.status]?.includes("CANCELLED")) throw new AppError("This booking is already closed.")
  return db.serviceBooking.update({
    where: { id: booking.id },
    data: {
      status: "CANCELLED",
      cancelReason: reason.trim() || "Cancelled",
      events: { create: { status: "CANCELLED", note: reason.trim() || "Cancelled", actorId } },
    },
  })
}

export async function reviewBooking(code: string, customerId: string, rating: number, comment: string) {
  const booking = await loadBooking(code)
  if (booking.customerId !== customerId) throw new AppError("This is not your booking.")
  if (booking.status !== "COMPLETED") throw new AppError("Review the visit after it is completed.")
  if (booking.review) throw new AppError("You already reviewed this visit.")
  if (rating < 1 || rating > 5) throw new AppError("Choose 1 to 5 stars.")
  if (comment.trim().length < 3) throw new AppError("Write a short review.")
  const review = await db.serviceReview.create({
    data: { bookingId: booking.id, customerId, storeId: booking.storeId, rating, comment: comment.trim() },
  })
  const agg = await db.serviceReview.aggregate({ where: { storeId: booking.storeId }, _avg: { rating: true }, _count: true })
  const laundry = await db.review.aggregate({ where: { storeId: booking.storeId }, _avg: { rating: true }, _count: true })
  const count = agg._count + laundry._count
  const avg = count
    ? ((agg._avg.rating ?? 0) * agg._count + (laundry._avg.rating ?? 0) * laundry._count) / count
    : rating
  await db.store.update({ where: { id: booking.storeId }, data: { rating: Math.round(avg * 10) / 10, reviewCount: count } })
  return review
}

async function settle(id: string, status: string, actorId: string, note: string) {
  const booking = await db.serviceBooking.findUnique({ where: { id }, include: { category: true } })
  if (!booking) throw new AppError("Booking not found.")
  const done = status === "COMPLETED"
  const commissionAmt = done ? Math.round(booking.price * (booking.category.commissionRate / 100)) : 0
  return db.serviceBooking.update({
    where: { id },
    data: {
      status,
      commissionRate: booking.category.commissionRate,
      commissionAmt,
      providerEarning: done ? booking.price - commissionAmt : 0,
      paymentStatus: done ? "RECORDED" : booking.paymentStatus,
      events: { create: { status, note, actorId } },
    },
  })
}

function statusLabelNote(status: string) {
  if (status === "ACCEPTED") return "Provider accepted"
  if (status === "ON_THE_WAY") return "On the way"
  if (status === "IN_PROGRESS") return "Work started"
  if (status === "COMPLETED") return "Visit completed"
  return status
}

export async function categoryStats() {
  const categories = await db.serviceCategory.findMany({ orderBy: { sort: "asc" } })
  const bookings = await db.serviceBooking.findMany({
    select: { categoryId: true, status: true, price: true, commissionAmt: true },
  })
  return categories.map((category) => {
    const rows = bookings.filter((row) => row.categoryId === category.id)
    const completed = rows.filter((row) => row.status === "COMPLETED")
    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      nameBn: category.nameBn,
      commissionRate: category.commissionRate,
      bookings: rows.length,
      open: rows.filter((row) => !["COMPLETED", "CANCELLED"].includes(row.status)).length,
      gmv: completed.reduce((sum, row) => sum + row.price, 0),
      commission: completed.reduce((sum, row) => sum + row.commissionAmt, 0),
    }
  })
}
