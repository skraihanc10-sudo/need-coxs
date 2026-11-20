import { db } from "./db"
import { AppError } from "./errors"
import { notify } from "./notify"
import { upcomingDays } from "./format"
import { brand } from "@/theme/brand"

const NEXT: Record<string, string[]> = {
  PENDING: ["ACCEPTED", "REJECTED", "CANCELLED", "PICKUP_ASSIGNED", "PROCESSING", "ON_HOLD"],
  ACCEPTED: ["PICKUP_ASSIGNED", "CANCELLED", "REJECTED", "PROCESSING", "ON_HOLD"],
  PICKUP_ASSIGNED: ["PICKED_UP", "CANCELLED", "PROCESSING", "ON_HOLD"],
  PICKED_UP: ["PROCESSING", "ON_HOLD", "READY", "CANCELLED"],
  PROCESSING: ["ON_HOLD", "READY", "CANCELLED", "DELIVERED"],
  ON_HOLD: ["PROCESSING", "READY", "CANCELLED"],
  READY: ["OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "ON_HOLD"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
}

export type OrderInput = {
  customerId: string
  lines: { priceId: string; quantity: number }[]
  addressId: string
  pickupDate: string
  pickupSlot: string
  deliveryDate: string
  deliverySlot: string
  preference: string
  notes: string
  couponCode?: string
  useWallet: boolean
  paymentMethod: string
}

export async function createOrderFromInput(input: OrderInput) {
  if (!input.lines.length) throw new AppError("Your bag is empty.")
  const days = upcomingDays(10)
  if (!days.includes(input.pickupDate)) throw new AppError("Choose a pickup date.")
  if (input.deliveryDate < input.pickupDate) throw new AppError("Delivery has to be on or after pickup.")

  return db.$transaction(async (tx) => {
    const address = await tx.address.findFirst({
      where: { id: input.addressId, userId: input.customerId },
    })
    if (!address) throw new AppError("Choose a delivery address.")

    const prices = await tx.price.findMany({
      where: { id: { in: input.lines.map((line) => line.priceId) }, active: true },
      include: { item: true, kind: true, store: true },
    })
    if (prices.length !== input.lines.length) throw new AppError("A price changed. Refresh the bag and try again.")
    const storeIds = new Set(prices.map((price) => price.storeId))
    if (storeIds.size !== 1) throw new AppError("A bag can only hold clothes from one laundry.")
    const store = prices[0].store
    if (store.status !== "APPROVED") throw new AppError("This laundry is not taking orders.")

    const qty = new Map(input.lines.map((line) => [line.priceId, line.quantity]))
    let subtotal = 0
    const items = prices.map((price) => {
      const quantity = Math.min(30, Math.max(1, qty.get(price.id) || 1))
      subtotal += price.amount * quantity
      return {
        name: price.item.name,
        kind: price.kind.name,
        unit: price.item.unit,
        price: price.amount,
        quantity,
      }
    })
    if (subtotal < store.minOrder) throw new AppError(`Minimum order is ৳${store.minOrder}.`)

    for (const label of [input.pickupSlot, input.deliverySlot]) {
      const slot = await tx.timeSlot.findFirst({
        where: { storeId: store.id, label, active: true },
      })
      if (!slot) throw new AppError("Choose a time slot the laundry still offers.")
    }
    const used = await tx.order.count({
      where: {
        storeId: store.id,
        pickupDate: input.pickupDate,
        pickupSlot: input.pickupSlot,
        status: { notIn: ["CANCELLED", "REJECTED"] },
      },
    })
    const pickup = await tx.timeSlot.findFirst({
      where: { storeId: store.id, label: input.pickupSlot, active: true },
    })
    if (pickup && used >= pickup.capacity) throw new AppError("That pickup slot is full.")

    let discount = 0
    let couponId: string | null = null
    let couponCode: string | null = null
    if (input.couponCode) {
      const coupon = await tx.coupon.findUnique({
        where: { code: input.couponCode.trim().toUpperCase() },
      })
      if (!coupon || !coupon.active) throw new AppError("That promo code is not active.")
      if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new AppError("That promo code has expired.")
      if (coupon.storeId && coupon.storeId !== store.id) throw new AppError("That promo code is for another laundry.")
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new AppError("That promo code has been used up.")
      if (subtotal < coupon.minOrder) throw new AppError(`Add more to use this code (minimum ৳${coupon.minOrder}).`)
      discount = coupon.type === "PERCENT" ? Math.round((subtotal * coupon.value) / 100) : coupon.value
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
      discount = Math.min(discount, subtotal)
      couponId = coupon.id
      couponCode = coupon.code
    }

    const gross = subtotal + store.deliveryFee - discount
    let walletUsed = 0
    if (input.useWallet) {
      const wallet = await tx.wallet.findUnique({ where: { userId: input.customerId } })
      walletUsed = Math.min(wallet?.balance ?? 0, Math.max(0, gross))
    }
    const total = Math.max(0, gross - walletUsed)
    let method = input.paymentMethod
    let paymentStatus = method === "COD" ? "COD_DUE" : "PENDING"
    if (total === 0) {
      method = "WALLET"
      paymentStatus = "PAID"
    }

    let code = ""
    for (let i = 0; i < 6; i++) {
      const candidate = `NC-${Math.floor(10000 + Math.random() * 90000)}`
      const exists = await tx.order.findUnique({ where: { code: candidate } })
      if (!exists) {
        code = candidate
        break
      }
    }
    if (!code) throw new AppError("Could not reserve an order number. Try again.")

    const order = await tx.order.create({
      data: {
        code,
        customerId: input.customerId,
        storeId: store.id,
        addressId: address.id,
        addressSnapshot: JSON.stringify({
          label: address.label,
          line1: address.line1,
          area: address.area,
          city: address.city,
          phone: address.phone,
          lat: address.lat,
          lng: address.lng,
        }),
        pickupDate: input.pickupDate,
        pickupSlot: input.pickupSlot,
        deliveryDate: input.deliveryDate,
        deliverySlot: input.deliverySlot,
        status: "PENDING",
        paymentMethod: method,
        paymentStatus,
        subtotal,
        deliveryFee: store.deliveryFee,
        discount,
        walletUsed,
        total,
        couponId,
        couponCode,
        preference: input.preference || "Regular",
        notes: input.notes || "",
        commissionRate: store.commissionRate,
        items: { create: items },
        events: { create: { status: "PENDING", note: "Order placed", actorId: input.customerId } },
        payment: {
          create: {
            provider: method,
            amount: total,
            status: paymentStatus,
            detail: method === "COD" ? "Collect from the customer on delivery." : "Waiting for the gateway adapter.",
          },
        },
      },
    })

    if (couponId) {
      await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } })
    }
    if (walletUsed > 0) {
      await tx.wallet.update({
        where: { userId: input.customerId },
        data: { balance: { decrement: walletUsed } },
      })
      await tx.walletTxn.create({
        data: {
          userId: input.customerId,
          amount: -walletUsed,
          type: "DEBIT",
          note: `Used on ${code}`,
        },
      })
    }

    return order
  }).then(async (order) => {
    const full = await db.order.findUnique({
      where: { id: order.id },
      include: { store: true, customer: true },
    })
    if (full) {
      await notify(full.customerId, brand.name, `Order ${full.code} is placed with ${full.store.name}.`)
      await notify(full.store.ownerId, brand.name, `New order ${full.code} is waiting.`)
    }
    return order
  })
}

