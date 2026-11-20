import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { authSecret } from "@/lib/secret"
import { homeFor, routeRole } from "@/lib/roles"

function externalOrigin(request: NextRequest) {
  const configured = process.env.AUTH_URL || process.env.SITE_URL
  if (configured) return configured.replace(/\/$/, "")
  if (process.env.AUTH_TRUST_HOST === "true") {
    const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
    const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || request.headers.get("host")
    if (proto && host) return `${proto}://${host}`
  }
  return request.nextUrl.origin
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const needed = routeRole(pathname)
  if (!needed) return NextResponse.next()

  const token = request.cookies.get("nc_session")?.value
  const login = new URL("/login", externalOrigin(request))
  login.searchParams.set("next", pathname)
  if (!token) return NextResponse.redirect(login)

  let secret: Uint8Array
  try {
    secret = authSecret()
  } catch (error) {
    console.error(error)
    return new NextResponse("AUTH_SECRET is required in production", { status: 500 })
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    const role = String(payload.role || "")
    if (role !== needed) {
      return NextResponse.redirect(new URL(homeFor(role), externalOrigin(request)))
    }
    return NextResponse.next()
  } catch {
    const url = new URL("/login", externalOrigin(request))
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
