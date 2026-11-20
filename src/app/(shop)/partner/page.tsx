"use client"

import { useActionState } from "react"
import { applyPartner, type AuthState } from "@/actions/auth"
import { Logo } from "@/components/logo"
import { Input } from "@/components/ui/input"
import { SubmitButton } from "@/components/interactive"
import { AREAS } from "@/lib/format"

export default function PartnerPage() {
  const [state, action] = useActionState(applyPartner, { error: "" } as AuthState)
  return (
    <div className="px-5 py-8">
      <Logo />
      <h1 className="mt-4 text-2xl font-extrabold">List your laundry</h1>
      <p className="mt-1 text-sm text-muted-foreground">Need Cox&apos;s reviews the shop before it appears to customers.</p>
      <form action={action} className="mt-4 space-y-3">
        <Input name="laundry" required placeholder="Laundry name" className="h-12 rounded-xl px-3" />
        <Input name="owner" required placeholder="Your name" className="h-12 rounded-xl px-3" />
        <Input name="email" type="email" required placeholder="Email" className="h-12 rounded-xl px-3" />
        <Input name="phone" required placeholder="Phone" className="h-12 rounded-xl px-3" />
        <Input name="password" type="password" required minLength={6} placeholder="Password" className="h-12 rounded-xl px-3" />
        <select name="area" className="h-12 w-full rounded-xl border px-3">
          {AREAS.map((area) => (
            <option key={area.name}>{area.name}</option>
          ))}
        </select>
        <Input name="address" required placeholder="Street address" className="h-12 rounded-xl px-3" />
        {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
        <SubmitButton>Submit for review</SubmitButton>
      </form>
    </div>
  )
}