async function loadActor(actorId: string) {
  const actor = await db.user.findUnique({
    where: { id: actorId },
    include: { store: true, rider: true },
  })
  if (!actor || !actor.active) throw new AppError("Account not found.")
  return actor
}

export async function transitionOrder(opts: {
  orderId: string
  actorId: string
  to: string
  note?: string
  riderProfileId?: string
}) {
  const actor = await loadActor(opts.actorId)
  const order = await db.order.findUnique({ where: { id: opts.orderId }, include: { store: true } })
  if (!order) throw new AppError("Order not found.")

  if (actor.role === "CUSTOMER") {
    if (order.customerId !== actor.id) throw new AppError("This is not your order.")
    if (opts.to !== "CANCELLED") throw new AppError("You can only cancel.")
    if (!["PENDING", "ACCEPTED", "PICKUP_ASSIGNED"].includes(order.status)) {
      throw new AppError("This order is already with the laundry.")
    }
  } else if (actor.role === "STORE") {
    if (actor.store?.id !== order.storeId) throw new AppError("This order belongs to another laundry.")
  } else if (actor.role === "DELIVERY") {
    if (!actor.rider || order.riderId !== actor.rider.id) throw new AppError("This job is not assigned to you.")
    const expected = order.status === "PICKUP_ASSIGNED" ? "PICKED_UP" : order.status === "READY" || order.status === "OUT_FOR_DELIVERY" ? "DELIVERED" : ""
    if (opts.to !== expected) throw new AppError("That update is not available yet.")
  } else if (actor.role !== "ADMIN") {
    throw new AppError("Not allowed.")
  }

  if (actor.role !== "ADMIN" && actor.role !== "DELIVERY") {
    if (!NEXT[order.status]?.includes(opts.to)) throw new AppError("That status change is not available.")
  }
  if (actor.role === "ADMIN" && !["PROCESSING", "ON_HOLD", "READY", "DELIVERED", "CANCELLED", "OUT_FOR_DELIVERY", "ACCEPTED", "PICKUP_ASSIGNED"].includes(opts.to)) {
    throw new AppError("Pick a status from the list.")
  }

  let riderId = order.riderId
  if (opts.riderProfileId) {
    const rider = await db.deliveryProfile.findUnique({
      where: { id: opts.riderProfileId },
      include: { user: true },
    })
    if (!rider || !rider.available) throw new AppError("That rider is not available.")
    if (rider.storeId && rider.storeId !== order.storeId) throw new AppError("That rider works for another laundry.")
    riderId = rider.id
  }
  if ((opts.to === "OUT_FOR_DELIVERY" || opts.to === "PICKUP_ASSIGNED") && !riderId) {
    throw new AppError("Assign a rider first.")
  }

  const data: {
    status: string
    riderId?: string | null
    cancelReason?: string
    commissionAmt?: number
    storeEarning?: number
    paymentStatus?: string
  } = { status: opts.to, riderId }
  if (opts.to === "CANCELLED" || opts.to === "REJECTED") data.cancelReason = opts.note || ""

  if (opts.to === "DELIVERED") {
    const base = Math.max(0, order.subtotal - order.discount)
    data.commissionAmt = Math.round((base * order.commissionRate) / 100)
    data.storeEarning = base - data.commissionAmt
    if (order.paymentMethod === "COD") data.paymentStatus = "COLLECTED"
    if (order.paymentMethod === "WALLET") data.paymentStatus = "PAID"
  }

  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id: order.id }, data })
    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        status: opts.to,
        note: opts.note || "",
        actorId: actor.id,
      },
    })
    if ((opts.to === "CANCELLED" || opts.to === "REJECTED") && order.walletUsed > 0 && order.status !== "DELIVERED") {
      await tx.wallet.update({
        where: { userId: order.customerId },
        data: { balance: { increment: order.walletUsed } },
      })
      await tx.walletTxn.create({
        data: {
          userId: order.customerId,
          amount: order.walletUsed,
          type: "CREDIT",
          note: `Refund for ${order.code}`,
        },
      })
    }
    if ((opts.to === "CANCELLED" || opts.to === "REJECTED") && order.couponId) {
      await tx.coupon.update({
        where: { id: order.couponId },
        data: { usedCount: { decrement: 1 } },
      })
    }
    if (opts.to === "DELIVERED" && data.paymentStatus) {
      await tx.payment.update({
        where: { orderId: order.id },
        data: { status: data.paymentStatus },
      })
    }
  })

  await notify(order.customerId, brand.name, `${order.code} is now ${opts.to.replaceAll("_", " ").toLowerCase()}.`)
  if (riderId && riderId !== order.riderId) {
    const rider = await db.deliveryProfile.findUnique({ where: { id: riderId } })
    if (rider) await notify(rider.userId, brand.name, `New job ${order.code} is assigned to you.`)
  }
  return db.order.findUnique({ where: { id: order.id } })
}

export async function storeBalance(storeId: string) {
  const earned = await db.order.aggregate({
    where: { storeId, status: "DELIVERED" },
    _sum: { storeEarning: true },
  })
  const held = await db.payout.aggregate({
    where: { storeId, status: { in: ["REQUESTED", "PAID"] } },
    _sum: { amount: true },
  })
  const net = earned._sum.storeEarning ?? 0
  const reserved = held._sum.amount ?? 0
  return { net, reserved, available: net - reserved }
}

export async function refreshStoreRating(storeId: string) {
  const agg = await db.review.aggregate({
    where: { storeId },
    _avg: { rating: true },
    _count: true,
  })
  await db.store.update({
    where: { id: storeId },
    data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count },
  })
}
