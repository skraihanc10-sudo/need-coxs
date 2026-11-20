export const DEV_SECRET = "need-coxs-dev-secret-change-in-production"

export function authSecret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || DEV_SECRET)
}
