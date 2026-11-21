import { createHash, randomInt } from "node:crypto"
import { db } from "./db"
import { AppError } from "./errors"
import { normalisePhone } from "./format"
import { smsProvider } from "./sms"
import { brand } from "../theme/brand"

const TTL_MS = 5 * 60_000
const MAX_ATTEMPTS = 5

function hash(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}:${process.env.AUTH_SECRET ?? "dev"}`).digest("hex")
}

export function requirePhone(input: string) {
  const phone = normalisePhone(input)
  if (!phone) {
    throw new AppError(
      "সঠিক মোবাইল নম্বর দিন (০১ দিয়ে শুরু, ১১ সংখ্যা)।",
      "Enter a valid mobile number (11 digits, starting with 01).",
    )
  }
  return phone
}

/** Create a code and send it. While no live SMS provider is set, the code is the demo code. */
export async function sendOtp(rawPhone: string) {
  const phone = requirePhone(rawPhone)
  const provider = smsProvider()
  const code = provider.live ? String(randomInt(100000, 1000000)) : brand.demoOtp
  await db.otpCode.create({
    data: { phone, codeHash: hash(phone, code), expiresAt: new Date(Date.now() + TTL_MS) },
  })
  await provider.send(phone, `${brand.nameBn}: আপনার কোড ${code}। ৫ মিনিট কাজ করবে।`)
  return { phone, demo: !provider.live }
}

/** Check the newest unused code for this phone. Consumes it on success. */
export async function verifyOtp(rawPhone: string, code: string) {
  const phone = requirePhone(rawPhone)
  const row = await db.otpCode.findFirst({
    where: { phone, consumedAt: null },
    orderBy: { createdAt: "desc" },
  })
  if (!row || row.expiresAt < new Date()) {
    throw new AppError("কোডের মেয়াদ নেই। নতুন কোড পাঠান।", "That code has expired. Send a new one.")
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    throw new AppError("অনেকবার ভুল হয়েছে। নতুন কোড পাঠান।", "Too many wrong tries. Send a new code.")
  }
  if (row.codeHash !== hash(phone, code.trim())) {
    await db.otpCode.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } })
    throw new AppError("কোডটা মেলেনি। আবার দেখে লিখুন।", "That code is not right. Please check it.")
  }
  await db.otpCode.update({ where: { id: row.id }, data: { consumedAt: new Date() } })
  return phone
}
