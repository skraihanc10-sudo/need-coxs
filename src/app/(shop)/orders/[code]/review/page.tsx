"use client"

import { useActionState } from "react"
import { useParams } from "next/navigation"
import { reviewOrder } from "@/actions/shop"
import { PageHeader } from "@/components/bits"
import { Stars, SubmitButton } from "@/components/interactive"

export default function ReviewPage() {
  const params = useParams<{ code: string }>()
  const [state, action] = useActionState(reviewOrder, { error: "" })
  return (
    <div>
      <PageHeader title="Review" back={`/orders/${params.code}`} />
      <form action={action} className="space-y-4 px-4">
        <input type="hidden" name="code" value={params.code} />
        <Stars />
        <textarea name="comment" required minLength={3} placeholder="How was the wash?" className="min-h-28 w-full rounded-xl border px-3 py-2" />
        {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
        <SubmitButton>Submit</SubmitButton>
      </form>
    </div>
  )
}
