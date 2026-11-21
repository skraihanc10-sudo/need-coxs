/**
 * The booking state machine. Every status change goes through `canMove`,
 * so a booking can never skip a step or go backwards.
 *
 * Standard visit:  REQUESTED → CONFIRMED → ASSIGNED → ACCEPTED → ON_THE_WAY → ARRIVED → IN_PROGRESS → COMPLETED
 * Laundry:         REQUESTED → CONFIRMED → ASSIGNED → ACCEPTED → PICKED_UP → AT_LAUNDRY → READY → OUT_FOR_DELIVERY → COMPLETED
 * Inspection jobs (pricing QUOTE) also need an accepted quote before IN_PROGRESS.
 * CONFIRMED is optional: the admin can assign a worker straight from REQUESTED.
 */
import type { Role } from "./roles"

export type Flow = "VISIT" | "LAUNDRY"

export const VISIT_STEPS = ["REQUESTED", "CONFIRMED", "ASSIGNED", "ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "COMPLETED"] as const
export const LAUNDRY_STEPS = ["REQUESTED", "CONFIRMED", "ASSIGNED", "ACCEPTED", "PICKED_UP", "AT_LAUNDRY", "READY", "OUT_FOR_DELIVERY", "COMPLETED"] as const

export const TERMINAL = ["COMPLETED", "CANCELLED"]

const VISIT_NEXT: Record<string, string[]> = {
  REQUESTED: ["CONFIRMED", "ASSIGNED", "CANCELLED"],
  CONFIRMED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["ON_THE_WAY", "CANCELLED"],
  ON_THE_WAY: ["ARRIVED", "CANCELLED"],
  ARRIVED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
}

const LAUNDRY_NEXT: Record<string, string[]> = {
  REQUESTED: ["CONFIRMED", "ASSIGNED", "CANCELLED"],
  CONFIRMED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["AT_LAUNDRY"],
  AT_LAUNDRY: ["READY"],
  READY: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["COMPLETED"],
}

/** Steps a worker presses on their phone, in order. */
const WORKER_MOVES = ["ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "PICKED_UP", "AT_LAUNDRY", "READY", "OUT_FOR_DELIVERY", "COMPLETED"]
/** The office can also move these (for example when a worker calls in). */
const OFFICE_MOVES = ["CONFIRMED", "ASSIGNED", "CANCELLED", ...WORKER_MOVES]

export function flowFor(categoryFlow: string): Flow {
  return categoryFlow === "LAUNDRY" ? "LAUNDRY" : "VISIT"
}

export function stepsFor(flow: Flow): readonly string[] {
  return flow === "LAUNDRY" ? LAUNDRY_STEPS : VISIT_STEPS
}

export function nextStatuses(flow: Flow, status: string) {
  return (flow === "LAUNDRY" ? LAUNDRY_NEXT : VISIT_NEXT)[status] ?? []
}

export function canMove(flow: Flow, from: string, to: string) {
  return nextStatuses(flow, from).includes(to)
}

export function roleMayMove(role: Role, to: string) {
  if (role === "WORKER") return WORKER_MOVES.includes(to)
  if (role === "ADMIN" || role === "SUPPORT") return OFFICE_MOVES.includes(to)
  if (role === "CUSTOMER") return to === "CANCELLED"
  return false
}

/** The single forward step a worker should see as the big button. */
export function workerNext(flow: Flow, status: string) {
  return nextStatuses(flow, status).find((s) => WORKER_MOVES.includes(s)) ?? null
}

/** Customers may cancel or reschedule only before anyone is on the way. */
export function customerCanChange(status: string) {
  return ["REQUESTED", "CONFIRMED", "ASSIGNED", "ACCEPTED"].includes(status)
}

export function isOpen(status: string) {
  return !TERMINAL.includes(status)
}

export const STATUS_TEXT: Record<string, { bn: string; en: string }> = {
  REQUESTED: { bn: "বুকিং হয়েছে", en: "Booked" },
  CONFIRMED: { bn: "নিশ্চিত হয়েছে", en: "Confirmed" },
  ASSIGNED: { bn: "কর্মী ঠিক হয়েছে", en: "Worker assigned" },
  ACCEPTED: { bn: "কর্মী গ্রহণ করেছেন", en: "Worker accepted" },
  ON_THE_WAY: { bn: "কর্মী রওনা দিয়েছেন", en: "Worker on the way" },
  ARRIVED: { bn: "কর্মী পৌঁছেছেন", en: "Worker arrived" },
  IN_PROGRESS: { bn: "কাজ চলছে", en: "Work in progress" },
  PICKED_UP: { bn: "কাপড় নেওয়া হয়েছে", en: "Picked up" },
  AT_LAUNDRY: { bn: "লন্ড্রিতে জমা", en: "At the laundry" },
  READY: { bn: "কাপড় রেডি", en: "Ready" },
  OUT_FOR_DELIVERY: { bn: "ডেলিভারিতে বেরিয়েছে", en: "Out for delivery" },
  COMPLETED: { bn: "সম্পন্ন", en: "Completed" },
  CANCELLED: { bn: "বাতিল", en: "Cancelled" },
}

/** What the worker's big button says for each forward step. */
export const WORKER_BUTTON: Record<string, { bn: string; en: string }> = {
  ACCEPTED: { bn: "জব গ্রহণ করুন", en: "Accept job" },
  ON_THE_WAY: { bn: "রওনা দিয়েছি", en: "I'm on the way" },
  ARRIVED: { bn: "পৌঁছেছি", en: "I've arrived" },
  IN_PROGRESS: { bn: "কাজ শুরু", en: "Start work" },
  COMPLETED: { bn: "কাজ শেষ", en: "Job done" },
  PICKED_UP: { bn: "কাপড় নিয়েছি", en: "Picked up" },
  AT_LAUNDRY: { bn: "লন্ড্রিতে জমা দিয়েছি", en: "Dropped at laundry" },
  READY: { bn: "কাপড় রেডি", en: "Clothes ready" },
  OUT_FOR_DELIVERY: { bn: "ডেলিভারিতে যাচ্ছি", en: "Out for delivery" },
}

export function statusText(status: string, locale: "bn" | "en") {
  const row = STATUS_TEXT[status]
  return row ? row[locale] : status
}

export function statusTone(status: string) {
  if (status === "COMPLETED") return "bg-emerald-100 text-emerald-800"
  if (status === "CANCELLED") return "bg-rose-100 text-rose-700"
  if (status === "REQUESTED" || status === "CONFIRMED") return "bg-amber-100 text-amber-800"
  if (status === "ASSIGNED" || status === "ACCEPTED") return "bg-violet-100 text-violet-800"
  return "bg-sky-100 text-sky-800"
}
