"use server"

import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { notify } from "@/lib/notify"
import { brand } from "@/theme/brand"

export async function subscribe(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const back = String(formData.get("back") || "/")
  if (!email.includes("@")) redirect(`${back}?error=email`)
  await db.subscriber.upsert({
    where: { email },
    update: {},
    create: { email },
  })
  redirect(`${back}?subscribed=1`)
}

export async function sendInquiry(formData: FormData) {
  const name = String(formData.get("name") || "").trim()
  const email = String(formData.get("email") || "").trim()
  const phone = String(formData.get("phone") || "").trim()
  const topic = String(formData.get("topic") || "Pickup")
  const message = String(formData.get("message") || "").trim()
  if (name.length < 2 || !email.includes("@") || message.length < 8) {
    redirect("/contact?error=Add%20your%20name%2C%20a%20real%20email%2C%20and%20a%20short%20message.")
  }
  await db.inquiry.create({ data: { name, email, phone, topic, message } })
  const admin = await db.user.findFirst({ where: { role: "ADMIN" } })
  await notify(admin?.id, brand.name, `${name} wrote from the website about ${topic}.`)
  redirect("/contact?ok=1")
}
