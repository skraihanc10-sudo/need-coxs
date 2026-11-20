"use client"

import { useActionState } from "react"
import { placeOrder } from "@/actions/shop"
import { SubmitButton } from "@/components/interactive"
import { taka, type Locale } from "@/lib/format"

export function PaymentForm({
  methods,
  wallet,
  locale,
  labels,
}: {
  methods: { id: string; label: string; hint: string; configured: boolean }[]
  wallet: number
  locale: Locale
  labels: { place: string; wallet: string; notes: string }
}) {
  const [state, action] = useActionState(placeOrder, { error: "" })
  return (
    <form action={action} className="space-y-3 px-4 pb-8">
      {methods.map((method, index) => (
        <label key={method.id} className="block rounded-2xl border p-3">
          <span className="flex items-center gap-2 font-bold">
            <input type="radio" name="method" value={method.id} defaultChecked={index === 0} />
            {method.label}
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">{method.hint}</span>
          {!method.configured && method.id !== "COD" ? (
            <span className="mt-1 block text-xs text-amber-700">Gateway keys are not set yet. You can still open the adapter screen.</span>
          ) : null}
        </label>
      ))}
      {wallet > 0 ? (
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="wallet" />
          {labels.wallet} ({taka(wallet, locale)})
        </label>
      ) : null}
      <textarea name="notes" placeholder={labels.notes} className="min-h-20 w-full rounded-xl border px-3 py-2 text-sm" />
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      <SubmitButton>{labels.place}</SubmitButton>
    </form>
  )
}
