import { getUser } from "@/lib/auth"
import { parsePeriod, periodRange, report, toCsv, type ReportGroup } from "@/lib/reports"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const user = await getUser()
  if (!user || user.role !== "ADMIN") return new Response("Forbidden", { status: 403 })
  const sp = new URL(request.url).searchParams
  const range = periodRange(parsePeriod(sp.get("p") ?? "month"), sp.get("from") ?? undefined, sp.get("to") ?? undefined)
  const group = (["day", "week", "month", "service", "worker", "area"].includes(sp.get("g") ?? "") ? sp.get("g") : "day") as ReportGroup
  const r = await report(range, group)
  const csv = toCsv(
    ["group", "jobs", "revenue_bdt", "worker_pay_bdt", "margin_bdt", "cash_bdt", "mobile_bdt"],
    [...r.rows.map((row) => [row.label, row.jobs, row.revenue, row.workerPay, row.revenue - row.workerPay, row.cash, row.mobile]), ["TOTAL", r.total.jobs, r.total.revenue, r.total.workerPay, r.total.revenue - r.total.workerPay, r.total.cash, r.total.mobile]],
  )
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="coxs-seba-${group}-${range.start}-${range.end}.csv"`,
    },
  })
}
