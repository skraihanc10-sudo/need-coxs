"use server"

import bcrypt from "bcryptjs"
import { redirect, unstable_rethrow } from "next/navigation"
import { db } from "@/lib/db"
import { getUser } from "@/lib/auth"
import { AppError } from "@/lib/errors"
import { transitionOrder } from "@/lib/orders"
import { saveSettings, SETTING_DEFAULTS } from "@/lib/settings"
import { revalidatePath } from "next/cache"

async function admin() {
  const user = await getUser()
  if (!user || user.role !== "ADMIN") redirect("/login")
  return user
}

function fail(path: string, error: unknown): never {
  unstable_rethrow(error)
  const message = error instanceof AppError ? error.message : "Something went wrong."
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

export async function setStoreStatus(formData: FormData) {
  await admin()
  const id = String(formData.get("id") || "")
  const status = String(formData.get("status") || "APPROVED")
  await db.store.update({ where: { id }, data: { status } })
  redirect("/admin/stores")
}

export async function setCommission(formData: FormData) {
  await admin()
  const id = String(formData.get("id") || "")
  const commissionRate = Number(formData.get("rate") || 0)
  await db.store.update({ where: { id }, data: { commissionRate } })
  redirect("/admin/stores?ok=1")
}

export async function adminSetStatus(formData: FormData) {
  const user = await admin()
  const id = String(formData.get("id") || "")
  const to = String(formData.get("status") || "")
  const riderProfileId = String(formData.get("riderId") || "") || undefined
  try {
    await transitionOrder({
      orderId: id,
      actorId: user.id,
      to,
      riderProfileId,
      note: "Updated from the admin desk",
    })
  } catch (error) {
    fail(`/admin/orders/${id}`, error)
  }
  redirect(`/admin/orders/${id}`)
}

export async function createRider(formData: FormData) {
  await admin()
  const name = String(formData.get("name") || "").trim()
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const phone = String(formData.get("phone") || "").trim()
  const password = String(formData.get("password") || "")
  const vehicle = String(formData.get("vehicle") || "Bike")
  const zone = String(formData.get("zone") || "Dhaka")
  const storeId = String(formData.get("storeId") || "") || null
  if (!name || !email.includes("@") || password.length < 6) {
    redirect("/admin/riders?error=Name%2C%20email%20and%20a%206%2B%20character%20password%20are%20required.")
  }
  await db.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: await bcrypt.hash(password, 10),
      role: "DELIVERY",
      referralCode: `RD${Math.floor(10000 + Math.random() * 90000)}`,
      wallet: { create: { balance: 0 } },
      rider: { create: { vehicle, zone, storeId } },
    },
  })
  redirect("/admin/riders?ok=1")
}

export async function toggleUser(formData: FormData) {
  await admin()
  const id = String(formData.get("id") || "")
  const user = await db.user.findUnique({ where: { id } })
  if (user && user.role !== "ADMIN") {
    await db.user.update({ where: { id }, data: { active: !user.active } })
  }
  redirect(String(formData.get("back") || "/admin/customers"))
}

export async function setUserPassword(formData: FormData) {
  await admin()
  const id = String(formData.get("id") || "")
  const password = String(formData.get("password") || "")
  if (password.length < 6) redirect("/admin/customers?error=Use%206%2B%20characters.")
  await db.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(password, 10) } })
  redirect("/admin/customers?ok=1")
}

export async function adjustWallet(formData: FormData) {
  await admin()
  const id = String(formData.get("id") || "")
  const amount = Math.round(Number(formData.get("amount") || 0))
  const note = String(formData.get("note") || "Adjusted by Need Cox's")
  if (!amount) redirect("/admin/customers?error=Enter%20an%20amount.")
  await db.wallet.upsert({
    where: { userId: id },
    update: { balance: { increment: amount } },
    create: { userId: id, balance: Math.max(0, amount) },
  })
  await db.walletTxn.create({
    data: { userId: id, amount, type: amount > 0 ? "CREDIT" : "DEBIT", note },
  })
  redirect("/admin/customers?ok=1")
}

