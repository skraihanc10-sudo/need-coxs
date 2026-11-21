import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { areas, categories, providers, sampleBookings } from "./catalog-data.mjs"

function tomorrow() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

export async function ensureMarketplace(existing) {
  const db = existing ?? new PrismaClient()
  const own = !existing
  try {
    const areaIds = new Map()
    for (const area of areas) {
      const row = await db.serviceArea.upsert({
        where: { slug: area.slug },
        update: {},
        create: area,
      })
      areaIds.set(area.slug, row.id)
    }

    const categoryIds = new Map()
    const offeringIds = new Map()
    for (const category of categories) {
      const { offerings, ...data } = category
      const row = await db.serviceCategory.upsert({
        where: { slug: category.slug },
        update: {},
        create: data,
      })
      categoryIds.set(category.slug, row.id)
      for (const offering of offerings) {
        const saved = await db.serviceOffering.upsert({
          where: { categoryId_slug: { categoryId: row.id, slug: offering.slug } },
          update: {},
          create: { ...offering, categoryId: row.id },
        })
        offeringIds.set(`${category.slug}:${offering.slug}`, saved)
      }
    }

    const laundryId = categoryIds.get("laundry")
    if (laundryId) {
      const laundries = await db.store.findMany({ where: { listing: "LAUNDRY" }, select: { id: true } })
      for (const store of laundries) {
        await db.providerCategory.upsert({
          where: { storeId_categoryId: { storeId: store.id, categoryId: laundryId } },
          update: {},
          create: { storeId: store.id, categoryId: laundryId },
        })
      }
    }

    for (const provider of providers) {
      let user = await db.user.findUnique({ where: { email: provider.email } })
      if (!user) {
        user = await db.user.create({
          data: {
            name: provider.name,
            email: provider.email,
            phone: provider.phone,
            passwordHash: await bcrypt.hash(provider.password, 10),
            role: "STORE",
            referralCode: provider.referral,
            wallet: { create: { balance: 0 } },
          },
        })
      }
      let store = await db.store.findUnique({ where: { slug: provider.store.slug } })
      if (!store) {
        store = await db.store.create({
          data: {
            ...provider.store,
            ownerId: user.id,
            city: "Cox's Bazar",
            about: provider.store.tagline,
            openTime: "08:00",
            closeTime: "21:00",
          },
        })
      }
      for (const slug of provider.categories) {
        const categoryId = categoryIds.get(slug)
        if (!categoryId) continue
        await db.providerCategory.upsert({
          where: { storeId_categoryId: { storeId: store.id, categoryId } },
          update: {},
          create: { storeId: store.id, categoryId },
        })
      }
      for (const slug of provider.areas) {
        const areaId = areaIds.get(slug)
        if (!areaId) continue
        await db.providerArea.upsert({
          where: { storeId_areaId: { storeId: store.id, areaId } },
          update: {},
          create: { storeId: store.id, areaId },
        })
      }
      const existingDoc = await db.providerDocument.findFirst({
        where: { storeId: store.id, kind: provider.document.kind },
      })
      if (!existingDoc) {
        await db.providerDocument.create({ data: { storeId: store.id, ...provider.document } })
      }
      if (provider.worker) {
        const worker = provider.worker
        const found = await db.user.findUnique({ where: { email: worker.email } })
        if (!found) {
          await db.user.create({
            data: {
              name: worker.name,
              email: worker.email,
              phone: worker.phone,
              passwordHash: await bcrypt.hash(worker.password, 10),
              role: "DELIVERY",
              referralCode: worker.referral,
              wallet: { create: { balance: 0 } },
              rider: {
                create: {
                  storeId: store.id,
                  vehicle: worker.vehicle,
                  zone: worker.zone,
                  trade: worker.trade,
                  available: true,
                },
              },
            },
          })
        }
      }
      if (provider.store.listing === "LAUNDRY") {
        const slots = await db.timeSlot.count({ where: { storeId: store.id } })
        if (!slots) {
          await db.timeSlot.createMany({
            data: [
              ["09:00–12:00", "09:00", "12:00"],
              ["12:00–15:00", "12:00", "15:00"],
              ["15:00–18:00", "15:00", "18:00"],
              ["18:00–21:00", "18:00", "21:00"],
            ].map(([label, startTime, endTime]) => ({ storeId: store.id, label, startTime, endTime })),
          })
        }
      }
    }

    const laboni = await db.store.findUnique({ where: { slug: "laboni-linen" } })
    if (laboni) {
      const priced = await db.price.count({ where: { storeId: laboni.id } })
      if (!priced) {
        const sample = await db.price.findMany({ where: { store: { slug: "chandni-wash-house" } }, take: 16 })
        if (sample.length) {
          await db.price.createMany({
            data: sample.map((row) => ({ storeId: laboni.id, itemId: row.itemId, kindId: row.kindId, amount: row.amount })),
          })
        }
      }
    }

    const customer = await db.user.findUnique({ where: { email: "customer@needcoxs.test" } })
    if (customer) {
      for (const sample of sampleBookings) {
        const exists = await db.serviceBooking.findUnique({ where: { code: sample.code } })
        if (exists) continue
        const store = await db.store.findUnique({ where: { slug: sample.storeSlug } })
        const offering = offeringIds.get(`${sample.category}:${sample.offering}`)
        const categoryId = categoryIds.get(sample.category)
        const areaId = areaIds.get(sample.area)
        if (!store || !offering || !categoryId) continue
        let workerId = null
        if (sample.workerEmail) {
          const worker = await db.user.findUnique({ where: { email: sample.workerEmail }, include: { rider: true } })
          workerId = worker?.rider?.id ?? null
        }
        const price = offering.pricing === "FIXED" ? offering.price : 0
        await db.serviceBooking.create({
          data: {
            code: sample.code,
            customerId: customer.id,
            storeId: store.id,
            categoryId,
            offeringId: offering.id,
            areaId,
            addressLine: sample.address,
            lat: 21.42,
            lng: 91.98,
            visitDate: tomorrow(),
            visitSlot: "09:00–12:00",
            endDate: sample.days > 1 ? tomorrow() : "",
            notes: sample.notes,
            pricing: offering.pricing,
            price,
            quoteAmount: sample.quoteAmount ?? null,
            rooms: sample.rooms ?? 0,
            teamSize: sample.teamSize ?? 1,
            days: sample.days ?? 1,
            status: sample.status,
            paymentMethod: sample.paymentMethod,
            paymentStatus: "UNPAID",
            workerId,
            events: {
              create: [
                { status: "REQUESTED", note: "Booked from the Cox's Bazar desk", actorId: customer.id },
                { status: sample.status, note: "Demo booking", actorId: customer.id },
              ],
            },
          },
        })
      }
    }

    const counts = await Promise.all([
      db.serviceCategory.count(),
      db.serviceArea.count(),
      db.store.count({ where: { listing: "SERVICE" } }),
    ])
    console.log(`Marketplace catalog ready: ${counts[0]} categories, ${counts[1]} areas, ${counts[2]} service providers`)
  } finally {
    if (own) await db.$disconnect()
  }
}
