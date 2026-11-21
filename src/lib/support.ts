import { randomInt } from "node:crypto"
import { db } from "./db"
import { AppError } from "./errors"
import { notify, officeIds } from "./notify"
import { bookingFor } from "./bookings"
import type { Role } from "./roles"

type Viewer = { id: string; role: string; name: string; worker?: { id: string } | null }

export const TICKET_CATEGORIES = {
  COMPLAINT: { bn: "অভিযোগ", en: "Complaint" },
  REFUND: { bn: "রিফান্ড", en: "Refund" },
  WORKER: { bn: "কর্মীর আচরণ", en: "Worker behaviour" },
  OTHER: { bn: "অন্যান্য", en: "Other" },
} as const

export const TICKET_PRIORITIES = {
  LOW: { bn: "কম", en: "Low" },
  NORMAL: { bn: "সাধারণ", en: "Normal" },
  HIGH: { bn: "জরুরি", en: "High" },
  URGENT: { bn: "খুব জরুরি", en: "Urgent" },
} as const

export const TICKET_STATUSES = {
  OPEN: { bn: "খোলা", en: "Open" },
  PENDING: { bn: "উত্তরের অপেক্ষায়", en: "Waiting on customer" },
  RESOLVED: { bn: "সমাধান হয়েছে", en: "Resolved" },
  CLOSED: { bn: "বন্ধ", en: "Closed" },
} as const

const office = (role: string) => role === "ADMIN" || role === "SUPPORT"

function cleanBody(body: string) {
  const text = body.trim()
  if (!text) throw new AppError("কিছু একটা লিখুন।", "Write a message.")
  if (text.length > 2000) throw new AppError("বার্তা ২০০০ অক্ষরের মধ্যে রাখুন।", "Keep the message under 2000 characters.")
  return text
}

// ── Booking chat (customer, worker, office) ───────────────────────────────

export async function bookingChat(user: Viewer, code: string) {
  const booking = await bookingFor(user, code)
  const thread = await db.bookingThread.upsert({
    where: { bookingId: booking.id },
    update: {},
    create: { bookingId: booking.id },
    include: { messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { name: true, role: true } } } } },
  })
  await db.bookingThreadRead.upsert({
    where: { threadId_userId: { threadId: thread.id, userId: user.id } },
    update: { readAt: new Date() },
    create: { threadId: thread.id, userId: user.id },
  })
  return { booking, thread }
}

export async function sendBookingMessage(user: Viewer, code: string, body: string) {
  const text = cleanBody(body)
  const booking = await bookingFor(user, code)
  const thread = await db.bookingThread.upsert({ where: { bookingId: booking.id }, update: {}, create: { bookingId: booking.id } })
  await db.bookingChatMessage.create({ data: { threadId: thread.id, senderId: user.id, body: text } })
  await db.bookingThread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } })
  await db.bookingThreadRead.upsert({
    where: { threadId_userId: { threadId: thread.id, userId: user.id } },
    update: { readAt: new Date() },
    create: { threadId: thread.id, userId: user.id },
  })
  const recipients = [booking.customerId, booking.worker?.userId, ...(user.role === "CUSTOMER" || user.role === "WORKER" ? await officeIds() : [])]
  await notify(recipients, {
    kind: "MESSAGE",
    title: `${booking.code} · নতুন মেসেজ`,
    body: `${user.name}: ${text.slice(0, 100)}`,
    link: `/bookings/${booking.code}`,
  }, user.id)
}

// ── Customer care chat (one thread per customer) ──────────────────────────

const careInclude = {
  customer: { select: { id: true, name: true, phone: true, email: true } },
  assignee: { select: { id: true, name: true } },
  messages: { orderBy: { createdAt: "asc" as const }, include: { sender: { select: { name: true, role: true } } } },
}

export async function myCareThread(customerId: string) {
  const thread = await db.careThread.upsert({
    where: { customerId },
    update: {},
    create: { customerId },
    include: careInclude,
  })
  await markCareRead(thread.id, customerId)
  return thread
}

export async function careThreadFor(user: Viewer, id: string) {
  const thread = await db.careThread.findUnique({ where: { id }, include: careInclude })
  if (!thread || (!office(user.role) && thread.customerId !== user.id)) {
    throw new AppError("চ্যাটটা পাওয়া যায়নি।", "Chat not found.")
  }
  await markCareRead(thread.id, user.id)
  return thread
}

