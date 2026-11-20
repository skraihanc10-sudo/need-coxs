"use client"

import { useActionState } from "react"
import Link from "next/link"
import { register, type AuthState } from "@/actions/auth"
import { Logo } from "@/components/logo"
import { Input } from "@/components/ui/input"
import { SubmitButton } from "@/components/interactive"

export default function RegisterPage() {
  const [state, action] = useActionState(register, { error: "" } as AuthState)
  return (
    <div className="px-5 py-8">
      <Logo />
      <h1 className="mt-6 text-2xl font-extrabold">Create your account</h1>
      <form action={action} className="mt-5 space-y-3">
        <Input name="name" required placeholder="Full name" className="h-12 rounded-xl px-3" />
        <Input name="email" type="email" required placeholder="Email" className="h-12 rounded-xl px-3" />
        <Input name="phone" placeholder="Phone number" className="h-12 rounded-xl px-3" />
        <Input name="referral" placeholder="Referral code" className="h-12 rounded-xl px-3" />
        <Input name="password" type="password" required minLength={6} placeholder="Password" className="h-12 rounded-xl px-3" />
        {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
        <SubmitButton>Continue</SubmitButton>
      </form>
      <p className="mt-4 text-sm">Already registered? <Link className="font-bold text-[var(--brand)]" href="/login">Sign in</Link></p>
    </div>
  )
}
