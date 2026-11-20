import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { authSecret } from "@/lib/secret"
import { homeFor, routeRole } from "@/lib/roles"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const needed = routeRole(pathname)
  if (!needed) return NextResponse.next()

  const token = request.cookies.get("nc_session")?.value
  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  try {
    const { payload } = await jwtVerify(token, authSecret())
    const role = String(payload.role || "")
    if (role !== needed) {
      return NextResponse.redirect(new URL(homeFor(role), request.url))
    }
    return NextResponse.next()
  } catch {
    const url = new URL("/login", request.url)
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/vendor",
    "/vendor/:path*",
    "/rider",
    "/rider/:path*",
    "/orders",
    "/orders/:path*",
    "/wallet",
    "/wallet/:path*",
    "/checkout",
    "/checkout/:path*",
    "/profile",
    "/profile/:path*",
    "/notices",
    "/notices/:path*",
    "/pay",
    "/pay/:path*",
    "/cart",
    "/cart/:path*",
    "/chat",
    "/chat/:path*",
  ],
}