async function markCareRead(threadId: string, userId: string) {
  await db.careRead.upsert({
    where: { threadId_userId: { threadId, userId } },
    update: { readAt: new Date() },
    create: { threadId, userId },
  })
}

export async function sendCareMessage(user: Viewer, threadId: string | null, body: string) {
  const text = cleanBody(body)
  let thread
  if (user.role === "CUSTOMER") {
    thread = await db.careThread.upsert({ where: { customerId: user.id }, update: {}, create: { customerId: user.id } })
  } else if (office(user.role) && threadId) {
    thread = await db.careThread.findUnique({ where: { id: threadId } })
    if (!thread) throw new AppError("চ্যাটটা পাওয়া যায়নি।", "Chat not found.")
  } else {
    throw new AppError("অনুমতি নেই।", "Not allowed.")
  }
  await db.careMessage.create({ data: { threadId: thread.id, senderId: user.id, body: text } })
  await db.careThread.update({
    where: { id: thread.id },
    data: {
      status: "OPEN",
      updatedAt: new Date(),
      ...(office(user.role) && !thread.assigneeId ? { assigneeId: user.id } : {}),
    },
  })
  await markCareRead(thread.id, user.id)
  if (user.role === "CUSTOMER") {
    const to = thread.assigneeId ? [thread.assigneeId] : await officeIds()
    await notify(to, { kind: "MESSAGE", title: "কাস্টমার কেয়ার · নতুন মেসেজ", body: `${user.name}: ${text.slice(0, 100)}`, link: `/support/care/${thread.id}` })
  } else {
    await notify([thread.customerId], { kind: "MESSAGE", title: "কাস্টমার কেয়ার উত্তর দিয়েছে", body: text.slice(0, 120), link: "/care" })
  }
}

export async function setCareThread(user: Viewer, threadId: string, change: { assignToMe?: boolean; close?: boolean }) {
  if (!office(user.role)) throw new AppError("অনুমতি নেই।", "Not allowed.")
  await db.careThread.update({
    where: { id: threadId },
    data: {
      ...(change.assignToMe ? { assigneeId: user.id } : {}),
      ...(change.close ? { status: "CLOSED" } : {}),
    },
  })
}

// ── Tickets ────────────────────────────────────────────────────────────────

const ticketInclude = {
  user: { select: { id: true, name: true, phone: true, email: true } },
  assignee: { select: { id: true, name: true } },
  booking: { select: { code: true } },
  messages: { orderBy: { createdAt: "asc" as const }, include: { sender: { select: { name: true, role: true } } } },
}

export async function createTicket(
  user: Viewer,
  input: { subject: string; category: string; priority: string; body: string; bookingCode: string },
) {
  if (user.role !== "CUSTOMER") throw new AppError("টিকেট খুলবেন কাস্টমার।", "Only customers open tickets.")
  const subject = input.subject.trim()
  if (subject.length < 4) throw new AppError("বিষয়টা একটু লিখুন।", "Add a short subject.")
  const body = cleanBody(input.body)
  let bookingId: string | null = null
  if (input.bookingCode) bookingId = (await bookingFor(user, input.bookingCode)).id
  let code = ""
  for (let i = 0; i < 8 && !code; i += 1) {
    const candidate = `TK-${randomInt(10000, 100000)}`
    if (!(await db.ticket.findUnique({ where: { code: candidate }, select: { id: true } }))) code = candidate
  }
  const ticket = await db.ticket.create({
    data: {
      code,
      userId: user.id,
      bookingId,
      subject,
      category: input.category in TICKET_CATEGORIES ? input.category : "OTHER",
      priority: input.priority in TICKET_PRIORITIES ? input.priority : "NORMAL",
      messages: { create: { senderId: user.id, body } },
      reads: { create: { userId: user.id } },
    },
  })
  await notify(await officeIds(), { kind: "TICKET", title: `নতুন টিকেট ${ticket.code}`, body: subject, link: `/support/tickets/${ticket.code}` })
  return ticket
}

