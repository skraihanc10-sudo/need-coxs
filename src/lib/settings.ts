import { db } from "./db"
import { brand } from "../theme/brand"

/** Everything the admin can change from Settings. Stored as key/value rows. */
export const SETTING_DEFAULTS: Record<string, string> = {
  helpline: brand.supportPhone,
  whatsapp: brand.whatsapp,
  emergency: brand.emergencyPhone,
  supportEmail: brand.supportEmail,
  officeHours: "প্রতিদিন সকাল ৮টা – রাত ১০টা",
  officeHoursEn: "Every day, 8 am – 10 pm",
  address: brand.addressBn,
  addressEn: brand.address,
  bannerBn: "কক্সবাজার সদরে ঘরে বসেই সব সেবা: লন্ড্রি, ইলেকট্রিশিয়ান, প্লাম্বার, ক্লিনিং আর আরও অনেক কিছু।",
  bannerEn: "Every home service in Cox's Bazar Sadar: laundry, electricians, plumbers, cleaning and more.",
  /** Share of the final bill paid to the worker who did the job, in percent. */
  workerShare: "40",
  payCash: "1",
  payBkash: "1",
  payNagad: "1",
}

export const SETTING_KEYS = Object.keys(SETTING_DEFAULTS)

export async function getSettings() {
  const rows = await db.setting.findMany()
  const map = { ...SETTING_DEFAULTS }
  for (const row of rows) map[row.key] = row.value
  return map
}

export async function saveSettings(entries: Record<string, string>) {
  const known = Object.entries(entries).filter(([key]) => SETTING_KEYS.includes(key))
  await db.$transaction(
    known.map(([key, value]) =>
      db.setting.upsert({ where: { key }, update: { value }, create: { key, value } }),
    ),
  )
}
