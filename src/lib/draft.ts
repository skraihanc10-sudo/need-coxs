import { cookies } from "next/headers"

export type Draft = {
  addressId?: string
  pickupDate?: string
  pickupSlot?: string
  deliveryDate?: string
  deliverySlot?: string
  preference?: string
  useWallet?: boolean
  coupon?: string
  notes?: string
}

const KEY = "nc_draft"

export async function getDraft(): Promise<Draft> {
  const raw = (await cookies()).get(KEY)?.value
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Draft
  } catch {
    return {}
  }
}

export async function setDraft(draft: Draft) {
  const jar = await cookies()
  jar.set(KEY, JSON.stringify(draft), { path: "/", maxAge: 60 * 60 * 24, sameSite: "lax" })
}

export async function clearDraft() {
  const jar = await cookies()
  jar.delete(KEY)
}
