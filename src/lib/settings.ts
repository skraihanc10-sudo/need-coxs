import { db } from "./db"
import { brand } from "../theme/brand"

export const SETTING_DEFAULTS: Record<string, string> = {
  siteName: brand.name,
  supportPhone: brand.supportPhone,
  supportEmail: brand.supportEmail,
  address: brand.address,
  city: brand.city,
  currency: brand.currency,
  defaultCommission: "12",
  defaultDeliveryFee: "60",
  riderFee: "80",
  referralBonus: "50",
  notifyInApp: "1",
  notifyEmail: "0",
  notifySms: "0",
  notifyPush: "0",
  payCod: "1",
  payBkash: "1",
  paySsl: "1",
  payStripe: "1",
  fcmKey: "",
}

export async function getSettings() {
  const rows = await db.setting.findMany()
  const map = { ...SETTING_DEFAULTS }
  for (const row of rows) map[row.key] = row.value
  return map
}

export async function saveSettings(entries: Record<string, string>) {
  await db.$transaction(
    Object.entries(entries).map(([key, value]) =>
      db.setting.upsert({ where: { key }, update: { value }, create: { key, value } }),
    ),
  )
}
