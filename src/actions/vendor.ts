"use server"

import { redirect, unstable_rethrow } from "next/navigation"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getUser } from "@/lib/auth"
import { AppError } from "@/lib/errors"
import { storeBalance, transitionOrder } from "@/lib/orders"

async function storeUser() {
  const user = await getUser()
  if (!user || user.role !== "STORE" || !user.store) redirect("/login")
  return { user, store: user.store }
}

function back(path: string, error: unknown): never {
  unstable_rethrow(error)
  const message = error instanceof AppError ? error.message : "Something went wrong."
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

export async function acceptOrder(formData: FormData) {
  const { user } = await storeUser()
  const id = String(formData.get("id") || "")
  try {
    await transitionOrder({ orderId: id, actorId: user.id, to: "ACCEPTED", note: "Laundry accepted" })
  } catch (error) {
    back(`/vendor/orders/${id}`, error)
  }
  redirect(`/vendor/orders/${id}`)
}

export async function rejectOrder(formData: FormData) {
  const { user } = await storeUser()
  const id = String(formData.get("id") || "")
  const note = String(formData.get("note") || "Laundry cannot take this order")
  try {
    await transitionOrder({ orderId: id, actorId: user.id, to: "REJECTED", note })
  } catch (error) {
    back(`/vendor/orders/${id}`, error)
  }
  redirect("/vendor/orders")
}

export async function assignAndMaybeAdvance(formData: FormData) {
  const { user } = await storeUser()
  const id = String(formData.get("id") || "")
  const riderProfileId = String(formData.get("riderId") || "")
  const order = await db.order.findUnique({ where: { id } })
  if (!order) redirect("/vendor/orders")
  const to = order.status === "READY" ? "OUT_FOR_DELIVERY" : order.status === "PENDING" ? "PICKUP_ASSIGNED" : "PICKUP_ASSIGNED"
  try {
    if (order.status === "PENDING") {
      await transitionOrder({ orderId: id, actorId: user.id, to: "ACCEPTED" })
    }
    const target = order.status === "READY" ? "OUT_FOR_DELIVERY" : "PICKUP_ASSIGNED"
    await transitionOrder({
      orderId: id,
      actorId: user.id,
      to: target,
      riderProfileId,
      note: "Rider assigned",
    })
  } catch (error) {
    back(`/vendor/orders/${id}`, error)
  }
  redirect(`/vendor/orders/${id}`)
}

export async function advanceOrder(formData: FormData) {
  const { user } = await storeUser()
  const id = String(formData.get("id") || "")
  const to = String(formData.get("to") || "")
  try {
    await transitionOrder({ orderId: id, actorId: user.id, to, note: "Updated by laundry" })
  } catch (error) {
    back(`/vendor/orders/${id}`, error)
  }
  redirect(`/vendor/orders/${id}`)
}

export async function savePrice(formData: FormData) {
  const { store } = await storeUser()
  const itemId = String(formData.get("itemId") || "")
  const kindId = String(formData.get("kindId") || "")
  const amount = Math.round(Number(formData.get("amount") || 0))
  if (!itemId || !kindId || amount < 0) redirect("/vendor/prices?error=Enter%20a%20price.")
  if (amount === 0) {
    await db.price.deleteMany({ where: { storeId: store.id, itemId, kindId } })
  } else {
    await db.price.upsert({
      where: { storeId_itemId_kindId: { storeId: store.id, itemId, kindId } },
      update: { amount, active: true },
      create: { storeId: store.id, itemId, kindId, amount, active: true },
    })
  }
  revalidatePath("/vendor/prices")
  redirect("/vendor/prices?ok=1")
}

export async function saveSlot(formData: FormData) {
  const { store } = await storeUser()
  const label = String(formData.get("label") || "").trim()
  const startTime = String(formData.get("start") || "")
  const endTime = String(formData.get("end") || "")
  if (!label || !startTime || !endTime) redirect("/vendor/slots?error=Fill%20the%20slot.")
  await db.timeSlot.create({
    data: { storeId: store.id, label, startTime, endTime, capacity: Number(formData.get("capacity") || 8) },
  })
  redirect("/vendor/slots")
}

export async function toggleSlot(formData: FormData) {
  const { store } = await storeUser()
  const id = String(formData.get("id") || "")
  const slot = await db.timeSlot.findFirst({ where: { id, storeId: store.id } })
  if (slot) await db.timeSlot.update({ where: { id }, data: { active: !slot.active } })
  redirect("/vendor/slots")
}

export async function deleteSlot(formData: FormData) {
  const { store } = await storeUser()
  await db.timeSlot.deleteMany({ where: { id: String(formData.get("id") || ""), storeId: store.id } })
  redirect("/vendor/slots")
}

export async function saveStoreFaq(formData: FormData) {
  const { store } = await storeUser()
  const question = String(formData.get("question") || "").trim()
  const answer = String(formData.get("answer") || "").trim()
  if (!question || !answer) redirect("/vendor/faq?error=Add%20a%20question%20and%20an%20answer.")
  await db.faq.create({ data: { storeId: store.id, question, answer } })
  redirect("/vendor/faq")
}

export async function deleteFaq(formData: FormData) {
  const { store } = await storeUser()
  await db.faq.deleteMany({ where: { id: String(formData.get("id") || ""), storeId: store.id } })
  redirect("/vendor/faq")
}

export async function saveStoreCoupon(formData: FormData) {
  const { store } = await storeUser()
  const code = String(formData.get("code") || "").trim().toUpperCase()
  const title = String(formData.get("title") || "").trim()
  const type = String(formData.get("type") || "FIXED")
  const value = Math.round(Number(formData.get("value") || 0))
  if (!code || !title || value <= 0) redirect("/vendor/coupons?error=Fill%20the%20coupon.")
  await db.coupon.create({
    data: {
      code,
      title,
      type,
      value,
      minOrder: Math.round(Number(formData.get("minOrder") || 0)),
      storeId: store.id,
      detail: "Laundry offer",
    },
  })
  redirect("/vendor/coupons")
}

export async function toggleCoupon(formData: FormData) {
  const user = await getUser()
  if (!user || (user.role !== "ADMIN" && user.role !== "STORE")) redirect("/login")
  const id = String(formData.get("id") || "")
  const coupon = await db.coupon.findUnique({ where: { id } })
  if (coupon) await db.coupon.update({ where: { id }, data: { active: !coupon.active } })
  redirect(String(formData.get("back") || "/vendor/coupons"))
}

export async function requestPayout(formData: FormData) {
  const { store } = await storeUser()
  const amount = Math.round(Number(formData.get("amount") || 0))
  const method = String(formData.get("method") || "bKash")
  const account = String(formData.get("account") || "").trim()
  const balance = await storeBalance(store.id)
  if (amount < 100 || amount > balance.available || !account) {
    redirect("/vendor/payouts?error=Amount%20must%20fit%20the%20available%20balance%20(min%20%E0%A7%B3%20100).")
  }
  await db.payout.create({ data: { storeId: store.id, amount, method, account, status: "REQUESTED" } })
  redirect("/vendor/payouts?ok=1")
}

export async function saveStoreCategory(formData: FormData) {
  const { store } = await storeUser()
  const name = String(formData.get("name") || "").trim()
  if (!name) redirect("/vendor/categories")
  await db.storeCategory.create({ data: { storeId: store.id, name } })
  redirect("/vendor/categories")
}

export async function deleteStoreCategory(formData: FormData) {
  const { store } = await storeUser()
  await db.storeCategory.deleteMany({ where: { id: String(formData.get("id") || ""), storeId: store.id } })
  redirect("/vendor/categories")
}

export async function saveAttribute(formData: FormData) {
  const { store } = await storeUser()
  const name = String(formData.get("name") || "").trim()
  const value = String(formData.get("value") || "").trim()
  if (!name || !value) redirect("/vendor/attributes?error=Add%20a%20name%20and%20a%20value.")
  await db.productAttribute.create({ data: { storeId: store.id, name, value } })
  redirect("/vendor/attributes")
}

export async function deleteAttribute(formData: FormData) {
  const { store } = await storeUser()
  await db.productAttribute.deleteMany({ where: { id: String(formData.get("id") || ""), storeId: store.id } })
  redirect("/vendor/attributes")
}

export async function saveGallery(formData: FormData) {
  const { store } = await storeUser()
  const caption = String(formData.get("caption") || "").trim()
  const image = String(formData.get("image") || "/marketing/news-foldline.jpg")
  if (!caption) redirect("/vendor/gallery?error=Add%20a%20caption.")
  await db.galleryItem.create({ data: { storeId: store.id, caption, image } })
  redirect("/vendor/gallery")
}

export async function deleteGallery(formData: FormData) {
  const { store } = await storeUser()
  await db.galleryItem.deleteMany({ where: { id: String(formData.get("id") || ""), storeId: store.id } })
  redirect("/vendor/gallery")
}

export async function addStoreRider(formData: FormData) {
  const { store } = await storeUser()
  const name = String(formData.get("name") || "").trim()
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const password = String(formData.get("password") || "")
  const phone = String(formData.get("phone") || "")
  if (!name || !email.includes("@") || password.length < 6) {
    redirect("/vendor/riders?error=Name%2C%20email%20and%20a%206%2B%20character%20password.")
  }
  const bcrypt = await import("bcryptjs")
  await db.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: await bcrypt.default.hash(password, 10),
      role: "DELIVERY",
      referralCode: `RD${Math.floor(10000 + Math.random() * 90000)}`,
      wallet: { create: { balance: 0 } },
      rider: { create: { vehicle: "Bike", zone: store.area, storeId: store.id } },
    },
  })
  redirect("/vendor/riders?ok=1")
}

export async function updateStoreProfile(formData: FormData) {
  const { store } = await storeUser()
  await db.store.update({
    where: { id: store.id },
    data: {
      name: String(formData.get("name") || store.name),
      tagline: String(formData.get("tagline") || ""),
      about: String(formData.get("about") || ""),
      phone: String(formData.get("phone") || store.phone),
      address: String(formData.get("address") || store.address),
      area: String(formData.get("area") || store.area),
      openTime: String(formData.get("openTime") || store.openTime),
      closeTime: String(formData.get("closeTime") || store.closeTime),
      deliveryFee: Math.round(Number(formData.get("deliveryFee") || store.deliveryFee)),
      minOrder: Math.round(Number(formData.get("minOrder") || store.minOrder)),
    },
  })
  redirect("/vendor/profile?ok=1")
}
