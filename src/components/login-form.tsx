"use client"

import { useActionState, useState } from "react"
import { login, type AuthState } from "@/actions/auth"
import { demoAccounts } from "@/theme/demo-accounts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({ next, title }: { next?: string; title: string }) {
  const [state, action, pending] = useActionState(login, { error: "" } as AuthState)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next || ""} />
      <div className="space-y-1.5">
        <Label htmlFor="email">{title}</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-xl px-3" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-xl px-3" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="remember" />
        Remember me
      </label>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="pill w-full">
        {pending ? "Please wait…" : "Sign in"}
      </Button>
      <div className="grid grid-cols-2 gap-2 pt-2">
        {demoAccounts.map((account) => (
          <button
            key={account.email}
            type="button"
            className="rounded-2xl border px-3 py-2 text-left"
            onClick={() => {
              setEmail(account.email)
              setPassword(account.password)
            }}
          >
            <span className="block text-xs font-bold text-[var(--brand)]">{account.label}</span>
            <span className="block truncate text-[11px] text-muted-foreground">{account.email}</span>
          </button>
        ))}
      </div>
    </form>
  )
}
