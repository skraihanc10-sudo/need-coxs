"use client"

import { useActionState } from "react"
import { updateProfile, type AuthState } from "@/actions/auth"
import { PageHeader } from "@/components/bits"
import { SubmitButton } from "@/components/interactive"
import { Input } from "@/components/ui/input"

export default function EditProfile() {
  const [state, action] = useActionState(updateProfile, { error: "" } as AuthState)
  return (
    <div>
      <PageHeader title="Edit profile" back="/profile" />
      <form action={action} className="space-y-3 px-4">
        <Input name="name" required placeholder="Full name" className="h-12 rounded-xl px-3" />
        <Input name="phone" placeholder="Phone" className="h-12 rounded-xl px-3" />
        <Input name="password" type="password" placeholder="New password (optional)" className="h-12 rounded-xl px-3" />
        {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
        <SubmitButton>Save</SubmitButton>
      </form>
    </div>
  )
}
