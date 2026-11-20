import type { Locale } from "./format"

export const STATUS_LABEL: Record<string, { en: string; bn: string }> = {
  PENDING: { en: "Placed", bn: "অর্ডার হয়েছে" },
  ACCEPTED: { en: "Accepted", bn: "গ্রহণ করা হয়েছে" },
  PICKUP_ASSIGNED: { en: "Pickup assigned", bn: "পিকআপ নিযুক্ত" },
  PICKED_UP: { en: "Picked up", bn: "তোলা হয়েছে" },
  PROCESSING: { en: "Processing", bn: "প্রসেসিং" },
  ON_HOLD: { en: "On hold", bn: "অপেক্ষমাণ" },
  READY: { en: "Ready to deliver", bn: "ডেলিভারির জন্য প্রস্তুত" },
  OUT_FOR_DELIVERY: { en: "Out for delivery", bn: "ডেলিভারিতে বেরিয়েছে" },
  DELIVERED: { en: "Completed", bn: "সম্পন্ন" },
  CANCELLED: { en: "Cancelled", bn: "বাতিল" },
  REJECTED: { en: "Declined", bn: "প্রত্যাখ্যাত" },
}

export function statusLabel(status: string, locale: Locale) {
  const row = STATUS_LABEL[status]
  if (!row) return status
  return locale === "bn" ? row.bn : row.en
}

export const ADMIN_STATUS_OPTIONS = [
  { value: "PROCESSING", label: "Processing" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "READY", label: "Ready to Deliver" },
  { value: "DELIVERED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
]

export const FLOW = [
  "PENDING",
  "ACCEPTED",
  "PICKED_UP",
  "PROCESSING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
]

export function statusTone(status: string) {
  if (status === "DELIVERED") return "bg-emerald-100 text-emerald-800"
  if (status === "CANCELLED" || status === "REJECTED") return "bg-rose-100 text-rose-700"
  if (status === "ON_HOLD" || status === "PENDING") return "bg-amber-100 text-amber-800"
  if (status === "READY" || status === "OUT_FOR_DELIVERY") return "bg-sky-100 text-sky-800"
  return "bg-blue-100 text-blue-800"
}

export const AUDIENCES = [
  { id: "MEN", en: "Men", bn: "পুরুষ" },
  { id: "WOMEN", en: "Women", bn: "নারী" },
  { id: "KIDS", en: "Kids", bn: "শিশু" },
  { id: "OTHER", en: "Other", bn: "অন্যান্য" },
] as const
