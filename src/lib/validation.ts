import { z } from "zod"
import { AppError } from "./errors"

/**
 * zod schemas for every form. Messages are "Bangla|English"; `parse` splits
 * them into an AppError so the user sees the message in their language.
 */
const msg = (bn: string, en: string) => ({ message: `${bn}|${en}` })

export function parse<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input)
  if (result.success) return result.data
  const first = result.error.issues[0]
  const [bn, en] = (first?.message ?? "").split("|")
  if (bn && en) throw new AppError(bn, en)
  throw new AppError("ফর্মের তথ্যগুলো আবার দেখুন।", "Please check the form.")
}

/** FormData → plain object (repeated keys become arrays). */
export function formObject(form: FormData) {
  const out: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {}
  for (const [key, value] of form.entries()) {
    const prev = out[key]
    if (prev === undefined) out[key] = value
    else out[key] = Array.isArray(prev) ? [...prev, value] : [prev, value]
  }
  return out
}

const text = (max: number) => z.string().trim().max(max, msg(`সর্বোচ্চ ${max} অক্ষর লিখুন।`, `Keep it under ${max} characters.`))
const optionalText = (max: number) => z.preprocess((v) => (v == null ? "" : v), text(max))
const id = z.string().trim().min(1, msg("একটা অপশন বেছে নিন।", "Choose an option.")).max(40)
const int = (min: number, max: number, bn: string, en: string) =>
  z.coerce.number().int(msg(bn, en)).min(min, msg(bn, en)).max(max, msg(bn, en))
const iso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, msg("একটা তারিখ বেছে নিন।", "Choose a date."))

export const phoneInput = z.string().trim().min(10, msg("মোবাইল নম্বর দিন।", "Enter your mobile number.")).max(20)

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, msg("ইমেইল বা মোবাইল নম্বর দিন।", "Enter your email or mobile number.")).max(120),
  password: z.string().min(1, msg("পাসওয়ার্ড দিন।", "Enter your password.")).max(200),
  next: optionalText(300),
})

export const otpSchema = z.object({
  phone: phoneInput,
  code: z.string().trim().regex(/^\d{6}$/, msg("৬ সংখ্যার কোডটা দিন।", "Enter the 6-digit code.")),
  name: optionalText(80),
  next: optionalText(300),
})

export const bookingSchema = z.object({
  offeringId: id,
  areaId: z.string().trim().max(60),
  addressLine: z.string().trim().min(4, msg("পুরো ঠিকানা লিখুন (বাড়ি, রোড)।", "Add your full address (house, road).")).max(200),
  landmark: optionalText(120),
  phone: phoneInput,
  contactName: optionalText(80),
  visitDate: iso,
  visitSlot: z.string().trim().min(1, msg("একটা সময় বেছে নিন।", "Choose a time slot.")).max(20),
  notes: optionalText(1000),
  quantity: z.coerce.number().min(0.5, msg("পরিমাণ দিন।", "Enter the quantity.")).max(500, msg("পরিমাণ ৫০০-এর কম দিন।", "Quantity must be under 500.")).default(1),
  teamSize: int(1, 20, "টিমে ১ থেকে ২০ জন দিন।", "Team size must be 1–20.").default(1),
  days: int(1, 30, "১ থেকে ৩০ দিন দিন।", "Days must be 1–30.").default(1),
  paymentMethod: z.enum(["CASH", "BKASH", "NAGAD"], msg("পেমেন্টের ধরন বেছে নিন।", "Choose how you'll pay.")),
  otp: optionalText(6),
  name: optionalText(80),
})

export const quoteSchema = z.object({
  code: z.string().trim().min(3).max(20),
  amount: int(50, 500000, "৫০ থেকে ৫,০০,০০০ টাকার মধ্যে দাম দিন।", "Enter a quote between ৳50 and ৳500,000."),
  note: optionalText(300),
})

export const rescheduleSchema = z.object({
  code: z.string().trim().min(3).max(20),
  visitDate: iso,
  visitSlot: z.string().trim().min(1, msg("একটা সময় বেছে নিন।", "Choose a time slot.")).max(20),
})

export const reviewSchema = z.object({
  code: z.string().trim().min(3).max(20),
  rating: int(1, 5, "১ থেকে ৫ তারা বেছে নিন।", "Choose 1 to 5 stars."),
  comment: z.string().trim().min(3, msg("ছোট করে লিখুন কেমন লাগল।", "Write a few words about the job.")).max(1000),
})

export const messageSchema = z.object({
  body: z.string().trim().min(1, msg("কিছু একটা লিখুন।", "Write a message.")).max(2000, msg("বার্তা ছোট করুন।", "Shorten the message.")),
})

export const ticketSchema = z.object({
  subject: z.string().trim().min(4, msg("বিষয়টা লিখুন।", "Add a subject.")).max(120),
  category: z.enum(["COMPLAINT", "REFUND", "WORKER", "OTHER"]).catch("OTHER"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).catch("NORMAL"),
  body: z.string().trim().min(5, msg("সমস্যাটা একটু লিখুন।", "Describe the problem.")).max(2000),
  bookingCode: optionalText(20),
})

export const categorySchema = z.object({
  id: optionalText(40),
  slug: z.string().trim().regex(/^[a-z0-9-]{2,40}$/, msg("স্লাগ ছোট হাতের ইংরেজি, সংখ্যা বা - দিয়ে লিখুন।", "Slug: lowercase letters, numbers and dashes.")),
  name: z.string().trim().min(2, msg("ইংরেজি নাম দিন।", "Add the English name.")).max(60),
  nameBn: z.string().trim().min(2, msg("বাংলা নাম দিন।", "Add the Bangla name.")).max(60),
  blurb: optionalText(200),
  blurbBn: optionalText(200),
  icon: optionalText(30),
  image: optionalText(200),
  flow: z.enum(["STANDARD", "LAUNDRY", "TEAM", "CUSTOM"]).catch("STANDARD"),
  sort: int(0, 999, "ক্রম ০–৯৯৯ দিন।", "Order must be 0–999.").default(0),
})

