"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { AppError } from "@/lib/errors"
import { run, type ActionState } from "@/lib/action"
import { actor, clearSession, clientIp, getUser, LOCALE_COOKIE, setSession } from "@/lib/auth"
import { homeFor, safeNext } from "@/lib/roles"
import { limited } from "@/lib/rate-limit"
import { normalisePhone } from "@/lib/format"
import { sendOtp, verifyOtp } from "@/lib/otp"
import { formObject, loginSchema, otpSchema, parse, phoneInput, profileSchema, addressSchema } from "@/lib/validation"
import { sadarArea } from "@/lib/bookings"

export async function loginAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const input = parse(loginSchema, formObject(form))
  const found: { user?: { id: string; role: string; name: string } } = {}
  const state = await run(async () => {
    limited("login", await clientIp())
    const phone = normalisePhone(input.identifier)
    const row = await db.user.findFirst({
      where: phone ? { phone } : { email: input.identifier.toLowerCase() },
    })
    const bad = new AppError("ইমেইল/মোবাইল বা পাসওয়ার্ড ঠিক নেই।", "Email/mobile or password is not right.")
    if (!row || !row.passwordHash) throw bad
    if (!(await bcrypt.compare(input.password, row.passwordHash))) throw bad
    if (!row.active) throw new AppError("এই অ্যাকাউন্টটা বন্ধ আছে। হেল্পলাইনে কল দিন।", "This account is disabled. Please call the helpline.")
    found.user = row
  })
  if (!state.ok || !found.user) return state
  await setSession(found.user)
  redirect(safeNext(found.user.role, input.next || homeFor(found.user.role)))
}

export async function sendOtpAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const phone = parse(phoneInput, form.get("phone") ?? "")
  return run(async () => {
    limited("otpSend", `${await clientIp()}:${normalisePhone(phone)}`)
    const sent = await sendOtp(phone)
    return sent.demo ? "ডেমো কোড: 123456" : "কোড পাঠানো হয়েছে।"
  })
}

/** Phone + OTP sign-in. Creates the customer on first use. */
export async function verifyOtpAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const input = parse(otpSchema, formObject(form))
  const found: { user?: { id: string; role: string; name: string } } = {}
  const state = await run(async () => {
    limited("otpVerify", await clientIp())
    const phone = await verifyOtp(input.phone, input.code)
    found.user = await customerByPhone(phone, input.name)
  })
  if (!state.ok || !found.user) return state
  await setSession(found.user)
  redirect(safeNext(found.user.role, input.next || "/"))
}

/** Find or create the customer who owns this verified phone. */
export async function customerByPhone(phone: string, name: string) {
  const existing = await db.user.findUnique({ where: { phone } })
  if (existing) {
    if (!existing.active) throw new AppError("এই অ্যাকাউন্টটা বন্ধ আছে। হেল্পলাইনে কল দিন।", "This account is disabled. Please call the helpline.")
    return existing
  }
  return db.user.create({ data: { phone, name: name.trim() || `গ্রাহক ${phone.slice(-4)}`, role: "CUSTOMER" } })
}

export async function logoutAction() {
  await clearSession()
  redirect("/login")
}

export async function setLocaleAction(form: FormData) {
  const locale = form.get("locale") === "en" ? "en" : "bn"
  const back = String(form.get("back") ?? "/")
  const jar = await cookies()
  jar.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" })
  redirect(back.startsWith("/") && !back.startsWith("//") ? back : "/")
}

export async function updateProfileAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["CUSTOMER", "WORKER", "SUPPORT", "ADMIN"])
    const input = parse(profileSchema, formObject(form))
    if (input.email) {
      const taken = await db.user.findFirst({ where: { email: input.email.toLowerCase(), NOT: { id: user.id } } })
      if (taken) throw new AppError("এই ইমেইল অন্য অ্যাকাউন্টে আছে।", "That email belongs to another account.")
    }
    if (input.password && input.password.length < 6) throw new AppError("পাসওয়ার্ড অন্তত ৬ অক্ষরের দিন।", "Password must be at least 6 characters.")
    await db.user.update({
      where: { id: user.id },
      data: {
        name: input.name,
        email: input.email ? input.email.toLowerCase() : user.email,
        ...(input.password ? { passwordHash: await bcrypt.hash(input.password, 10) } : {}),
      },
    })
    return "প্রোফাইল সেভ হয়েছে।"
  })
}

export async function saveAddressAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["CUSTOMER"])
    const input = parse(addressSchema, formObject(form))
    const area = await sadarArea(input.areaId)
    const phone = normalisePhone(input.phone)
    if (!phone) throw new AppError("সঠিক মোবাইল নম্বর দিন।", "Enter a valid mobile number.")
    const count = await db.address.count({ where: { userId: user.id } })
    if (count >= 5) throw new AppError("সর্বোচ্চ ৫টা ঠিকানা রাখা যায়।", "You can keep up to 5 addresses.")
    await db.address.create({
      data: { userId: user.id, label: input.label || "বাসা", areaId: area.id, line: input.line, landmark: input.landmark, phone, isDefault: count === 0 },
    })
    return "ঠিকানা সেভ হয়েছে।"
  })
}

export async function deleteAddressAction(form: FormData) {
  const user = await getUser()
  const id = String(form.get("id") ?? "")
  if (user && id) await db.address.deleteMany({ where: { id, userId: user.id } })
}

export async function markNoticesReadAction() {
  const user = await getUser()
  if (user) await db.notice.updateMany({ where: { userId: user.id, read: false }, data: { read: true } })
}