export async function saveBanner(formData: FormData) {
  await admin()
  await db.banner.create({
    data: {
      title: String(formData.get("title") || ""),
      titleBn: String(formData.get("titleBn") || ""),
      subtitle: String(formData.get("subtitle") || ""),
      subtitleBn: String(formData.get("subtitleBn") || ""),
      href: String(formData.get("href") || "/offers"),
      sort: Number(formData.get("sort") || 0),
    },
  })
  redirect("/admin/banners")
}

export async function toggleBanner(formData: FormData) {
  await admin()
  const id = String(formData.get("id") || "")
  const banner = await db.banner.findUnique({ where: { id } })
  if (banner) await db.banner.update({ where: { id }, data: { active: !banner.active } })
  redirect("/admin/banners")
}

export async function deleteBanner(formData: FormData) {
  await admin()
  await db.banner.delete({ where: { id: String(formData.get("id") || "") } })
  redirect("/admin/banners")
}

export async function saveAdminCoupon(formData: FormData) {
  await admin()
  await db.coupon.create({
    data: {
      code: String(formData.get("code") || "").trim().toUpperCase(),
      title: String(formData.get("title") || "").trim(),
      detail: String(formData.get("detail") || ""),
      type: String(formData.get("type") || "FIXED"),
      value: Math.round(Number(formData.get("value") || 0)),
      minOrder: Math.round(Number(formData.get("minOrder") || 0)),
      maxDiscount: formData.get("maxDiscount") ? Math.round(Number(formData.get("maxDiscount"))) : null,
      storeId: String(formData.get("storeId") || "") || null,
    },
  })
  redirect("/admin/coupons")
}

export async function saveFaq(formData: FormData) {
  await admin()
  await db.faq.create({
    data: {
      question: String(formData.get("question") || ""),
      answer: String(formData.get("answer") || ""),
    },
  })
  redirect("/admin/faqs")
}

export async function deleteAdminFaq(formData: FormData) {
  await admin()
  await db.faq.delete({ where: { id: String(formData.get("id") || "") } })
  redirect("/admin/faqs")
}

export async function markPayout(formData: FormData) {
  const user = await admin()
  const id = String(formData.get("id") || "")
  const status = String(formData.get("status") || "PAID")
  await db.payout.update({
    where: { id },
    data: { status, actorId: user.id, note: status === "PAID" ? "Paid by Need Cox's" : "Rejected" },
  })
  redirect("/admin/payouts")
}

export async function saveGeneralSettings(formData: FormData) {
  await admin()
  const entries: Record<string, string> = {}
  for (const key of Object.keys(SETTING_DEFAULTS)) {
    if (key.startsWith("notify") || key.startsWith("pay")) {
      entries[key] = formData.get(key) === "on" ? "1" : "0"
    } else if (formData.has(key)) {
      entries[key] = String(formData.get(key) ?? "")
    }
  }
  await saveSettings(entries)
  redirect("/admin/settings?ok=1")
}

export async function saveNotifySettings(formData: FormData) {
  await admin()
  await saveSettings({
    notifyInApp: formData.get("notifyInApp") === "on" ? "1" : "0",
    notifyEmail: formData.get("notifyEmail") === "on" ? "1" : "0",
    notifySms: formData.get("notifySms") === "on" ? "1" : "0",
    notifyPush: formData.get("notifyPush") === "on" ? "1" : "0",
    fcmKey: String(formData.get("fcmKey") || ""),
  })
  redirect("/admin/notifications?ok=1")
}

export async function adminReply(formData: FormData) {
  const user = await admin()
  const threadId = String(formData.get("threadId") || "")
  const body = String(formData.get("body") || "").trim()
  if (!body) redirect(`/admin/messages/${threadId}`)
  await db.message.create({ data: { threadId, senderId: user.id, body } })
  await db.thread.update({ where: { id: threadId }, data: { updatedAt: new Date() } })
  revalidatePath(`/admin/messages/${threadId}`)
  revalidatePath("/chat")
  redirect(`/admin/messages/${threadId}`)
}
