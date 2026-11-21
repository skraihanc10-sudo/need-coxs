import type { Locale } from "./format"

export const PRICING = ["FIXED", "PER_KG", "PER_ITEM", "PER_HOUR", "PER_ROOM", "QUOTE"] as const
export type Pricing = (typeof PRICING)[number]

export const PRICING_TEXT: Record<string, { bn: string; en: string; unitBn: string; unitEn: string }> = {
  FIXED: { bn: "নির্দিষ্ট দাম", en: "Fixed price", unitBn: "কাজ", unitEn: "job" },
  PER_KG: { bn: "প্রতি কেজি", en: "Per kg", unitBn: "কেজি", unitEn: "kg" },
  PER_ITEM: { bn: "প্রতি পিস", en: "Per item", unitBn: "পিস", unitEn: "item" },
  PER_HOUR: { bn: "প্রতি ঘণ্টা", en: "Per hour", unitBn: "ঘণ্টা", unitEn: "hour" },
  PER_ROOM: { bn: "প্রতি রুম", en: "Per room", unitBn: "রুম", unitEn: "room" },
  QUOTE: { bn: "দেখে দাম", en: "Inspect, then quote", unitBn: "পরিদর্শন", unitEn: "inspection" },
}

export function unitLabel(pricing: string, locale: Locale) {
  const row = PRICING_TEXT[pricing] ?? PRICING_TEXT.FIXED
  return locale === "bn" ? row.unitBn : row.unitEn
}

export function usesQuantity(pricing: string) {
  return ["PER_KG", "PER_ITEM", "PER_HOUR", "PER_ROOM"].includes(pricing)
}

export type EstimateInput = {
  pricing: string
  unitPrice: number
  quantity: number
  days: number
  areaCharge: number
}

/**
 * The price shown before booking. Team jobs bill rooms × days.
 * For inspection jobs the estimate is the inspection fee; the quote replaces it.
 */
export function estimate({ pricing, unitPrice, quantity, days, areaCharge }: EstimateInput) {
  let work = unitPrice
  if (usesQuantity(pricing)) work = Math.round(unitPrice * quantity * (pricing === "PER_ROOM" ? Math.max(1, days) : 1))
  return { work, areaCharge, total: work + areaCharge }
}

/** The amount the customer actually pays when the job closes. */
export function billFor(b: { pricing: string; estimatedPrice: number; visitCharge: number; quoteAmount: number | null; quoteStatus: string }) {
  if (b.pricing === "QUOTE" && b.quoteStatus === "ACCEPTED" && b.quoteAmount) return b.quoteAmount + b.visitCharge
  return b.estimatedPrice
}
