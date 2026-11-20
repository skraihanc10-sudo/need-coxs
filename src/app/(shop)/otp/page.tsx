"use client"

import { useActionState } from "react"
import { verifyOtp, type AuthState } from "@/actions/auth"
import { brand } from "@/theme/brand"
import { SubmitButton } from "@/components/interactive"
import { Logo } from "@/components/logo"

export default function OtpPage() {
  const [state, action] = useActionState(verifyOtp, { error: "" } as AuthState)
  return (
    <div className="px-5 py-10 text-center">
      <Logo />
      <h1 className="mt-6 text-2xl font-extrabold">Verification</h1>
      <p className="mt-2 text-sm text-muted-foreground">No SMS provider is connected. Use the demo code {brand.demoOtp}.</p>
      <form action={action} className="mx-auto mt-6 max-w-xs space-y-3">
        <input name="code" inputMode="numeric" required maxLength={6} className="h-14 w-full rounded-2xl border text-center text-2xl tracking-[0.4em]" />
        {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
        <SubmitButton>Verify</SubmitButton>
      </form>
    </div>
  )
}
