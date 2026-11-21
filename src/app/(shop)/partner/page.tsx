"use client"

import { useActionState } from "react"
import { applyPartner, type AuthState } from "@/actions/auth"
import { Logo } from "@/components/logo"
import { Input } from "@/components/ui/input"
import { SubmitButton } from "@/components/interactive"
const CATEGORIES = [
  ["laundry", "Laundry & dry cleaning"],
  ["wifi", "WiFi & internet"],
  ["electrician", "Electrician"],
  ["plumber", "Plumber"],
  ["ac-fridge", "AC & fridge"],
  ["deep-cleaning", "Home & resort cleaning"],
  ["pest-control", "Pest control"],
  ["painter", "Painter"],
  ["carpenter", "Carpenter"],
  ["movers", "Movers"],
  ["day-labour", "Day labour"],
]

const AREAS = ["Kolatoli", "Sugandha", "Laboni", "Jhautala", "Teknaf Road", "Himchori", "Inani", "Ramu"]

export default function PartnerPage() {
  const [state, action] = useActionState(applyPartner, { error: "" } as AuthState)
  return (
    <div className="px-5 py-8">
      <Logo />
      <h1 className="mt-4 text-2xl font-extrabold">List your service</h1>
      <p className="mt-1 text-sm text-muted-foreground">Cox&apos;s Seba checks the NID before customers can book you.</p>
      <form action={action} className="mt-4 space-y-3">
        <Input name="laundry" required placeholder="Business or your name" className="h-12 rounded-xl px-3" />
        <Input name="owner" required placeholder="Your name" className="h-12 rounded-xl px-3" />
        <Input name="email" type="email" required placeholder="Email" className="h-12 rounded-xl px-3" />
        <Input name="phone" required placeholder="Phone" className="h-12 rounded-xl px-3" />
        <Input name="password" type="password" required minLength={6} placeholder="Password" className="h-12 rounded-xl px-3" />
        <Input name="nid" required minLength={6} placeholder="NID number" className="h-12 rounded-xl px-3" />
        <select name="category" className="h-12 w-full rounded-xl border px-3" required>
          {CATEGORIES.map(([slug, label]) => (
            <option key={slug} value={slug}>{label}</option>
          ))}
        </select>
        <select name="area" className="h-12 w-full rounded-xl border px-3">
          {AREAS.map((area) => (
            <option key={area}>{area}</option>
          ))}
        </select>
        <Input name="address" required placeholder="Street address in Cox's Bazar" className="h-12 rounded-xl px-3" />
        {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
        <SubmitButton>Submit for review</SubmitButton>
      </form>
    </div>
  )
}