export const offeringSchema = z.object({
  id: optionalText(40),
  categoryId: id,
  slug: z.string().trim().regex(/^[a-z0-9-]{2,40}$/, msg("স্লাগ ছোট হাতের ইংরেজি, সংখ্যা বা - দিয়ে লিখুন।", "Slug: lowercase letters, numbers and dashes.")),
  name: z.string().trim().min(2, msg("ইংরেজি নাম দিন।", "Add the English name.")).max(80),
  nameBn: z.string().trim().min(2, msg("বাংলা নাম দিন।", "Add the Bangla name.")).max(80),
  detail: optionalText(300),
  detailBn: optionalText(300),
  pricing: z.enum(["FIXED", "PER_KG", "PER_ITEM", "PER_HOUR", "PER_ROOM", "QUOTE"], msg("দামের ধরন বেছে নিন।", "Choose a pricing type.")),
  price: int(0, 500000, "সঠিক দাম দিন।", "Enter a valid price."),
  minQty: int(1, 100, "সর্বনিম্ন পরিমাণ ১–১০০ দিন।", "Minimum must be 1–100.").default(1),
  durationMin: int(10, 10080, "সময় ১০ মিনিট থেকে ৭ দিনের মধ্যে দিন।", "Duration must be 10 min to 7 days.").default(60),
  sort: int(0, 999, "ক্রম ০–৯৯৯ দিন।", "Order must be 0–999.").default(0),
})

export const areaSchema = z.object({
  id: optionalText(40),
  slug: z.string().trim().regex(/^[a-z0-9-]{2,40}$/, msg("স্লাগ ছোট হাতের ইংরেজি দিয়ে লিখুন।", "Slug: lowercase letters, numbers and dashes.")),
  name: z.string().trim().min(2, msg("ইংরেজি নাম দিন।", "Add the English name.")).max(60),
  nameBn: z.string().trim().min(2, msg("বাংলা নাম দিন।", "Add the Bangla name.")).max(60),
  charge: int(0, 5000, "চার্জ ০–৫০০০ টাকা দিন।", "Charge must be ৳0–5000."),
  sort: int(0, 999, "ক্রম ০–৯৯৯ দিন।", "Order must be 0–999.").default(0),
})

export const workerSchema = z.object({
  id: optionalText(40),
  name: z.string().trim().min(2, msg("নাম দিন।", "Add the name.")).max(80),
  phone: phoneInput,
  email: z.union([z.literal(""), z.string().trim().email(msg("সঠিক ইমেইল দিন।", "Enter a valid email."))]).default(""),
  password: optionalText(100),
  nid: z.string().trim().regex(/^(\d{10}|\d{13}|\d{17})?$/, msg("NID ১০, ১৩ বা ১৭ সংখ্যার হয়।", "NID must be 10, 13 or 17 digits.")).default(""),
  isRider: z.preprocess((v) => v === "on" || v === "1" || v === true, z.boolean()),
  skills: z.array(z.string()).min(1, msg("অন্তত একটা দক্ষতা বেছে নিন।", "Pick at least one skill.")),
  areas: z.array(z.string()).default([]),
})

export const staffSchema = z.object({
  name: z.string().trim().min(2, msg("নাম দিন।", "Add the name.")).max(80),
  email: z.string().trim().email(msg("সঠিক ইমেইল দিন।", "Enter a valid email.")),
  phone: z.preprocess((v) => (v == null ? "" : v), z.string().trim().max(20)),
  password: z.string().min(6, msg("পাসওয়ার্ড অন্তত ৬ অক্ষরের দিন।", "Password must be at least 6 characters.")).max(100),
  role: z.enum(["SUPPORT", "ADMIN"]).catch("SUPPORT"),
})

export const profileSchema = z.object({
  name: z.string().trim().min(2, msg("নাম দিন।", "Add your name.")).max(80),
  email: z.union([z.literal(""), z.string().trim().email(msg("সঠিক ইমেইল দিন।", "Enter a valid email."))]).default(""),
  password: optionalText(100),
})

export const addressSchema = z.object({
  label: optionalText(30),
  areaId: z.string().trim().max(60),
  line: z.string().trim().min(4, msg("পুরো ঠিকানা লিখুন।", "Add the full address.")).max(200),
  landmark: optionalText(120),
  phone: phoneInput,
})

export const faqSchema = z.object({
  id: optionalText(40),
  question: z.string().trim().min(3).max(200),
  questionBn: z.string().trim().min(3, msg("বাংলা প্রশ্ন দিন।", "Add the Bangla question.")).max(200),
  answer: z.string().trim().min(3).max(1000),
  answerBn: z.string().trim().min(3, msg("বাংলা উত্তর দিন।", "Add the Bangla answer.")).max(1000),
  sort: int(0, 999, "ক্রম ০–৯৯৯ দিন।", "Order must be 0–999.").default(0),
})

export const templateSchema = z.object({
  id: optionalText(40),
  title: z.string().trim().min(2, msg("শিরোনাম দিন।", "Add a title.")).max(60),
  body: z.string().trim().min(3, msg("উত্তরটা লিখুন।", "Write the reply.")).max(1000),
  sort: int(0, 999, "ক্রম ০–৯৯৯ দিন।", "Order must be 0–999.").default(0),
})
