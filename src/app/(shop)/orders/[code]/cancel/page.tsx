"use client"

import { useActionState } from "react"
import { useParams } from "next/navigation"
import { cancelOrder } from "@/actions/shop"
import { PageHeader } from "@/components/bits"
import { SubmitButton } from "@/components/interactive"

const REASONS = ["Changed my mind", "Ordered by mistake", "Need a different time", "Found another laundry", "Wrong items"]

export default function CancelPage() {
  const params = useParams<{ code: string }>()
  const [state, action] = useActionState(cancelOrder, { error: "" })
  return (
    <div>
      <PageHeader title="Cancel" back={`/orders/${params.code}`} />
      <form action={action} className="space-y-2 px-4">
        <input type="hidden" name="code" value={params.code} />
        {REASONS.map((reason) => (
          <label key={reason} className="flex items-center gap-3 rounded-2xl border px-3 py-3">
            <input type="radio" name="reason" value={reason} required />
            {reason}
          </label>
        ))}
        {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
        <SubmitButton>Confirm cancel</SubmitButton>
      </form>
    </div>
  )
}