export async function ticketFor(user: Viewer, code: string) {
  const ticket = await db.ticket.findUnique({ where: { code }, include: ticketInclude })
  if (!ticket || (!office(user.role) && ticket.userId !== user.id)) {
    throw new AppError("টিকেটটা পাওয়া যায়নি।", "Ticket not found.")
  }
  await db.ticketRead.upsert({
    where: { ticketId_userId: { ticketId: ticket.id, userId: user.id } },
    update: { readAt: new Date() },
    create: { ticketId: ticket.id, userId: user.id },
  })
  return ticket
}

export async function replyTicket(user: Viewer, code: string, body: string) {
  const ticket = await ticketFor(user, code)
  if (ticket.status === "CLOSED") throw new AppError("টিকেটটা বন্ধ। নতুন টিকেট খুলুন।", "This ticket is closed. Open a new one.")
  const text = cleanBody(body)
  await db.ticketMessage.create({ data: { ticketId: ticket.id, senderId: user.id, body: text } })
  const fromOffice = office(user.role)
  await db.ticket.update({
    where: { id: ticket.id },
    data: {
      updatedAt: new Date(),
      status: fromOffice ? "PENDING" : "OPEN",
      ...(fromOffice && !ticket.assigneeId ? { assigneeId: user.id } : {}),
    },
  })
  await db.ticketRead.upsert({
    where: { ticketId_userId: { ticketId: ticket.id, userId: user.id } },
    update: { readAt: new Date() },
    create: { ticketId: ticket.id, userId: user.id },
  })
  if (fromOffice) {
    await notify([ticket.userId], { kind: "TICKET", title: `টিকেট ${ticket.code} · উত্তর এসেছে`, body: text.slice(0, 120), link: `/help/tickets/${ticket.code}` })
  } else {
    const to = ticket.assigneeId ? [ticket.assigneeId] : await officeIds()
    await notify(to, { kind: "TICKET", title: `টিকেট ${ticket.code} · নতুন মেসেজ`, body: text.slice(0, 120), link: `/support/tickets/${ticket.code}` })
  }
}

export async function updateTicket(
  user: Viewer,
  code: string,
  change: { status?: string; priority?: string; assignToMe?: boolean },
) {
  const ticket = await ticketFor(user, code)
  const fromOffice = office(user.role)
  if (!fromOffice) {
    if (change.status !== "CLOSED" || change.priority || change.assignToMe) throw new AppError("অনুমতি নেই।", "Not allowed.")
  }
  await db.ticket.update({
    where: { id: ticket.id },
    data: {
      ...(change.status && change.status in TICKET_STATUSES ? { status: change.status } : {}),
      ...(fromOffice && change.priority && change.priority in TICKET_PRIORITIES ? { priority: change.priority } : {}),
      ...(fromOffice && change.assignToMe ? { assigneeId: user.id } : {}),
    },
  })
  if (fromOffice && (change.status === "RESOLVED" || change.status === "CLOSED")) {
    await notify([ticket.userId], {
      kind: "TICKET",
      title: `টিকেট ${ticket.code} · ${TICKET_STATUSES[change.status as keyof typeof TICKET_STATUSES].bn}`,
      body: ticket.subject,
      link: `/help/tickets/${ticket.code}`,
    })
  }
}

export async function myTickets(userId: string) {
  return db.ticket.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "desc" }, take: 1 }, reads: { where: { userId } } },
  })
}

// ── Support inbox ─────────────────────────────────────────────────────────

const PRIORITY_RANK: Record<string, number> = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 }

export type InboxItem = {
  kind: "CARE" | "TICKET" | "BOOKING"
  id: string
  href: string
  title: string
  subtitle: string
  preview: string
  updatedAt: Date
  unread: boolean
  assignee: string | null
  mine: boolean
  priority: string
  status: string
}

