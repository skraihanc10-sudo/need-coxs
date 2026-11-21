export type Locale = "en" | "bn"

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]

/** Swap ASCII digits for Bangla digits when the page is in Bangla. */
export function digits(value: string | number, locale: Locale = "bn") {
  const text = String(value)
  return locale === "bn" ? text.replace(/\d/g, (d) => BN_DIGITS[Number(d)]) : text
}

export function num(value: number, locale: Locale = "bn") {
  return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD", { maximumFractionDigits: 1 }).format(value)
}

export function taka(amount: number, locale: Locale = "bn") {
  const formatted = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount))
  return `৳${formatted}`
}

/** Today's date in Cox's Bazar (Asia/Dhaka), as YYYY-MM-DD. */
export function localToday() {
  return localDate(new Date())
}

export function localDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

export function shiftDays(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

export function upcomingDays(n = 7) {
  const today = localToday()
  return Array.from({ length: n }, (_, i) => shiftDays(today, i))
}

export function recentDays(n: number) {
  const today = localToday()
  return Array.from({ length: n }, (_, i) => shiftDays(today, i - (n - 1)))
}

/** Start of a local (Asia/Dhaka, UTC+6) day as a UTC Date. */
export function dayStart(iso: string) {
  return new Date(`${iso}T00:00:00+06:00`)
}

export function formatDay(iso: string, locale: Locale) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(Date.UTC(y, m - 1, d)))
}

export function formatWhen(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function formatTime(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    timeZone: "Asia/Dhaka",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function mapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query}, Cox's Bazar`)}`
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`
}

export function whatsappHref(phone: string, text = "") {
  let d = phone.replace(/\D/g, "")
  if (d.startsWith("01")) d = `88${d}`
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ""}`
}

/** Normalise a Bangladeshi mobile number to 01XXXXXXXXX, or return "". */
export function normalisePhone(input: string) {
  let d = input.replace(/[০-৯]/g, (c) => String(BN_DIGITS.indexOf(c))).replace(/\D/g, "")
  if (d.startsWith("880")) d = d.slice(2)
  else if (d.startsWith("88")) d = d.slice(2)
  return /^01[3-9]\d{8}$/.test(d) ? d : ""
}
