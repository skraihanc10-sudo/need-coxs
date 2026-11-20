"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { addToCart, type CartState } from "@/actions/shop"
import { taka, type Locale } from "@/lib/format"

export function SubmitButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className={className ?? "pill w-full"}>
      {pending ? "Please wait…" : children}
    </Button>
  )
}

export function Stars({ name = "rating" }: { name?: string }) {
  const [value, setValue] = useState(5)
  return (
    <div className="flex gap-1">
      <input type="hidden" name={name} value={value} />
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => setValue(n)} aria-label={`${n} stars`}>
          <Star className={n <= value ? "size-8 fill-amber-400 text-amber-400" : "size-8 text-slate-300"} />
        </button>
      ))}
    </div>
  )
}

export function CopyCode({ code, label }: { code: string; label: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground"
      onClick={async () => {
        await navigator.clipboard.writeText(code)
        setDone(true)
      }}
    >
      {done ? "Copied" : label}
    </button>
  )
}

export function LiveRefresh() {
  const router = useRouter()
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 4000)
    return () => clearInterval(timer)
  }, [router])
  return null
}

export function ItemPicker({
  itemName,
  unit,
  prices,
  locale,
  addLabel,
  chooseLabel,
}: {
  itemName: string
  unit: string
  prices: { id: string; kind: string; amount: number }[]
  locale: Locale
  addLabel: string
  chooseLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [priceId, setPriceId] = useState(prices[0]?.id ?? "")
  const [state, action] = useActionState(addToCart, null as CartState)
  useEffect(() => {
    if (state?.ok) setOpen(false)
  }, [state])
  if (!prices.length) return null
  const from = Math.min(...prices.map((price) => price.amount))
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
        {addLabel}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{itemName}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{chooseLabel}</p>
          <form action={action} className="space-y-2">
            <input type="hidden" name="priceId" value={priceId} />
            <input type="hidden" name="quantity" value="1" />
            {prices.map((price) => (
              <button
                key={price.id}
                type="button"
                data-on={price.id === priceId}
                onClick={() => setPriceId(price.id)}
                className="flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left data-[on=true]:border-[var(--brand)] data-[on=true]:bg-[var(--brand-soft)]"
              >
                <span className="font-semibold">{price.kind}</span>
                <span className="price">{taka(price.amount, locale)} / {unit}</span>
              </button>
            ))}
            {state?.clash ? (
              <>
                <input type="hidden" name="replace" value="1" />
                <p className="text-sm text-amber-700">This replaces clothes from another laundry.</p>
              </>
            ) : null}
            {state?.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
            <SubmitButton>{addLabel}</SubmitButton>
          </form>
        </DialogContent>
      </Dialog>
      <span className="sr-only">From {taka(from, locale)}</span>
    </>
  )
}