/** Everything the support desk has to look at, newest and unread first. */
export async function inbox(user: Viewer, filter: "all" | "mine" | "unread" = "all"): Promise<InboxItem[]> {
  if (!office(user.role)) throw new AppError("অনুমতি নেই।", "Not allowed.")
  const [care, tickets, chats] = await Promise.all([
    db.careThread.findMany({
      where: { status: "OPEN", messages: { some: {} } },
      include: {
        customer: { select: { name: true, phone: true } },
        assignee: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { role: true } } } },
        reads: { where: { userId: user.id } },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    db.ticket.findMany({
      where: { status: { in: ["OPEN", "PENDING"] } },
      include: {
        user: { select: { name: true } },
        assignee: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { role: true } } } },
        reads: { where: { userId: user.id } },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    db.bookingThread.findMany({
      where: { messages: { some: {} }, booking: { status: { notIn: ["CANCELLED"] } } },
      include: {
        booking: { select: { code: true, status: true, customer: { select: { name: true } }, offering: { select: { nameBn: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { role: true, name: true } } } },
        reads: { where: { userId: user.id } },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
  ])

  const items: InboxItem[] = []
  for (const t of care) {
    const last = t.messages[0]
    if (!last) continue
    items.push({
      kind: "CARE",
      id: t.id,
      href: `/support/care/${t.id}`,
      title: t.customer.name,
      subtitle: t.customer.phone ?? "",
      preview: last.body,
      updatedAt: last.createdAt,
      unread: !office(last.sender.role) && (!t.reads[0] || t.reads[0].readAt < last.createdAt),
      assignee: t.assignee?.name ?? null,
      mine: t.assignee?.id === user.id,
      priority: "NORMAL",
      status: t.status,
    })
  }
  for (const t of tickets) {
    const last = t.messages[0]
    items.push({
      kind: "TICKET",
      id: t.id,
      href: `/support/tickets/${t.code}`,
      title: `${t.code} · ${t.subject}`,
      subtitle: t.user.name,
      preview: last?.body ?? "",
      updatedAt: last?.createdAt ?? t.updatedAt,
      unread: Boolean(last) && !office(last!.sender.role) && (!t.reads[0] || t.reads[0].readAt < last!.createdAt),
      assignee: t.assignee?.name ?? null,
      mine: t.assignee?.id === user.id,
      priority: t.priority,
      status: t.status,
    })
  }
  for (const t of chats) {
    const last = t.messages[0]
    if (!last) continue
    items.push({
      kind: "BOOKING",
      id: t.id,
      href: `/support/bookings/${t.booking.code}`,
      title: `${t.booking.code} · ${t.booking.offering.nameBn}`,
      subtitle: t.booking.customer.name,
      preview: `${last.sender.name}: ${last.body}`,
      updatedAt: last.createdAt,
      unread: !office(last.sender.role) && (!t.reads[0] || t.reads[0].readAt < last.createdAt),
      assignee: null,
      mine: false,
      priority: "NORMAL",
      status: t.booking.status,
    })
  }
  const filtered = items.filter((i) => (filter === "mine" ? i.mine : filter === "unread" ? i.unread : true))
  return filtered.sort((a, b) => {
    if (a.unread !== b.unread) return a.unread ? -1 : 1
    const p = (PRIORITY_RANK[a.priority] ?? 2) - (PRIORITY_RANK[b.priority] ?? 2)
    if (p) return p
    return b.updatedAt.getTime() - a.updatedAt.getTime()
  })
}

export async function unreadForOffice(user: Viewer) {
  if (!office(user.role)) return 0
  return (await inbox(user, "unread")).length
}

/** Unread booking-chat and care messages for a customer or worker. */
export async function unreadMessages(user: { id: string; role: Role | string; worker?: { id: string } | null }) {
  const where =
    user.role === "CUSTOMER"
      ? { booking: { customerId: user.id } }
      : user.role === "WORKER" && user.worker
        ? { booking: { workerId: user.worker.id } }
        : null
  if (!where) return 0
  const threads = await db.bookingThread.findMany({
    where: { ...where, messages: { some: { senderId: { not: user.id } } } },
    select: {
      reads: { where: { userId: user.id } },
      messages: { where: { senderId: { not: user.id } }, orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
    },
  })
  let count = threads.filter((t) => !t.reads[0] || t.reads[0].readAt < t.messages[0].createdAt).length
  if (user.role === "CUSTOMER") {
    const care = await db.careThread.findUnique({
      where: { customerId: user.id },
      select: { reads: { where: { userId: user.id } }, messages: { where: { senderId: { not: user.id } }, orderBy: { createdAt: "desc" }, take: 1 } },
    })
    if (care?.messages[0] && (!care.reads[0] || care.reads[0].readAt < care.messages[0].createdAt)) count += 1
  }
  return count
}
