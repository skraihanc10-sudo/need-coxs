"use server"

import { redirect } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { AppError } from "@/lib/errors"
import { db } from "@/lib/db"
import {
  acceptQuote,
  assignWorker,
  cancelBooking,
  createServiceBooking,
  providerAdvance,
  quoteBooking,
  reviewBooking,
  workerAdvance,
} from "@/lib/marketplace"

function fail(path: string, error: unknown): never {
  if (error instanceof AppError) {
    redirect(`${path}?error=${encodeURIComponent(error.message)}`)
  }
  throw error
}

function num(value: FormDataEntryValue | null) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function createBookingAction(formData: FormData) {
  const user = await requireUser(["CUSTOMER"], "/hub")
  const back = String(formData.get("back") || "/hub")
  try {
    const lat = String(formData.get("lat") || "").trim()
    const lng = String(formData.get("lng") || "").trim()
    const booking = await createServiceBooking({
      customerId: user.id,
      offeringId: String(formData.get("offeringId") || ""),
      storeId: String(formData.get("storeId") || ""),
      areaId: String(formData.get("areaId") || ""),
      addressLine: String(formData.get("addressLine") || ""),
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      visitDate: String(formData.get("visitDate") || ""),
      visitSlot: String(formData.get("visitSlot") || ""),
      notes: String(formData.get("notes") || ""),
      photos: String(formData.get("photos") || ""),
      paymentMethod: String(formData.get("paymentMethod") || "CASH"),
      rooms: num(formData.get("rooms")),
      teamSize: num(formData.get("teamSize")),
      days: num(formData.get("days")),
    })
    redirect(`/hub/jobs/${booking.code}`)
  } catch (error) {
    fail(back, error)
  }
}

export async function acceptQuoteAction(formData: FormData) {
  const user = await requireUser(["CUSTOMER"], "/hub")
  const code = String(formData.get("code") || "")
  try {
    await acceptQuote(code, user.id)
  } catch (error) {
    fail(`/hub/jobs/${code}`, error)
  }
  redirect(`/hub/jobs/${code}`)
}

export async function reviewBookingAction(formData: FormData) {
  const user = await requireUser(["CUSTOMER"], "/hub")
  const code = String(formData.get("code") || "")
  try {
    await reviewBooking(code, user.id, num(formData.get("rating")), String(formData.get("comment") || ""))
  } catch (error) {
    fail(`/hub/jobs/${code}`, error)
  }
  redirect(`/hub/jobs/${code}`)
}

export async function cancelCustomerBookingAction(formData: FormData) {
  const user = await requireUser(["CUSTOMER"], "/hub")
  const code = String(formData.get("code") || "")
  try {
    await cancelBooking(code, user.id, { customerId: user.id }, String(formData.get("reason") || ""))
  } catch (error) {
    fail(`/hub/jobs/${code}`, error)
  }
  redirect(`/hub/jobs/${code}`)
}

export async function providerJobAction(formData: FormData) {
  const user = await requireUser(["STORE"], "/vendor")
  const code = String(formData.get("code") || "")
  const intent = String(formData.get("intent") || "")
  const storeId = user.store?.id
  if (!storeId) redirect("/vendor")
  try {
    if (intent === "quote") await quoteBooking(code, user.id, storeId, num(formData.get("amount")))
    else if (intent === "assign") await assignWorker(code, user.id, storeId, String(formData.get("workerId") || ""))
    else if (intent === "cancel") await cancelBooking(code, user.id, { storeId }, String(formData.get("reason") || "Provider cancelled"))
    else await providerAdvance(code, user.id, storeId, intent)
  } catch (error) {
    fail(`/vendor/jobs/${code}`, error)
  }
  redirect(`/vendor/jobs/${code}`)
}

export async function workerJobAction(formData: FormData) {
  const user = await requireUser(["DELIVERY"], "/rider")
  const code = String(formData.get("code") || "")
  const status = String(formData.get("status") || "")
  if (!user.rider) redirect("/rider")
  try {
    await workerAdvance(code, user.rider.id, user.id, status)
  } catch (error) {
    fail(`/rider/field/${code}`, error)
  }
  redirect(`/rider/field/${code}`)
}

export async function saveCategoryAction(formData: FormData) {
  const user = await requireUser(["ADMIN"], "/admin")
  const id = String(formData.get("id") || "")
  const name = String(formData.get("name") || "").trim()
  const nameBn = String(formData.get("nameBn") || "").trim()
  const commissionRate = num(formData.get("commissionRate"))
  const active = formData.get("active") === "on"
  if (!id || !name) redirect("/admin/categories?error=Name+is+required")
  await db.serviceCategory.update({
    where: { id },
    data: { name, nameBn: nameBn || name, commissionRate, active },
  })
  redirect("/admin/categories")
  void user
}

export async function saveOfferingAction(formData: FormData) {
  await requireUser(["ADMIN"], "/admin")
  const categoryId = String(formData.get("categoryId") || "")
  const name = String(formData.get("name") || "").trim()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `svc-${Date.now()}`
  const pricing = String(formData.get("pricing") || "FIXED") === "QUOTE" ? "QUOTE" : "FIXED"
  if (!categoryId || !name) redirect("/admin/categories?error=Add+a+service+name")
  await db.serviceOffering.create({
    data: {
      categoryId,
      slug,
      name,
      nameBn: String(formData.get("nameBn") || name),
      pricing,
      price: pricing === "QUOTE" ? 0 : num(formData.get("price")),
      bulk: formData.get("bulk") === "on",
      unit: "visit",
      unitBn: "ভিজিট",
    },
  })
  redirect("/admin/categories")
}

export async function saveAreaAction(formData: FormData) {
  await requireUser(["ADMIN"], "/admin")
  const name = String(formData.get("name") || "").trim()
  const nameBn = String(formData.get("nameBn") || name).trim()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  if (!name || !slug) redirect("/admin/areas?error=Add+an+area+name")
  await db.serviceArea.upsert({
    where: { slug },
    update: { name, nameBn, active: true },
    create: { slug, name, nameBn },
  })
  redirect("/admin/areas")
}

export async function toggleAreaAction(formData: FormData) {
  await requireUser(["ADMIN"], "/admin")
  const id = String(formData.get("id") || "")
  const area = await db.serviceArea.findUnique({ where: { id } })
  if (area) await db.serviceArea.update({ where: { id }, data: { active: !area.active } })
  redirect("/admin/areas")
}

export async function reviewDocumentAction(formData: FormData) {
  await requireUser(["ADMIN"], "/admin")
  const id = String(formData.get("id") || "")
  const status = String(formData.get("status") || "")
  const storeId = String(formData.get("storeId") || "")
  if (id && (status === "APPROVED" || status === "REJECTED")) {
    await db.providerDocument.update({ where: { id }, data: { status } })
  }
  if (storeId && status === "APPROVED") {
    await db.store.update({ where: { id: storeId }, data: { status: "APPROVED" } })
  }
  if (storeId && status === "REJECTED") {
    await db.store.update({ where: { id: storeId }, data: { status: "REJECTED" } })
  }
  redirect("/admin/providers")
}
