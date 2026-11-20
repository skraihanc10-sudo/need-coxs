import { db } from "@/lib/db"

export async function POST(request: Request) {
  const secret = process.env.PAYMENTS_WEBHOOK_SECRET
  if (!secret || request.headers.get("x-neel-signature") !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = (await request.json()) as { orderCode?: string; provider?: string; reference?: string; status?: string }
  if (!body.orderCode || body.status !== "PAID") {
    return Response.json({ error: "Expected orderCode and status PAID" }, { status: 400 })
  }
  const order = await db.order.findUnique({ where: { code: body.orderCode } })
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 })
  await db.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID" } })
  await db.payment.update({
    where: { orderId: order.id },
    data: { status: "PAID", provider: body.provider || order.paymentMethod, reference: body.reference || null },
  })
  return Response.json({ ok: true })
}
