export const DEV_SECRET = "need-coxs-dev-secret-change-in-production"

export function authSecret() {
  const value = process.env.AUTH_SECRET
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET is required in production")
    }
    return new TextEncoder().encode(DEV_SECRET)
  }
  if (process.env.NODE_ENV === "production" && value.length < 16) {
    throw new Error("AUTH_SECRET must be at least 16 characters in production")
  }
  return new TextEncoder().encode(value)
}
