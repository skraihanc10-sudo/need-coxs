export function homeFor(role: string) {
  if (role === "ADMIN") return "/admin"
  if (role === "STORE") return "/vendor"
  if (role === "DELIVERY") return "/rider"
  return "/"
}

export function routeRole(pathname: string) {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "ADMIN"
  if (pathname === "/vendor" || pathname.startsWith("/vendor/")) return "STORE"
  if (pathname === "/rider" || pathname.startsWith("/rider/")) return "DELIVERY"
  const customer = [
    "/orders",
    "/wallet",
    "/checkout",
    "/profile",
    "/notices",
    "/pay",
    "/cart",
    "/chat",
    "/hub/jobs",
    "/help",
  ]
  if (customer.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return "CUSTOMER"
  return null
}

export function safeNext(role: string, next: string) {
  if (!next.startsWith("/") || next.startsWith("//")) return homeFor(role)
  const needed = routeRole(next)
  if (needed && needed !== role) return homeFor(role)
  return next
}
