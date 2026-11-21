"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { run, type ActionState } from "@/lib/action"
import { actor, clientIp, getUser, setSession } from "@/lib/auth"
import { AppError } from "@/lib/errors"
import { normalisePhone } from "@/lib/format"
import { limited } from "@/lib/rate-limit"
import { verifyOtp } from "@/lib/otp"
import { saveImages } from "@/lib/uploads"
import type { Role } from "@/lib/roles"
import {
  addPhotos,
  answerQuote,
  assignWorker,
  createBooking,
  moveBooking,
  recordPayment,
  reschedule,
  reviewBooking,
  sendQuote,
  setPrice,
  setQuantity,
  setRefundNote,
} from "@/lib/bookings"
import { bookingSchema, formObject, parse, quoteSchema, rescheduleSchema, reviewSchema } from "@/lib/validation"
import { customerByPhone } from "./auth"

function code(form: FormData) {
  const value = String(form.get("code") ?? "").trim()
  if (!/^CS-\d{5}$/.test(value)) throw new AppError("বুকিং নম্বর ঠিক নেই।", "Bad booking number.")
  return value
}

/**
 * Place a booking. A signed-in customer books directly; a guest must include
 * the OTP they received, which also signs them in.
 */
export async function createBookingAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const input = parse(bookingSchema, formObject(form))
  const phone = normalisePhone(input.phone)
  if (!phone) return { ok: false, error: "সঠিক মোবাইল নম্বর দিন (০১ দিয়ে শুরু, ১১ সংখ্যা)।", at: Date.now() }
  const out: { created?: { code: string }; signedIn?: { id: string; role: string; name: string } } = {}
  const state = await run(async () => {
    limited("booking", await clientIp())
    let customer = await getUser()
    if (customer && customer.role !== "CUSTOMER") {
      throw new AppError("বুকিং দিতে কাস্টমার অ্যাকাউন্টে ঢুকুন।", "Please use a customer account to book.")
    }
    if (!customer) {
      if (!input.otp) throw new AppError("মোবাইলে পাঠানো কোডটা দিন।", "Enter the code we sent to your phone.")
      const verified = await verifyOtp(phone, input.otp)
      customer = { ...(await customerByPhone(verified, input.name || input.contactName)), worker: null }
      out.signedIn = customer
    }
    const photos = await saveImages(form.getAll("photos"), 4)
    const created = await createBooking(customer, { ...input, phone })
    if (photos.length) await addPhotos({ ...customer, role: "CUSTOMER" }, created.code, "CUSTOMER", photos)
    out.created = created
  })
  if (!state.ok || !out.created) return state
  if (out.signedIn) await setSession(out.signedIn)
  redirect(`/bookings/${out.created.code}?new=1`)
}

export async function moveBookingAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["CUSTOMER", "WORKER", "SUPPORT", "ADMIN"])
    const to = String(form.get("to") ?? "")
    await moveBooking({ ...user, role: user.role as Role }, code(form), to, String(form.get("note") ?? ""))
    revalidatePath("/", "layout")
  })
}

export async function assignWorkerAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["SUPPORT", "ADMIN"])
    await assignWorker({ ...user, role: user.role as Role }, code(form), String(form.get("workerId") ?? ""))
    revalidatePath("/", "layout")
    return "কর্মী ঠিক করা হয়েছে।"
  })
}

export async function sendQuoteAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["WORKER", "SUPPORT", "ADMIN"])
    const input = parse(quoteSchema, formObject(form))
    await sendQuote({ ...user, role: user.role as Role }, input.code, input.amount, input.note)
    revalidatePath("/", "layout")
    return "দাম পাঠানো হয়েছে। কাস্টমার মেনে নিলে জানানো হবে।"
  })
}

export async function answerQuoteAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["CUSTOMER"])
    await answerQuote({ ...user, role: "CUSTOMER" }, code(form), form.get("answer") === "accept")
    revalidatePath("/", "layout")
  })
}

export async function rescheduleAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["CUSTOMER", "SUPPORT", "ADMIN"])
    const input = parse(rescheduleSchema, formObject(form))
    await reschedule({ ...user, role: user.role as Role }, input.code, input.visitDate, input.visitSlot)
    revalidatePath("/", "layout")
    return "নতুন সময় সেভ হয়েছে।"
  })
}

export async function reviewAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["CUSTOMER"])
    const input = parse(reviewSchema, formObject(form))
    await reviewBooking({ ...user, role: "CUSTOMER" }, input.code, input.rating, input.comment)
    revalidatePath("/", "layout")
    return "রিভিউর জন্য ধন্যবাদ!"
  })
}

export async function setQuantityAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["WORKER", "SUPPORT", "ADMIN"])
    const quantity = Number(form.get("quantity"))
    await setQuantity({ ...user, role: user.role as Role }, code(form), quantity)
    revalidatePath("/", "layout")
    return "পরিমাণ আপডেট হয়েছে।"
  })
}

export async function setPriceAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["ADMIN"])
    await setPrice({ ...user, role: "ADMIN" }, code(form), Number(form.get("finalPrice")), String(form.get("note") ?? ""))
    revalidatePath("/", "layout")
    return "দাম আপডেট হয়েছে।"
  })
}

export async function refundNoteAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["SUPPORT", "ADMIN"])
    await setRefundNote({ ...user, role: user.role as Role }, code(form), String(form.get("note") ?? ""))
    revalidatePath("/", "layout")
    return "নোট সেভ হয়েছে।"
  })
}

export async function recordPaymentAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["WORKER", "SUPPORT", "ADMIN"])
    await recordPayment({ ...user, role: user.role as Role }, code(form), String(form.get("method") ?? ""), String(form.get("reference") ?? ""))
    revalidatePath("/", "layout")
    return "পেমেন্ট হিসাবে লেখা হয়েছে।"
  })
}

export async function uploadPhotosAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["WORKER", "ADMIN", "CUSTOMER"])
    const kind = String(form.get("kind") ?? "")
    if (kind !== "BEFORE" && kind !== "AFTER" && kind !== "CUSTOMER") throw new AppError("ছবির ধরন ঠিক নেই।", "Bad photo type.")
    const names = await saveImages(form.getAll("photos"))
    if (!names.length) throw new AppError("একটা ছবি বেছে নিন।", "Choose a photo.")
    await addPhotos({ ...user, role: user.role as Role }, code(form), kind, names)
    revalidatePath("/", "layout")
    return "ছবি যোগ হয়েছে।"
  })
}
