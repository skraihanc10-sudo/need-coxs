"use server"

import { redirect, unstable_rethrow } from "next/navigation"
import { db } from "@/lib/db"
import { getUser } from "@/lib/auth"
import { AppError } from "@/lib/errors"
import { clearDraft, getDraft, setDraft } from "@/lib/draft"
import { createOrderFromInput, refreshStoreRating, transitionOrder } from "@/lib/orders"
import { revalidatePath } from "next/cache"

export type CartState = { error?: string; clash?: boolean; ok?: boolean } | null

async function customer() {
  const user = await getUser()
  if (!user || user.role !== "CUSTOMER") redirect("/login?next=/cart")
  return user
}

export async function addToCart(_prev: CartState, formData: FormData): Promise<CartState> {
  const user = await getUser()
  if (!user || user.role !== "CUSTOMER") redirect("/login?next=/cart")
  const priceId = String(formData.get("priceId") || "")
  const quantity = Math.min(30, Math.max(1, Number(formData.get("quantity") || 1)))
  const replace = formData.get("replace") === "1"
  const price = await db.price.findUnique({ where: { id: priceId }, include: { store: true } })
  if (!price || !price.active) return { error: "That price is no longer available." }
  const existing = await db.cartItem.findFirst({
    where: { userId: user.id },
    include: { price: true },
  })
  if (existing && existing.price.storeId !== price.storeId && !replace) {
    return { clash: true }
  }
  if (existing && existing.price.storeId !== price.storeId && replace) {
    await db.cartItem.deleteMany({ where: { userId: user.id } })
  }
  await db.cartItem.upsert({
    where: { userId_priceId: { userId: user.id, priceId } },
    update: { quantity: { increment: quantity } },
    create: { userId: user.id, priceId, quantity },
  })
  revalidatePath("/cart")
  revalidatePath("/")
  return { ok: true }
}

export async function setQty(formData: FormData) {
  const user = await customer()
  const id = String(formData.get("id") || "")
  const quantity = Number(formData.get("quantity") || 0)
  const item = await db.cartItem.findFirst({ where: { id, userId: user.id } })
  if (!item) redirect("/cart")
  if (quantity <= 0) await db.cartItem.delete({ where: { id } })
  else await db.cartItem.update({ where: { id }, data: { quantity: Math.min(30, quantity) } })
  revalidatePath("/cart")
  redirect("/cart")
}

export async function saveCoupon(formData: FormData) {
  const user = await customer()
  const code = String(formData.get("coupon") || "").trim().toUpperCase()
  const draft = await getDraft()
  if (!code) {
    draft.coupon = undefined
    await setDraft(draft)
    redirect("/checkout/review")
  }
  const cart = await db.cartItem.findFirst({ where: { userId: user.id }, include: { price: true } })
  const coupon = await db.coupon.findUnique({ where: { code } })
  if (!coupon || !coupon.active) redirect("/checkout/review?error=That%20promo%20code%20is%20not%20active.")
  if (coupon.storeId && cart && coupon.storeId !== cart.price.storeId) {
    redirect("/checkout/review?error=That%20code%20is%20for%20another%20laundry.")
  }
  draft.coupon = code
  await setDraft(draft)
  redirect("/checkout/review?ok=1")
}

export async function saveSchedule(formData: FormData) {
  const user = await customer()
  const draft = await getDraft()
  const addressId = String(formData.get("addressId") || draft.addressId || "")
  const address = await db.address.findFirst({ where: { id: addressId, userId: user.id } })
  if (!address) redirect("/checkout/schedule?error=Choose%20an%20address.")
  draft.addressId = address.id
  draft.pickupDate = String(formData.get("pickupDate") || "")
  draft.pickupSlot = String(formData.get("pickupSlot") || "")
  draft.deliveryDate = String(formData.get("deliveryDate") || "")
  draft.deliverySlot = String(formData.get("deliverySlot") || "")
  draft.preference = String(formData.get("preference") || "Regular")
  draft.notes = String(formData.get("notes") || "")
  if (!draft.pickupDate || !draft.pickupSlot || !draft.deliveryDate || !draft.deliverySlot) {
    await setDraft(draft)
    redirect("/checkout/schedule?error=Pick%20a%20pickup%20and%20a%20delivery%20slot.")
  }
  await setDraft(draft)
  redirect("/checkout/payment")
}

