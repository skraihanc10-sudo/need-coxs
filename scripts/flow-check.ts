import { PrismaClient } from "@prisma/client"
import { createOrderFromInput, transitionOrder } from "../src/lib/orders"

const db = new PrismaClient()

async function main() {
  const customer = await db.user.findUnique({ where: { email: "customer@needcoxs.test" } })
  const store = await db.store.findUnique({ where: { slug: "chandni-wash-house" } })
  const owner = await db.user.findUnique({ where: { email: "store@needcoxs.test" } })
  const riderUser = await db.user.findUnique({ where: { email: "rider@needcoxs.test" }, include: { rider: true } })
  const admin = await db.user.findUnique({ where: { email: "admin@needcoxs.test" } })
  const address = await db.address.findFirst({ where: { userId: customer!.id, isDefault: true } })
  const price = await db.price.findFirst({ where: { storeId: store!.id, active: true }, include: { item: true } })
  const slot = await db.timeSlot.findFirst({ where: { storeId: store!.id, active: true } })
  if (!customer || !store || !owner || !riderUser?.rider || !admin || !address || !price || !slot) {
    throw new Error("Seed is missing a record the flow needs")
  }
  const today = new Date()
  const iso = (offset: number) => {
    const date = new Date(today)
    date.setDate(date.getDate() + offset)
    return date.toISOString().slice(0, 10)
  }
  const order = await createOrderFromInput({
    customerId: customer.id,
    lines: [{ priceId: price.id, quantity: 8 }],
    addressId: address.id,
    pickupDate: iso(1),
    pickupSlot: slot.label,
    deliveryDate: iso(3),
    deliverySlot: slot.label,
    preference: "Regular",
    notes: "Flow check",
    useWallet: false,
    paymentMethod: "COD",
  })
  await transitionOrder({ orderId: order.id, actorId: owner.id, to: "ACCEPTED" })
  await transitionOrder({ orderId: order.id, actorId: owner.id, to: "PICKUP_ASSIGNED", riderProfileId: riderUser.rider.id })
  await transitionOrder({ orderId: order.id, actorId: riderUser.id, to: "PICKED_UP" })
  await transitionOrder({ orderId: order.id, actorId: admin.id, to: "PROCESSING" })
  await transitionOrder({ orderId: order.id, actorId: admin.id, to: "READY" })
  await transitionOrder({ orderId: order.id, actorId: riderUser.id, to: "DELIVERED" })
  const done = await db.order.findUnique({ where: { id: order.id } })
  if (done?.status !== "DELIVERED" || !done.commissionAmt || done.paymentStatus !== "COLLECTED") {
    throw new Error(`Flow ended in an unexpected state: ${JSON.stringify(done)}`)
  }
  await db.payment.deleteMany({ where: { orderId: order.id } })
  await db.orderEvent.deleteMany({ where: { orderId: order.id } })
  await db.orderItem.deleteMany({ where: { orderId: order.id } })
  await db.order.delete({ where: { id: order.id } })
  await db.notice.deleteMany({ where: { body: { contains: order.code } } })
  console.log(`Flow check passed for ${order.code}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
