import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { SignJWT, jwtVerify } from "jose"
import { db } from "./db"
import { authSecret } from "./secret"
import { homeFor, type Role } from "./roles"
import { AppError } from "./errors"
import type { Locale } from "./format"

export const SESSION_COOKIE = "nc_session"
export const LOCALE_COOKIE = "nc_locale"

export async function setSession(user: { id: string; role: string; name: string }, days = 30) {
  const token = await new SignJWT({ role: user.role, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(authSecret())
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: days * 86400,
    secure: await sessionCookieSecure(),
  })
}

async function sessionCookieSecure() {
  const configured = process.env.AUTH_URL || process.env.SITE_URL || ""
  if (configured.startsWith("https://")) return true
  if (configured.startsWith("http://")) return false
  if (process.env.AUTH_TRUST_HOST === "true") {
    try {
      const forwarded = (await headers()).get("x-forwarded-proto")?.split(",")[0]?.trim()
      if (forwarded === "https") return true
      if (forwarded === "http") return false
    } catch {
      // headers() only works during a request
    }
  }
  return process.env.NODE_ENV === "production"
}

export async function clearSession() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}

export async function getUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, authSecret())
    const id = String(payload.sub || "")
    if (!id) return null
    const user = await db.user.findUnique({ where: { id }, include: { worker: true } })
    if (!user || !user.active) return null
    return user
  } catch {
    return null
  }
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getUser>>>

/** For pages: send strangers to /login and other roles to their own home. */
export async function requireUser(roles: Role[], nextPath = "/") {
  const user = await getUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`)
  if (!roles.includes(user.role as Role)) redirect(homeFor(user.role))
  return user
}

/** For server actions: throw a readable error instead of redirecting. */
export async function actor(roles: Role[]) {
  const user = await getUser()
  if (!user) throw new AppError("আগে লগইন করুন।", "Please sign in first.")
  if (!roles.includes(user.role as Role)) {
    throw new AppError("এই কাজের অনুমতি আপনার নেই।", "You are not allowed to do that.")
  }
  return user
}

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value
  return value === "en" ? "en" : "bn"
}

export async function clientIp() {
  try {
    const h = await headers()
    return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local"
  } catch {
    return "local"
  }
}