export async function placeOrder(_prev: { error: string }, formData: FormData) {
  try {
    const user = await customer()
    const draft = await getDraft()
    const cart = await db.cartItem.findMany({ where: { userId: user.id } })
    if (!draft.addressId || !draft.pickupDate || !draft.pickupSlot || !draft.deliveryDate || !draft.deliverySlot) {
      throw new AppError("Finish the address and time slots first.")
    }
    const method = String(formData.get("method") || "COD")
    const order = await createOrderFromInput({
      customerId: user.id,
      lines: cart.map((item) => ({ priceId: item.priceId, quantity: item.quantity })),
      addressId: draft.addressId,
      pickupDate: draft.pickupDate,
      pickupSlot: draft.pickupSlot,
      deliveryDate: draft.deliveryDate,
      deliverySlot: draft.deliverySlot,
      preference: draft.preference || "Regular",
      notes: String(formData.get("notes") || draft.notes || ""),
      couponCode: draft.coupon,
      useWallet: formData.get("wallet") === "on",
      paymentMethod: method,
    })
    await db.cartItem.deleteMany({ where: { userId: user.id } })
    await clearDraft()
    if (order.paymentMethod === "COD" || order.paymentMethod === "WALLET") {
      redirect(`/orders/success/${order.code}`)
    }
    redirect(`/pay/${order.code}`)
  } catch (error) {
    unstable_rethrow(error)
    return { error: error instanceof AppError ? error.message : "Could not place the order." }
  }
}

export async function switchToCod(formData: FormData) {
  const user = await customer()
  const code = String(formData.get("code") || "")
  const order = await db.order.findFirst({ where: { code, customerId: user.id } })
  if (!order) redirect("/orders")
  await db.order.update({
    where: { id: order.id },
    data: { paymentMethod: "COD", paymentStatus: "COD_DUE" },
  })
  await db.payment.update({
    where: { orderId: order.id },
    data: { provider: "COD", status: "COD_DUE", detail: "Customer switched to cash on delivery." },
  })
  redirect(`/orders/success/${order.code}`)
}

export async function saveAddress(formData: FormData) {
  const user = await customer()
  const label = String(formData.get("label") || "Home")
  const line1 = String(formData.get("line1") || "").trim()
  const area = String(formData.get("area") || "").trim()
  const phone = String(formData.get("phone") || user.phone || "").trim()
  const lat = Number(formData.get("lat") || 0)
  const lng = Number(formData.get("lng") || 0)
  if (!line1 || !area) redirect("/profile/addresses?error=Add%20the%20street%20and%20area.")
  const count = await db.address.count({ where: { userId: user.id } })
  await db.address.create({
    data: {
      userId: user.id,
      label,
      line1,
      area,
      phone,
      lat: lat || null,
      lng: lng || null,
      isDefault: count === 0,
    },
  })
  const back = String(formData.get("back") || "/profile/addresses")
  redirect(back.startsWith("/") ? back : "/profile/addresses")
}

export async function setDefaultAddress(formData: FormData) {
  const user = await customer()
  const id = String(formData.get("id") || "")
  await db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } })
  await db.address.updateMany({ where: { id, userId: user.id }, data: { isDefault: true } })
  redirect("/profile/addresses")
}

export async function deleteAddress(formData: FormData) {
  const user = await customer()
  const id = String(formData.get("id") || "")
  await db.address.deleteMany({ where: { id, userId: user.id } })
  redirect("/profile/addresses")
}

export async function cancelOrder(_prev: { error: string }, formData: FormData) {
  try {
    const user = await customer()
    const code = String(formData.get("code") || "")
    const reason = String(formData.get("reason") || "").trim()
    if (!reason) return { error: "Choose a reason." }
    const order = await db.order.findFirst({ where: { code, customerId: user.id } })
    if (!order) return { error: "Order not found." }
    await transitionOrder({ orderId: order.id, actorId: user.id, to: "CANCELLED", note: reason })
    redirect(`/orders/${order.code}`)
  } catch (error) {
    unstable_rethrow(error)
    return { error: error instanceof AppError ? error.message : "Could not cancel." }
  }
}

export async function reviewOrder(_prev: { error: string }, formData: FormData) {
  try {
    const user = await customer()
    const code = String(formData.get("code") || "")
    const rating = Number(formData.get("rating") || 0)
    const comment = String(formData.get("comment") || "").trim()
    if (rating < 1 || rating > 5) return { error: "Choose a star rating." }
    if (comment.length < 3) return { error: "Write a short note." }
    const order = await db.order.findFirst({ where: { code, customerId: user.id } })
    if (!order || order.status !== "DELIVERED") return { error: "You can review a completed order." }
    await db.review.create({
      data: { orderId: order.id, customerId: user.id, storeId: order.storeId, rating, comment },
    })
    await refreshStoreRating(order.storeId)
    redirect(`/orders/${order.code}`)
  } catch (error) {
    unstable_rethrow(error)
    return { error: error instanceof AppError ? error.message : "Could not save the review." }
  }
}

export async function sendChat(_prev: { error: string }, formData: FormData) {
  try {
    const user = await customer()
    const body = String(formData.get("body") || "").trim()
    if (body.length < 1) return { error: "Write a message." }
    let thread = await db.thread.findUnique({ where: { customerId: user.id } })
    if (!thread) thread = await db.thread.create({ data: { customerId: user.id } })
    await db.message.create({ data: { threadId: thread.id, senderId: user.id, body } })
    await db.thread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } })
    revalidatePath("/chat")
    revalidatePath("/admin/messages")
    return { error: "" }
  } catch (error) {
    unstable_rethrow(error)
    return { error: "Could not send." }
  }
}
