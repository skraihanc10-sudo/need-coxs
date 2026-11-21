export const ROLES = ["CUSTOMER", "WORKER", "SUPPORT", "ADMIN"] as const
export type Role = (typeof ROLES)[number]

export function homeFor(role: string) {
  if (role === "ADMIN") return "/admin"
  if (role === "SUPPORT") return "/support"
  if (role === "WORKER") return "/worker"
  return "/"
}

const CUSTOMER_PATHS = ["/bookings", "/care", "/notifications", "/profile", "/help/tickets"]

/** Which roles may open a path. `null` means the page is public. */
export function routeRoles(pathname: string): Role[] | null {
  const under = (p: string) => pathname === p || pathname.startsWith(`${p}/`)
  if (under("/admin")) return ["ADMIN"]
  if (under("/support")) return ["SUPPORT", "ADMIN"]
  if (under("/worker")) return ["WORKER"]
  if (CUSTOMER_PATHS.some(under)) return ["CUSTOMER"]
  return null
}

export function safeNext(role: string, next: string) {
  if (!next.startsWith("/") || next.startsWith("//")) return homeFor(role)
  const allowed = routeRoles(next)
  if (allowed && !allowed.includes(role as Role)) return homeFor(role)
  return next
}

export const ROLE_LABEL: Record<string, { bn: string; en: string }> = {
  CUSTOMER: { bn: "কাস্টমার", en: "Customer" },
  WORKER: { bn: "কর্মী", en: "Worker" },
  SUPPORT: { bn: "কাস্টমার কেয়ার", en: "Customer care" },
  ADMIN: { bn: "অ্যাডমিন", en: "Admin" },
}
