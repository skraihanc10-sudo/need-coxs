export type Locale = "en" | "bn"

export function taka(amount: number, locale: Locale = "en") {
  const formatted = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount))
  return `৳${formatted}`
}

export function dhakaToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

export function dhakaDate(date: Date) {
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
  const today = dhakaToday()
  return Array.from({ length: n }, (_, i) => shiftDays(today, i))
}

export function recentDays(n: number) {
  const today = dhakaToday()
  return Array.from({ length: n }, (_, i) => shiftDays(today, i - (n - 1)))
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

export function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

export function mapsUrl(lat?: number | null, lng?: number | null, query?: string) {
  if (lat && lng) return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || "Dhaka")}`
}

export function isOpen(open: string, close: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date())
  const hh = parts.find((p) => p.type === "hour")?.value ?? "00"
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00"
  const cur = `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}`
  return cur >= open && cur < close
}

export const AREAS = [
  { name: "Gulshan", lat: 23.792, lng: 90.415 },
  { name: "Banani", lat: 23.794, lng: 90.406 },
  { name: "Baridhara", lat: 23.804, lng: 90.422 },
  { name: "Bashundhara", lat: 23.819, lng: 90.448 },
  { name: "Dhanmondi", lat: 23.746, lng: 90.374 },
  { name: "Lalmatia", lat: 23.754, lng: 90.368 },
  { name: "Mohammadpur", lat: 23.766, lng: 90.358 },
  { name: "Mirpur", lat: 23.807, lng: 90.368 },
  { name: "Uttara", lat: 23.876, lng: 90.398 },
  { name: "Tejgaon", lat: 23.762, lng: 90.393 },
  { name: "Old Dhaka", lat: 23.71, lng: 90.407 },
]

export function areaPoint(name: string) {
  return AREAS.find((a) => a.name === name) ?? { name: "Dhaka", lat: 23.78, lng: 90.4 }
}
