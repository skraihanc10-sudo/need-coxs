"use server"

import { redirect, unstable_rethrow } from "next/navigation"
import { getUser } from "@/lib/auth"
import { AppError } from "@/lib/errors"
import { transitionOrder } from "@/lib/orders"
import { db } from "@/lib/db"

async function riderUser() {
  const user = await getUser()
  if (!user || user.role !== "DELIVERY" || !user.rider) redirect("/login")
  return user
}

export async function riderUpdate(formData: FormData) {
  const user = await riderUser()
  const id = String(formData.get("id") || "")
  const to = String(formData.get("to") || "")
  try {
    await transitionOrder({
      orderId: id,
      actorId: user.id,
      to,
      note: to === "PICKED_UP" ? "Clothes collected" : "Delivered to the customer",
    })
  } catch (error) {
    unstable_rethrow(error)
    const message = error instanceof AppError ? error.message : "Could not update the job."
    redirect(`/rider/jobs/${id}?error=${encodeURIComponent(message)}`)
  }
  redirect(`/rider/jobs/${id}`)
}

export async function toggleAvailability() {
  const user = await riderUser()
  await db.deliveryProfile.update({
    where: { id: user.rider!.id },
    data: { available: !user.rider!.available },
  })
  redirect("/rider/account")
}
