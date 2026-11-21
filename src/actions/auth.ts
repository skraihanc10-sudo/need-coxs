"use server"

import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SignJWT, jwtVerify } from "jose"
import { db } from "@/lib/db"
import { clearSession, getUser, setSession } from "@/lib/auth"
import { authSecret } from "@/lib/secret"
import { homeFor, safeNext } from "@/lib/roles"
import { AppError } from "@/lib/errors"
import { getSettings } from "@/lib/settings"
import { brand } from "@/theme/brand"

export type AuthState = { error: string }

function clean(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = clean(formData.get("email")).toLowerCase()
  const password = clean(formData.get("password"))
  const remember = formData.get("remember") === "on"
  const next = clean(formData.get("next"))
  const user = await db.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Those details do not match a Need Cox's account." }
  }
  if (!user.active) return { error: "This account is paused. Contact support." }
  await setSession(user, remember ? 30 : 14)
  redirect(safeNext(user.role, next || homeFor(user.role)))
}

export async function logout() {
  await clearSession()
  redirect("/login")
}

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = clean(formData.get("name"))
  const email = clean(formData.get("email")).toLowerCase()
  const phone = clean(formData.get("phone"))
  const password = clean(formData.get("password"))
  const referral = clean(formData.get("referral")).toUpperCase()
  if (name.length < 2) return { error: "Add your name." }
  if (!email.includes("@")) return { error: "Add a valid email." }
  if (password.length < 6) return { error: "Use at least 6 characters." }
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return { error: "That email is already registered." }

  const settings = await getSettings()
  const bonus = Number(settings.referralBonus || 0)
  const referrer = referral
    ? await db.user.findUnique({ where: { referralCode: referral } })
    : null
  const code = `${name.split(" ")[0] || "NEEL"}`.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 8) +
    Math.floor(100 + Math.random() * 900)

  const user = await db.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: await bcrypt.hash(password, 10),
      role: "CUSTOMER",
      referralCode: code,
      referredById: referrer?.id,
      wallet: { create: { balance: referrer ? bonus : 0 } },
    },
  })
  if (referrer && bonus > 0) {
    await db.walletTxn.create({
      data: { userId: user.id, amount: bonus, type: "CREDIT", note: `Referral from ${referrer.name}` },
    })
    await db.wallet.update({ where: { userId: referrer.id }, data: { balance: { increment: bonus } } })
    await db.walletTxn.create({
      data: { userId: referrer.id, amount: bonus, type: "CREDIT", note: `${name} joined with your code` },
    })
  } else if (!referrer) {
    await db.walletTxn.create({
      data: { userId: user.id, amount: 0, type: "CREDIT", note: "Wallet opened" },
    })
  }

  const token = await new SignJWT({ purpose: "otp" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setExpirationTime("20m")
    .sign(authSecret())
  const jar = await cookies()
  jar.set("nc_otp", token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 20 })
  redirect("/otp")
}

export async function verifyOtp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const code = clean(formData.get("code"))
  if (code !== brand.demoOtp) return { error: "That code does not match." }
  const token = (await cookies()).get("nc_otp")?.value
  if (!token) return { error: "The verification window closed. Sign in instead." }
  try {
    const { payload } = await jwtVerify(token, authSecret())
    const user = await db.user.findUnique({ where: { id: String(payload.sub || "") } })
    if (!user) return { error: "Account not found." }
    await setSession(user)
    const jar = await cookies()
    jar.delete("nc_otp")
    redirect("/")
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error
    return { error: "The verification window closed. Sign in instead." }
  }
}

export async function finishIntro(formData: FormData) {
  const to = clean(formData.get("to")) || "/"
  if (formData.get("done") === "1") {
    const jar = await cookies()
    jar.set("nc_intro", "1", { path: "/", maxAge: 60 * 60 * 24 * 365 })
  }
  redirect(to.startsWith("/") && !to.startsWith("//") ? to : "/")
}

export async function setLocale(formData: FormData) {
  const locale = formData.get("locale") === "bn" ? "bn" : "en"
  const back = clean(formData.get("back")) || "/profile/language"
  const jar = await cookies()
  jar.set("nc_locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 })
  redirect(back.startsWith("/") ? back : "/")
}

export async function markNoticesRead() {
  const user = await getUser()
  if (!user) return
  await db.notice.updateMany({ where: { userId: user.id, channel: "IN_APP" }, data: { read: true } })
  redirect("/notices")
}

export async function updateProfile(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const user = await getUser()
  if (!user) redirect("/login")
  const name = clean(formData.get("name"))
  const phone = clean(formData.get("phone"))
  const password = clean(formData.get("password"))
  if (name.length < 2) return { error: "Add your name." }
  await db.user.update({
    where: { id: user.id },
    data: {
      name,
      phone,
      ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
    },
  })
  redirect("/profile")
}

export async function applyPartner(_prev: AuthState, formData: FormData): Promise<AuthState> {
  try {
    const name = clean(formData.get("owner"))
    const email = clean(formData.get("email")).toLowerCase()
    const phone = clean(formData.get("phone"))
    const password = clean(formData.get("password"))
    const laundry = clean(formData.get("laundry"))
    const area = clean(formData.get("area"))
    const address = clean(formData.get("address"))
    if (!name || !laundry || !area || !address) throw new AppError("Fill in the laundry details.")
    if (!email.includes("@") || password.length < 6) throw new AppError("Add a valid email and a password of 6+ characters.")
    if (await db.user.findUnique({ where: { email } })) throw new AppError("That email is already registered.")
    const settings = await getSettings()
    const slugBase = laundry.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "laundry"
    let slug = slugBase
    if (await db.store.findUnique({ where: { slug } })) slug = `${slugBase}-${Math.floor(Math.random() * 900 + 100)}`
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: await bcrypt.hash(password, 10),
        role: "STORE",
        referralCode: `ST${Math.floor(10000 + Math.random() * 90000)}`,
        wallet: { create: { balance: 0 } },
        store: {
          create: {
            name: laundry,
            slug,
            area,
            address,
            phone,
            tagline: "New on Need Cox's",
            about: "",
            lat: 23.78,
            lng: 90.4,
            status: "PENDING",
            commissionRate: Number(settings.defaultCommission || 12),
            deliveryFee: Number(settings.defaultDeliveryFee || 60),
            hue: 250,
          },
        },
      },
      include: { store: true },
    })
    const slots = [
      ["09:00–11:00", "09:00", "11:00"],
      ["11:00–13:00", "11:00", "13:00"],
      ["15:00–17:00", "15:00", "17:00"],
      ["17:00–19:00", "17:00", "19:00"],
    ]
    if (user.store) {
      await db.timeSlot.createMany({
        data: slots.map(([label, startTime, endTime]) => ({
          storeId: user.store!.id,
          label,
          startTime,
          endTime,
        })),
      })
    }
    await setSession(user)
    redirect("/vendor")
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error
    return { error: error instanceof AppError ? error.message : "Could not submit the laundry." }
  }
}
