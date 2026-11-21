"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { run, type ActionState } from "@/lib/action"
import { actor, clientIp } from "@/lib/auth"
import { limited } from "@/lib/rate-limit"
import { createTicket, replyTicket, sendBookingMessage, sendCareMessage, setCareThread, updateTicket } from "@/lib/support"
import { formObject, messageSchema, parse, ticketSchema } from "@/lib/validation"

export async function sendBookingMessageAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["CUSTOMER", "WORKER", "SUPPORT", "ADMIN"])
    limited("message", user.id)
    const { body } = parse(messageSchema, formObject(form))
    await sendBookingMessage(user, String(form.get("code") ?? ""), body)
    revalidatePath("/", "layout")
  })
}

export async function sendCareMessageAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["CUSTOMER", "SUPPORT", "ADMIN"])
    limited("message", user.id)
    const { body } = parse(messageSchema, formObject(form))
    const threadId = String(form.get("threadId") ?? "") || null
    await sendCareMessage(user, threadId, body)
    revalidatePath("/", "layout")
  })
}

export async function careThreadAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["SUPPORT", "ADMIN"])
    await setCareThread(user, String(form.get("threadId") ?? ""), {
      assignToMe: form.get("assignToMe") === "1",
      close: form.get("close") === "1",
    })
    revalidatePath("/support", "layout")
    return form.get("close") === "1" ? "চ্যাট বন্ধ করা হয়েছে।" : "আপনার নামে নেওয়া হয়েছে।"
  })
}

export async function createTicketAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const out: { created?: { code: string } } = {}
  const state = await run(async () => {
    const user = await actor(["CUSTOMER"])
    limited("message", `${await clientIp()}:ticket`)
    const input = parse(ticketSchema, formObject(form))
    out.created = await createTicket(user, input)
  })
  if (!state.ok || !out.created) return state
  redirect(`/help/tickets/${out.created.code}`)
}

export async function replyTicketAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["CUSTOMER", "SUPPORT", "ADMIN"])
    limited("message", user.id)
    const { body } = parse(messageSchema, formObject(form))
    await replyTicket(user, String(form.get("code") ?? ""), body)
    revalidatePath("/", "layout")
  })
}

export async function updateTicketAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await actor(["CUSTOMER", "SUPPORT", "ADMIN"])
    await updateTicket(user, String(form.get("code") ?? ""), {
      status: String(form.get("status") ?? "") || undefined,
      priority: String(form.get("priority") ?? "") || undefined,
      assignToMe: form.get("assignToMe") === "1",
    })
    revalidatePath("/", "layout")
    return "টিকেট আপডেট হয়েছে।"
  })
}
