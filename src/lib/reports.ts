import { db } from "./db"
import { dayStart, localDate, localToday, recentDays, shiftDays } from "./format"
import { getSettings } from "./settings"
import { workerShare } from "./bookings"

export type Period = "today" | "week" | "month" | "year" | "custom"

export function periodRange(period: Period, from?: string, to?: string) {
  const today = localToday()
  let start = today
  let end = today
  if (period === "week") start = shiftDays(today, -6)
  if (period === "month") start = `${today.slice(0, 7)}-01`
  if (period === "year") start = `${today.slice(0, 4)}-01-01`
  if (period === "custom" && from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
    start = from
    end = to && /^\d{4}-\d{2}-\d{2}$/.test(to) && to >= from ? to : from
  }
  return { start, end, gte: dayStart(start), lt: dayStart(shiftDays(end, 1)) }
}

export function parsePeriod(value?: string): Period {
  return value === "week" || value === "month" || value === "year" || value === "custom" ? value : "today"
}

const RUNNING = ["CONFIRMED", "ASSIGNED", "ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "PICKED_UP", "AT_LAUNDRY", "READY", "OUT_FOR_DELIVERY"]

export async function dashboard(period: Period, from?: string, to?: string) {
  const range = periodRange(period, from, to)
  const chartDays = recentDays(period === "today" || period === "week" ? 7 : 30)
  const chartStart = dayStart(chartDays[0])

  const [booked, completed, chartRows, running, waiting, openTickets, urgentTickets, customers, workers, recent, careOpen] = await Promise.all([
    db.serviceBooking.findMany({
      where: { createdAt: { gte: range.gte, lt: range.lt } },
      select: { status: true, categoryId: true, areaId: true },
    }),
    db.serviceBooking.findMany({
      where: { status: "COMPLETED", completedAt: { gte: range.gte, lt: range.lt } },
      select: { finalPrice: true, estimatedPrice: true, categoryId: true, areaId: true },
    }),
    db.serviceBooking.findMany({
      where: { status: "COMPLETED", completedAt: { gte: chartStart } },
      select: { finalPrice: true, estimatedPrice: true, completedAt: true },
    }),
    db.serviceBooking.count({ where: { status: { in: RUNNING } } }),
    db.serviceBooking.count({ where: { status: "REQUESTED" } }),
    db.ticket.count({ where: { status: { in: ["OPEN", "PENDING"] } } }),
    db.ticket.count({ where: { status: { in: ["OPEN", "PENDING"] }, priority: { in: ["HIGH", "URGENT"] } } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.workerProfile.findMany({
      where: { user: { active: true } },
      include: {
        user: { select: { name: true } },
        skills: { include: { category: { select: { nameBn: true, name: true } } } },
        bookings: {
          where: { status: { in: RUNNING } },
          select: { code: true, status: true, area: { select: { nameBn: true, name: true } } },
          orderBy: { updatedAt: "desc" },
        },
      },
      orderBy: { rating: "desc" },
    }),
    db.serviceBooking.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { customer: { select: { name: true } }, offering: true, area: true, category: { select: { flow: true } } },
    }),
    db.careThread.count({ where: { status: "OPEN", messages: { some: {} } } }),
  ])

  const amount = (r: { finalPrice: number | null; estimatedPrice: number }) => r.finalPrice ?? r.estimatedPrice
  const revenue = completed.reduce((s, r) => s + amount(r), 0)
  const byStatus: Record<string, number> = {}
  for (const b of booked) byStatus[b.status] = (byStatus[b.status] ?? 0) + 1

  const [categories, areas] = await Promise.all([
    db.serviceCategory.findMany({ select: { id: true, name: true, nameBn: true, icon: true } }),
    db.serviceArea.findMany({ select: { id: true, name: true, nameBn: true } }),
  ])
  const top = <T extends { id: string }>(rows: T[], key: "categoryId" | "areaId") =>
    rows
      .map((row) => ({
        ...row,
        bookings: booked.filter((b) => b[key] === row.id).length,
        revenue: completed.filter((b) => b[key] === row.id).reduce((s, r) => s + amount(r), 0),
      }))
      .filter((r) => r.bookings || r.revenue)
      .sort((a, b) => b.bookings - a.bookings || b.revenue - a.revenue)
      .slice(0, 6)

  const series = chartDays.map((day) => ({
    day,
    revenue: chartRows.filter((r) => r.completedAt && localDate(r.completedAt) === day).reduce((s, r) => s + amount(r), 0),
  }))

  return {
    range,
    revenue,
    bookings: booked.length,
    completedCount: completed.length,
    running,
    waiting,
    openTickets,
    urgentTickets,
    careOpen,
    customers,
    workerCount: workers.length,
    busyWorkers: workers.filter((w) => w.bookings.length).length,
    byStatus,
    topServices: top(categories, "categoryId"),
    topAreas: top(areas, "areaId"),
    series,
    workers,
    recent,
  }
}

export type ReportGroup = "day" | "week" | "month" | "service" | "worker" | "area"

/** Completed-job revenue grouped for the reports page and CSV export. */
export async function report(range: { gte: Date; lt: Date }, group: ReportGroup) {
  const settings = await getSettings()
  const share = Number(settings.workerShare) || 40
  const rows = await db.serviceBooking.findMany({
    where: { status: "COMPLETED", completedAt: { gte: range.gte, lt: range.lt } },
    include: {
      category: { select: { name: true, nameBn: true } },
      area: { select: { name: true, nameBn: true } },
      worker: { include: { user: { select: { name: true } } } },
    },
    orderBy: { completedAt: "asc" },
  })
  const groups = new Map<string, { key: string; label: string; labelBn: string; jobs: number; revenue: number; workerPay: number; cash: number; mobile: number }>()
  for (const r of rows) {
    const day = localDate(r.completedAt!)
    let key = day
    let label = day
    let labelBn = day
    if (group === "week") {
      const d = new Date(`${day}T00:00:00Z`)
      const monday = shiftDays(day, -((d.getUTCDay() + 6) % 7))
      key = monday
      label = `Week of ${monday}`
      labelBn = `${monday} থেকে সপ্তাহ`
    } else if (group === "month") {
      key = day.slice(0, 7)
      label = key
      labelBn = key
    } else if (group === "service") {
      key = r.categoryId
      label = r.category.name
      labelBn = r.category.nameBn
    } else if (group === "worker") {
      key = r.workerId ?? "none"
      label = r.worker?.user.name ?? "Unassigned"
      labelBn = r.worker?.user.name ?? "কর্মী নেই"
    } else if (group === "area") {
      key = r.areaId
      label = r.area.name
      labelBn = r.area.nameBn
    }
    const price = r.finalPrice ?? r.estimatedPrice
    const g = groups.get(key) ?? { key, label, labelBn, jobs: 0, revenue: 0, workerPay: 0, cash: 0, mobile: 0 }
    g.jobs += 1
    g.revenue += price
    g.workerPay += r.workerId ? workerShare(price, r.visitCharge, share) : 0
    if (r.paymentMethod === "CASH") g.cash += price
    else g.mobile += price
    groups.set(key, g)
  }
  const list = [...groups.values()]
  if (group === "service" || group === "worker" || group === "area") list.sort((a, b) => b.revenue - a.revenue)
  const total = list.reduce(
    (t, g) => ({ jobs: t.jobs + g.jobs, revenue: t.revenue + g.revenue, workerPay: t.workerPay + g.workerPay, cash: t.cash + g.cash, mobile: t.mobile + g.mobile }),
    { jobs: 0, revenue: 0, workerPay: 0, cash: 0, mobile: 0 },
  )
  return { rows: list, total, share }
}

function csvCell(value: string | number) {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function toCsv(header: string[], rows: Array<Array<string | number>>) {
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n")
}
