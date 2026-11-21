import type { User, Store, DeliveryProfile } from "@prisma/client"
import { db } from "./db"
import { AppError } from "./errors"
import { notify } from "./notify"

type Viewer = User & { store: Store | null; rider: DeliveryProfile | null }

const bookingWhere = (user: Viewer) => {
  if (user.role === "ADMIN") return {}
  return {
    OR: [
      { customerId: user.id },
      { store: { ownerId: user.id } },
      ...(user.rider ? [{ workerId: user.rider.id }] : []),
    ],
  }
}

export function canSeeBooking(user: Viewer, booking: { customerId: string; storeId: string; workerId: string | null }) {
  if (user.role === "ADMIN") return true
  if (booking.customerId === user.id) return true
  if (user.store && booking.storeId === user.store.id) return true
  if (user.rider && booking.workerId === user.rider.id) return true
  return false
}

export async function listBookingChats(user: Viewer) {
  const bookings = await db.serviceBooking.findMany({
    where: bookingWhere(user),
    orderBy: { updatedAt: "desc" },
    include: {
      offering: true,
      customer: true,
      store: true,
      chat: {
        include: {
          messages: { orderBy: { createdAt: "desc" }, select: { senderId: true, createdAt: true, body: true } },
          reads: { where: { userId: user.id } },
        },
      },
    },
  })
  return bookings.map((booking) => {
    const latest = booking.chat?.messages[0]
    const readAt = booking.chat?.reads[0]?.readAt ?? new Date(0)
    const unread = booking.chat
      ? booking.chat.messages.filter((message) => message.senderId !== user.id && message.createdAt > readAt).length
      : 0
    return { booking, latest, unread }
  })
}

export async function unreadFor(user: Viewer) {
  const [chats, tickets] = await Promise.all([listBookingChats(user), listTickets(user)])
  const chat = chats.reduce((sum, row) => sum + row.unread, 0)
  const support = tickets.reduce((sum, row) => sum + row.unread, 0)
  const notices = await db.notice.count({ where: { userId: user.id, channel: "IN_APP", read: false, status: "SENT" } })
  return { chat: chat + support, notices }
}

export async function openBookingChat(user: Viewer, code: string) {
  const booking = await db.serviceBooking.findUnique({
    where: { code },
    include: { offering: true, customer: true, store: { include: { owner: true } }, worker: { include: { user: true } } },
  })
  if (!booking || !canSeeBooking(user, booking)) throw new AppError("That chat is not yours.")
  const thread = await db.bookingThread.upsert({
    where: { bookingId: booking.id },
    update: {},
    create: { bookingId: booking.id },
  })
  const messages = await db.bookingChatMessage.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
    include: { sender: true },
  })
  await db.bookingThreadRead.upsert({
    where: { threadId_userId: { threadId: thread.id, userId: user.id } },
    update: { readAt: new Date() },
    create: { threadId: thread.id, userId: user.id },
  })
  return { booking, thread, messages }
}

export async function sendBookingChat(user: Viewer, code: string, body: string) {
  const text = body.trim()
  if (text.length < 1) throw new AppError("Write a message.")
  if (text.length > 1000) throw new AppError("Keep the message under 1000 characters.")
  const { booking, thread } = await openBookingChat(user, code)
  await db.bookingChatMessage.create({ data: { threadId: thread.id, senderId: user.id, body: text } })
  await db.bookingThread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } })
  const targets = [booking.customerId, booking.store.ownerId, booking.worker?.userId]
  await Promise.all(
    [...new Set(targets.filter((id): id is string => Boolean(id) && id !== user.id))].map((id) =>
      notify(id, `Message on ${booking.code}`, text.slice(0, 140)),
    ),
  )
}

export async function listTickets(user: Viewer) {
  const where = user.role === "ADMIN" ? {} : { userId: user.id }
  const tickets = await db.ticket.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      user: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      reads: { where: { userId: user.id } },
    },
  })
  return tickets.map((ticket) => {
    const latest = ticket.messages[0]
    const readAt = ticket.reads[0]?.readAt ?? new Date(0)
    const unread = latest && latest.senderId !== user.id && latest.createdAt > readAt ? 1 : 0
    return { ticket, latest, unread }
  })
}

export async function openTicket(user: Viewer, code: string) {
  const ticket = await db.ticket.findUnique({
    where: { code },
    include: { user: true, messages: { orderBy: { createdAt: "asc" }, include: { sender: true } } },
  })
  if (!ticket) throw new AppError("Ticket not found.")
  if (user.role !== "ADMIN" && ticket.userId !== user.id) throw new AppError("That ticket is not yours.")
  await db.ticketRead.upsert({
    where: { ticketId_userId: { ticketId: ticket.id, userId: user.id } },
    update: { readAt: new Date() },
    create: { ticketId: ticket.id, userId: user.id },
  })
  return ticket
}

export async function createTicket(user: Viewer, subject: string, body: string) {
  const title = subject.trim()
  const text = body.trim()
  if (title.length < 3) throw new AppError("Add a subject.")
  if (text.length < 3) throw new AppError("Describe the problem.")
  const code = `TK-${Math.floor(10000 + Math.random() * 90000)}`
  const ticket = await db.ticket.create({
    data: {
      code,
      userId: user.id,
      subject: title,
      messages: { create: { senderId: user.id, body: text } },
      reads: { create: { userId: user.id } },
    },
  })
  const admins = await db.user.findMany({ where: { role: "ADMIN", active: true }, select: { id: true } })
  await Promise.all(admins.map((admin) => notify(admin.id, "New support ticket", `${code} · ${title}`)))
  return ticket
}

export async function replyTicket(user: Viewer, code: string, body: string, close = false) {
  const text = body.trim()
  if (text.length < 1 && !close) throw new AppError("Write a reply.")
  const ticket = await openTicket(user, code)
  if (ticket.status === "CLOSED" && user.role !== "ADMIN") throw new AppError("This ticket is closed.")
  if (text) {
    await db.ticketMessage.create({ data: { ticketId: ticket.id, senderId: user.id, body: text } })
  }
  await db.ticket.update({
    where: { id: ticket.id },
    data: { status: close ? "CLOSED" : ticket.status === "CLOSED" && user.role === "ADMIN" ? "OPEN" : ticket.status, updatedAt: new Date() },
  })
  if (user.role === "ADMIN") await notify(ticket.userId, close ? "Ticket closed" : "Support replied", `${ticket.code} · ${ticket.subject}`)
  else {
    const admins = await db.user.findMany({ where: { role: "ADMIN", active: true }, select: { id: true } })
    await Promise.all(admins.map((admin) => notify(admin.id, "Ticket reply", ticket.code)))
  }
}

export async function listAllBookingChats() {
  return db.bookingThread.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      booking: { include: { customer: true, store: true, offering: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: true } },
    },
    take: 80,
  })
}
