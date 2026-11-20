import { db } from "./db"
import { getLocale, getUser } from "./auth"

export async function getViewer() {
  const [user, locale] = await Promise.all([getUser(), getLocale()])
  let cartCount = 0
  let address: { area: string; lat: number | null; lng: number | null } | null = null
  if (user?.role === "CUSTOMER") {
    const [items, found] = await Promise.all([
      db.cartItem.findMany({ where: { userId: user.id } }),
      db.address.findFirst({
        where: { userId: user.id },
        orderBy: [{ isDefault: "desc" }, { id: "asc" }],
      }),
    ])
    cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
    address = found ? { area: found.area, lat: found.lat, lng: found.lng } : null
  }
  return { user, locale, cartCount, address }
}

export async function getCart(userId: string) {
  const items = await db.cartItem.findMany({
    where: { userId },
    include: { price: { include: { item: true, kind: true, store: true } } },
    orderBy: { id: "asc" },
  })
  const store = items[0]?.price.store ?? null
  const subtotal = items.reduce((sum, item) => sum + item.price.amount * item.quantity, 0)
  return { items, store, subtotal }
}
