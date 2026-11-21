import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { demoAccounts, demoPassword } from "../src/theme/demo-accounts"
import { brand } from "../src/theme/brand"
import { SETTING_DEFAULTS } from "../src/lib/settings"

const db = new PrismaClient()

function day(offset: number) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

async function main() {
  await db.subscriber.deleteMany()
  await db.deliveryZone.deleteMany()
  await db.cmsPage.deleteMany()
  await db.galleryItem.deleteMany()
  await db.storeCategory.deleteMany()
  await db.productAttribute.deleteMany()
  await db.inquiry.deleteMany()
  await db.message.deleteMany()
  await db.thread.deleteMany()
  await db.notice.deleteMany()
  await db.review.deleteMany()
  await db.payment.deleteMany()
  await db.orderEvent.deleteMany()
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.cartItem.deleteMany()
  await db.walletTxn.deleteMany()
  await db.wallet.deleteMany()
  await db.address.deleteMany()
  await db.payout.deleteMany()
  await db.faq.deleteMany()
  await db.price.deleteMany()
  await db.timeSlot.deleteMany()
  await db.coupon.deleteMany()
  await db.deliveryProfile.deleteMany()
  await db.store.deleteMany()
  await db.banner.deleteMany()
  await db.item.deleteMany()
  await db.kind.deleteMany()
  await db.setting.deleteMany()
  await db.user.deleteMany()

  const hash = {
    admin: await bcrypt.hash(demoPassword.admin, 10),
    store: await bcrypt.hash(demoPassword.store, 10),
    rider: await bcrypt.hash(demoPassword.rider, 10),
    customer: await bcrypt.hash(demoPassword.customer, 10),
  }

  const admin = await db.user.create({
    data: {
      name: "Ayesha Karim",
      email: demoAccounts[3].email,
      phone: "01710000001",
      passwordHash: hash.admin,
      role: "ADMIN",
      referralCode: "NEEDCOX",
      wallet: { create: { balance: 0 } },
    },
  })

  const nusrat = await db.user.create({
    data: {
      name: "Nusrat Rahman",
      email: demoAccounts[0].email,
      phone: "01711112222",
      passwordHash: hash.customer,
      role: "CUSTOMER",
      referralCode: "NUSRAT",
      wallet: { create: { balance: 500 } },
    },
  })
  const imran = await db.user.create({
    data: {
      name: "Imran Hossain",
      email: "imran@needcoxs.test",
      phone: "01822223333",
      passwordHash: hash.customer,
      role: "CUSTOMER",
      referralCode: "IMRAN",
      wallet: { create: { balance: 120 } },
    },
  })

  await db.walletTxn.createMany({
    data: [
      { userId: nusrat.id, amount: 500, type: "CREDIT", note: "Welcome balance from Cox's Seba" },
      { userId: imran.id, amount: 120, type: "CREDIT", note: "Referral credit" },
    ],
  })

  await db.address.createMany({
    data: [
      { userId: nusrat.id, label: "Home", line1: "House 12, Road 63", area: "Gulshan", phone: nusrat.phone, lat: 23.792, lng: 90.415, isDefault: true },
      { userId: nusrat.id, label: "Office", line1: "Level 4, Green Square", area: "Banani", phone: nusrat.phone, lat: 23.794, lng: 90.406, isDefault: false },
      { userId: imran.id, label: "Home", line1: "Flat 5B, Road 8", area: "Dhanmondi", phone: imran.phone, lat: 23.746, lng: 90.374, isDefault: true },
    ],
  })

  const farhan = await db.user.create({
    data: { name: "Farhan Kabir", email: demoAccounts[1].email, phone: "01711000001", passwordHash: hash.store, role: "STORE", referralCode: "FARHAN", wallet: { create: { balance: 0 } } },
  })
  const owners = await Promise.all(
    [
      ["Lina Chowdhury", "lina@needcoxs.test"],
      ["Rafi Ahmed", "rafi@needcoxs.test"],
      ["Shila Begum", "shila@needcoxs.test"],
      ["Nabil Hasan", "nabil@needcoxs.test"],
      ["Imtiaz Rahman", "pending@needcoxs.test"],
    ].map(([name, email]) =>
      db.user.create({
        data: { name, email, phone: "01710000000", passwordHash: hash.store, role: "STORE", referralCode: email.split("@")[0].toUpperCase(), wallet: { create: { balance: 0 } } },
      }),
    ),
  )

  const storeInput = [
    { ownerId: farhan.id, name: "Chandni Wash House", slug: "chandni-wash-house", area: "Gulshan", address: "House 48, Road 11, Gulshan 2", lat: 23.7948, lng: 90.4143, phone: "01711000001", hue: 210, status: "APPROVED", factor: 1.1, tagline: "Steam press and wash-fold since 2016.", cover: "/laundries/cover-chandni.jpg", logo: "shirt" },
    { ownerId: owners[0].id, name: "Dhanmondi Press Room", slug: "dhanmondi-press-room", area: "Dhanmondi", address: "Road 27, Dhanmondi", lat: 23.755, lng: 90.376, phone: "01712000002", hue: 198, status: "APPROVED", factor: 1, tagline: "Neighbourhood press with same-day slots.", cover: "/laundries/cover-dhanmondi.jpg", logo: "iron" },
    { ownerId: owners[1].id, name: "Banani Apron", slug: "banani-apron", area: "Banani", address: "Road 11, Banani", lat: 23.793, lng: 90.407, phone: "01713000003", hue: 188, status: "APPROVED", factor: 1.05, tagline: "Careful with silk and office shirts.", cover: "/laundries/cover-banani.jpg", logo: "hanger" },
    { ownerId: owners[2].id, name: "Mirpur Soak Studio", slug: "mirpur-soak-studio", area: "Mirpur", address: "Mirpur 10", lat: 23.807, lng: 90.368, phone: "01714000004", hue: 222, status: "APPROVED", factor: 0.9, tagline: "Lower rates, evening pickups.", cover: "/laundries/cover-mirpur.jpg", logo: "machine" },
    { ownerId: owners[3].id, name: "Mohammadpur Linen", slug: "mohammadpur-linen", area: "Mohammadpur", address: "Tajmahal Road", lat: 23.766, lng: 90.358, phone: "01715000005", hue: 204, status: "APPROVED", factor: 0.95, tagline: "Household linen and everyday wear.", cover: "/laundries/cover-mohammadpur.jpg", logo: "fold" },
    { ownerId: owners[4].id, name: "Uttara Fold Lane", slug: "uttara-fold-lane", area: "Uttara", address: "Sector 7", lat: 23.876, lng: 90.398, phone: "01716000006", hue: 250, status: "PENDING", factor: 1, tagline: "Waiting for approval.", cover: "/laundries/cover-uttara.jpg", logo: "basket" },
  ]

  const stores = []
  for (const input of storeInput) {
    const { factor, ...data } = input
    const store = await db.store.create({
      data: { ...data, city: "Dhaka", commissionRate: 12, deliveryFee: factor > 1 ? 80 : 60, minOrder: 150, openTime: "08:00", closeTime: "21:00", about: data.tagline },
    })
    stores.push({ ...store, factor })
    const slots = [
      ["09:00–11:00", "09:00", "11:00"],
      ["11:00–13:00", "11:00", "13:00"],
      ["13:00–15:00", "13:00", "15:00"],
      ["15:00–17:00", "15:00", "17:00"],
      ["17:00–19:00", "17:00", "19:00"],
      ["19:00–21:00", "19:00", "21:00"],
    ]
    await db.timeSlot.createMany({
      data: slots.map(([label, startTime, endTime]) => ({ storeId: store.id, label, startTime, endTime })),
    })
  }

  const kindRows: { slug: string; name: string; nameBn: string; sort: number }[] = [
    { slug: "wash", name: "Wash only", nameBn: "শুধু ধোয়া", sort: 1 },
    { slug: "iron", name: "Iron only", nameBn: "শুধু ইস্ত্রি", sort: 2 },
    { slug: "both", name: "Wash & iron", nameBn: "ধোয়া ও ইস্ত্রি", sort: 3 },
    { slug: "dry", name: "Dry clean", nameBn: "ড্রাই ক্লিন", sort: 4 },
  ]
  const kinds = await Promise.all(kindRows.map((row) => db.kind.create({ data: row })))
  const kindBySlug = Object.fromEntries(kinds.map((kind) => [kind.slug, kind]))

  const catalog: [string, string, string, string, string, number, Record<string, number>][] = [
    ["MEN", "T-shirt", "টি-শার্ট", "piece", "পিস", 1, { wash: 40, iron: 20, both: 60, dry: 90 }],
    ["MEN", "Shirt", "শার্ট", "piece", "পিস", 2, { wash: 50, iron: 25, both: 70, dry: 120 }],
    ["MEN", "Polo", "পোলো", "piece", "পিস", 3, { wash: 50, iron: 25, both: 75, dry: 110 }],
    ["MEN", "Jeans", "জিন্স", "piece", "পিস", 4, { wash: 80, iron: 40, both: 110, dry: 180 }],
    ["MEN", "Trouser", "ট্রাউজার", "piece", "পিস", 5, { wash: 60, iron: 30, both: 90, dry: 150 }],
    ["MEN", "Panjabi", "পাঞ্জাবি", "piece", "পিস", 6, { wash: 70, iron: 35, both: 100, dry: 160 }],
    ["WOMEN", "Kameez", "কামিজ", "piece", "পিস", 1, { wash: 90, iron: 40, both: 130, dry: 220 }],
    ["WOMEN", "Saree", "শাড়ি", "piece", "পিস", 2, { wash: 120, iron: 50, both: 180, dry: 380 }],
    ["WOMEN", "Salwar set", "সালোয়ার সেট", "set", "সেট", 3, { wash: 100, iron: 45, both: 150, dry: 240 }],
    ["WOMEN", "Blouse", "ব্লাউজ", "piece", "পিস", 4, { wash: 40, iron: 20, both: 55, dry: 80 }],
    ["KIDS", "School shirt", "স্কুল শার্ট", "piece", "পিস", 1, { wash: 35, iron: 15, both: 45, dry: 70 }],
    ["KIDS", "School pant", "স্কুল প্যান্ট", "piece", "পিস", 2, { wash: 40, iron: 15, both: 50, dry: 80 }],
    ["KIDS", "Frock", "ফ্রক", "piece", "পিস", 3, { wash: 50, iron: 20, both: 70, dry: 100 }],
    ["KIDS", "Kids tee", "বাচ্চাদের টি-শার্ট", "piece", "পিস", 4, { wash: 30, iron: 12, both: 40, dry: 60 }],
    ["OTHER", "Bed sheet", "বিছানার চাদর", "piece", "পিস", 1, { wash: 80, iron: 40, both: 140, dry: 180 }],
    ["OTHER", "Towel", "তোয়ালে", "piece", "পিস", 2, { wash: 30, iron: 10, both: 40, dry: 50 }],
    ["OTHER", "Curtain", "পর্দা", "piece", "পিস", 3, { wash: 150, iron: 60, both: 220, dry: 280 }],
    ["BULK", "Wash & fold", "ওয়াশ অ্যান্ড ফোল্ড", "kg", "কেজি", 1, { wash: 90 }],
    ["BULK", "Wash & iron bundle", "ধোয়া ও ইস্ত্রি (কেজি)", "kg", "কেজি", 2, { both: 140 }],
  ]

  for (const [audience, name, nameBn, unit, unitBn, sort, prices] of catalog) {
    const item = await db.item.create({ data: { audience, name, nameBn, unit, unitBn, sort } })
    for (const store of stores) {
      if (store.status !== "APPROVED" && store.slug !== "chandni-wash-house") continue
      for (const [slug, amount] of Object.entries(prices)) {
        await db.price.create({
          data: {
            storeId: store.id,
            itemId: item.id,
            kindId: kindBySlug[slug].id,
            amount: Math.round(amount * store.factor),
          },
        })
      }
    }
  }

  const chandni = stores[0]
  await db.coupon.createMany({
    data: [
      { code: "WELCOME100", title: "৳100 off your first bigger bag", detail: "Minimum ৳500", type: "FIXED", value: 100, minOrder: 500 },
      { code: "FOLD20", title: "20% off wash & iron", detail: "Capped at ৳150", type: "PERCENT", value: 20, minOrder: 300, maxDiscount: 150 },
      { code: "CHANDNI50", title: "৳50 at Chandni", detail: "Chandni Wash House only", type: "FIXED", value: 50, minOrder: 250, storeId: chandni.id },
    ],
  })

  await db.faq.createMany({
    data: [
      { question: "How fast is a normal order?", answer: "Most laundries return clothes in 48 hours. Pick the delivery slot you want at checkout.", sort: 1 },
      { question: "Can I pay the rider in cash?", answer: "Yes. Cash on delivery is the live method. bKash, SSLCommerz, and card stay ready for keys.", sort: 2 },
      { question: "What if a button is missing?", answer: "Tell the laundry in the order note, or message customer care in the chat. The shop records it on the order.", sort: 3 },
    ],
  })
  await db.faq.createMany({
    data: [
      { storeId: chandni.id, question: "Do you take silk sarees?", answer: "Yes. Choose dry clean on the saree so it is not machine washed.", sort: 1 },
      { storeId: chandni.id, question: "Where do you collect from?", answer: "Gulshan, Banani, and Baridhara gates. The rider calls when they are close.", sort: 2 },
    ],
  })

  await db.banner.createMany({
    data: [
      { title: "৳100 off with WELCOME100", titleBn: "WELCOME100 কোডে ৳১০০ ছাড়", subtitle: "On bags over ৳500", subtitleBn: "৳৫০০ এর বেশি ব্যাগে", href: "/offers", sort: 1 },
      { title: "Evening slots open", titleBn: "সন্ধ্যার স্লট খোলা", subtitle: "Pick up after 5pm", subtitleBn: "বিকেল ৫টার পর পিকআপ", href: "/stores", sort: 2 },
    ],
  })

  for (const [key, value] of Object.entries(SETTING_DEFAULTS)) {
    await db.setting.create({ data: { key, value } })
  }

  const karim = await db.user.create({
    data: {
      name: "Karim Uddin",
      email: demoAccounts[2].email,
      phone: "01610000007",
      passwordHash: hash.rider,
      role: "DELIVERY",
      referralCode: "KARIM",
      wallet: { create: { balance: 0 } },
      rider: { create: { vehicle: "Motorbike", zone: "Gulshan–Banani", available: true } },
    },
    include: { rider: true },
  })
  const shapla = await db.user.create({
    data: {
      name: "Shapla Begum",
      email: "shapla@needcoxs.test",
      phone: "01620000008",
      passwordHash: hash.rider,
      role: "DELIVERY",
      referralCode: "SHAPLA",
      wallet: { create: { balance: 0 } },
      rider: { create: { vehicle: "Bicycle", zone: "Dhanmondi", storeId: stores[1].id, available: true } },
    },
    include: { rider: true },
  })

  const nusratHome = await db.address.findFirst({ where: { userId: nusrat.id, label: "Home" } })
  const imranHome = await db.address.findFirst({ where: { userId: imran.id, isDefault: true } })

  async function makeOrder(opts: {
    customerId: string
    storeId: string
    addressId: string
    status: string
    dayOffset: number
    riderId?: string
    lines: { name: string; kind: string; price: number; quantity: number }[]
  }) {
    const subtotal = opts.lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
    const deliveryFee = 60
    const total = subtotal + deliveryFee
    const commissionAmt = opts.status === "DELIVERED" ? Math.round(subtotal * 0.12) : 0
    const created = new Date()
    created.setDate(created.getDate() + opts.dayOffset)
    const code = `NC-${Math.floor(10000 + Math.random() * 90000)}`
    const order = await db.order.create({
      data: {
        code,
        customerId: opts.customerId,
        storeId: opts.storeId,
        addressId: opts.addressId,
        addressSnapshot: JSON.stringify({ label: "Home", line1: "House 12, Road 63", area: "Gulshan", city: "Dhaka", phone: "01711112222", lat: 23.792, lng: 90.415 }),
        pickupDate: day(opts.dayOffset),
        pickupSlot: "17:00–19:00",
        deliveryDate: day(opts.dayOffset + 2),
        deliverySlot: "11:00–13:00",
        status: opts.status,
        paymentMethod: "COD",
        paymentStatus: opts.status === "DELIVERED" ? "COLLECTED" : "COD_DUE",
        subtotal,
        deliveryFee,
        total,
        commissionRate: 12,
        commissionAmt,
        storeEarning: opts.status === "DELIVERED" ? subtotal - commissionAmt : 0,
        riderId: opts.riderId,
        createdAt: created,
        updatedAt: created,
        items: { create: opts.lines.map((line) => ({ ...line, unit: "piece" })) },
        events: { create: [{ status: "PENDING", note: "Order placed", actorId: opts.customerId }, { status: opts.status, note: "Seeded", actorId: admin.id }] },
        payment: { create: { provider: "COD", amount: total, status: opts.status === "DELIVERED" ? "COLLECTED" : "COD_DUE" } },
      },
    })
    return order
  }

  const delivered = await makeOrder({
    customerId: nusrat.id,
    storeId: chandni.id,
    addressId: nusratHome!.id,
    status: "DELIVERED",
    dayOffset: -6,
    riderId: karim.rider!.id,
    lines: [
      { name: "Shirt", kind: "Dry clean", price: 132, quantity: 2 },
      { name: "T-shirt", kind: "Wash & iron", price: 66, quantity: 3 },
    ],
  })
  await db.review.create({
    data: { orderId: delivered.id, customerId: nusrat.id, storeId: chandni.id, rating: 5, comment: "Collars came back sharp and the rider was on time." },
  })
  await makeOrder({
    customerId: imran.id,
    storeId: stores[1].id,
    addressId: imranHome!.id,
    status: "DELIVERED",
    dayOffset: -2,
    riderId: shapla.rider!.id,
    lines: [{ name: "Jeans", kind: "Wash only", price: 80, quantity: 2 }],
  })
  await makeOrder({
    customerId: imran.id,
    storeId: chandni.id,
    addressId: imranHome!.id,
    status: "PENDING",
    dayOffset: 0,
    lines: [{ name: "Panjabi", kind: "Dry clean", price: 176, quantity: 1 }],
  })
  await makeOrder({
    customerId: nusrat.id,
    storeId: chandni.id,
    addressId: nusratHome!.id,
    status: "PICKUP_ASSIGNED",
    dayOffset: 0,
    riderId: karim.rider!.id,
    lines: [{ name: "Shirt", kind: "Wash & iron", price: 77, quantity: 4 }],
  })
  await makeOrder({
    customerId: nusrat.id,
    storeId: chandni.id,
    addressId: nusratHome!.id,
    status: "READY",
    dayOffset: -1,
    riderId: karim.rider!.id,
    lines: [{ name: "Saree", kind: "Dry clean", price: 418, quantity: 1 }],
  })
  for (const offset of [-5, -4, -3, -1]) {
    await makeOrder({
      customerId: imran.id,
      storeId: stores[(Math.abs(offset) % 4) + 1].id,
      addressId: imranHome!.id,
      status: "DELIVERED",
      dayOffset: offset,
      lines: [{ name: "T-shirt", kind: "Wash only", price: 40, quantity: 2 }],
    })
  }
  const menus = [
    { name: "Shirt", kind: "Wash & iron", price: 70, quantity: 3 },
    { name: "Jeans", kind: "Wash only", price: 80, quantity: 1 },
    { name: "Saree", kind: "Dry clean", price: 380, quantity: 1 },
    { name: "T-shirt", kind: "Wash only", price: 40, quantity: 4 },
  ]
  for (let offset = -22; offset <= -6; offset += 1) {
    if (offset % 3 === 0) continue
    const menu = menus[Math.abs(offset) % menus.length]
    const store = stores[Math.abs(offset) % 5]
    await makeOrder({
      customerId: offset % 2 === 0 ? nusrat.id : imran.id,
      storeId: store.id,
      addressId: offset % 2 === 0 ? nusratHome!.id : imranHome!.id,
      status: "DELIVERED",
      dayOffset: offset,
      riderId: store.id === chandni.id ? karim.rider!.id : shapla.rider!.id,
      lines: [menu],
    })
  }
  const bag = await db.price.findMany({ where: { storeId: chandni.id, active: true }, take: 2 })
  if (bag.length) {
    await db.cartItem.createMany({
      data: bag.map((price, index) => ({ userId: nusrat.id, priceId: price.id, quantity: index + 2 })),
    })
  }

  const agg = await db.review.aggregate({ where: { storeId: chandni.id }, _avg: { rating: true }, _count: true })
  await db.store.update({ where: { id: chandni.id }, data: { rating: agg._avg.rating ?? 5, reviewCount: agg._count } })

  const thread = await db.thread.create({ data: { customerId: nusrat.id } })
  await db.message.createMany({
    data: [
      { threadId: thread.id, senderId: nusrat.id, body: "Hi, can the rider call before collecting from the gate?" },
      { threadId: thread.id, senderId: admin.id, body: "Yes. Karim will ring when he is five minutes away." },
    ],
  })

  await db.deliveryZone.createMany({
    data: [
      { name: "Gulshan–Banani", area: "Gulshan", fee: 60 },
      { name: "Dhanmondi belt", area: "Dhanmondi", fee: 70 },
      { name: "Mirpur", area: "Mirpur", fee: 80 },
      { name: "Uttara", area: "Uttara", fee: 90 },
    ],
  })
  await db.cmsPage.createMany({
    data: [
      { slug: "privacy", title: "Privacy", body: "Cox's Seba stores passwords as hashes and uses addresses only to complete a booking." },
      { slug: "care", title: "Garment care", body: "Silk and suits should be booked as dry clean, not wash and fold." },
    ],
  })
  await db.galleryItem.create({
    data: { storeId: chandni.id, caption: "Press floor", image: "/marketing/news-press.jpg" },
  })
  await db.storeCategory.createMany({
    data: [
      { storeId: chandni.id, name: "Formal" },
      { storeId: chandni.id, name: "Everyday" },
    ],
  })
  await db.productAttribute.createMany({
    data: [
      { storeId: chandni.id, name: "Finish", value: "Hanger" },
      { storeId: chandni.id, name: "Scent", value: "Fragrance-free" },
    ],
  })

  await db.notice.create({
    data: { userId: karim.id, channel: "IN_APP", title: brand.name, body: "A pickup is assigned to you.", status: "SENT" },
  })

  const marketplace = (await import("../scripts/seed-catalog.mjs")) as { ensureMarketplace: () => Promise<void> }
  await marketplace.ensureMarketplace()

  console.log("Seeded Cox's Seba")
  console.log(demoAccounts.map((account) => `${account.label}: ${account.email} / ${account.password}`).join("\n"))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
