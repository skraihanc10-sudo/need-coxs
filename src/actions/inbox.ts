"use server"

import { redirect } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { AppError } from "@/lib/errors"
import { createTicket, replyTicket, sendBookingChat } from "@/lib/inbox"
import { declineQuote } from "@/lib/marketplace"

function fail(path: string, error: unknown): never {
  if (error instanceof AppError) redirect(`${path}?error=${encodeURIComponent(error.message)}`)
  throw error
}

export async function sendBookingChatAction(formData: FormData) {
  const user = await requireUser(["CUSTOMER", "STORE", "DELIVERY", "ADMIN"])
  const code = String(formData.get("code") || "")
  const back = String(formData.get("back") || "/chat")
  try {
    await sendBookingChat(user, code, String(formData.get("body") || ""))
  } catch (error) {
    fail(back, error)
  }
  redirect(back)
}

export async function createTicketAction(formData: FormData) {
  const user = await requireUser(["CUSTOMER", "STORE", "DELIVERY"])
  const back = String(formData.get("back") || "/help")
  try {
    const ticket = await createTicket(user, String(formData.get("subject") || ""), String(formData.get("body") || ""))
    redirect(`${back}/${ticket.code}`)
  } catch (error) {
    fail(`${back}/new`, error)
  }
}

export async function replyTicketAction(formData: FormData) {
  const user = await requireUser(["CUSTOMER", "STORE", "DELIVERY", "ADMIN"])
  const code = String(formData.get("code") || "")
  const back = String(formData.get("back") || "/help")
  try {
    await replyTicket(user, code, String(formData.get("body") || ""), formData.get("close") === "1")
  } catch (error) {
    fail(`${back}/${code}`, error)
  }
  redirect(`${back}/${code}`)
}

export async function declineQuoteAction(formData: FormData) {
  const user = await requireUser(["CUSTOMER"], "/hub")
  const code = String(formData.get("code") || "")
  try {
    await declineQuote(code, user.id)
  } catch (error) {
    fail(`/hub/jobs/${code}`, error)
  }
  redirect(`/hub/jobs/${code}`)
}
