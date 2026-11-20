import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SignJWT, jwtVerify } from "jose"
import { db } from "./db"
import { authSecret } from "./secret"
import { homeFor } from "./roles"

export async function setSession(
  user: { id: string; role: string; name: string; email: string },
  days = 14,
) {
  const token = await new SignJWT({ role: user.role, name: user.name, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(authSecret())
  const jar = await cookies()
  jar.set("nc_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: days * 86400,
    secure: process.env.NODE_ENV === "production",
  })
}

export async function clearSession() {
  const jar = await cookies()
  jar.delete("nc_session")
}

export async function getUser() {
  const token = (await cookies()).get("nc_session")?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, authSecret())
    const id = String(payload.sub || "")
    if (!id) return null
    const user = await db.user.findUnique({
      where: { id },
      include: { store: true, rider: true, wallet: true },
    })
    if (!user || !user.active) return null
    return user
  } catch {
    return null
  }
}

export async function requireUser(roles: string[], nextPath = "/") {
  const user = await getUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`)
  if (!roles.includes(user.role)) redirect(homeFor(user.role))
  return user
}

export async function getLocale() {
  const value = (await cookies()).get("nc_locale")?.value
  return value === "bn" ? "bn" : "en"
}
