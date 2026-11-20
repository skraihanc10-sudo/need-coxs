"use client"

import { useActionState } from "react"
import { sendChat } from "@/actions/shop"

export function ChatComposer({ placeholder, send }: { placeholder: string; send: string }) {
  const [state, action, pending] = useActionState(sendChat, { error: "" })
  return (
    <form action={action} className="sticky bottom-[4.8rem] flex gap-2 px-4">
      <input name="body" required placeholder={placeholder} className="h-12 flex-1 rounded-full border px-4" />
      <button disabled={pending} className="rounded-full bg-[var(--accent)] px-4 text-sm font-extrabold text-[#06283a]">{send}</button>
      {state.error ? <span className="sr-only">{state.error}</span> : null}
    </form>
  )
}
