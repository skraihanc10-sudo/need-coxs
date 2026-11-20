"use client"

import { useState } from "react"
import { saveSchedule } from "@/actions/shop"
import { SubmitButton } from "./interactive"
import { formatDay, type Locale } from "@/lib/format"

export function ScheduleForm({
  days,
  slots,
  addresses,
  draft,
  locale,
  labels,
}: {
  days: string[]
  slots: string[]
  addresses: { id: string; label: string; line1: string; area: string }[]
  draft: { addressId?: string; pickupDate?: string; pickupSlot?: string; deliveryDate?: string; deliverySlot?: string; preference?: string; notes?: string }
  locale: Locale
  labels: { pickup: string; dropoff: string; next: string; address: string; preference: string; regular: string; free: string; baby: string; notes: string }
}) {
  const [leg, setLeg] = useState<"pickup" | "delivery">("pickup")
  const [pickupDate, setPickupDate] = useState(draft.pickupDate || days[0] || "")
  const [deliveryDate, setDeliveryDate] = useState(draft.deliveryDate || days[Math.min(2, days.length - 1)] || "")
  const [pickupSlot, setPickupSlot] = useState(draft.pickupSlot || slots[0] || "")
  const [deliverySlot, setDeliverySlot] = useState(draft.deliverySlot || slots[0] || "")
  const date = leg === "pickup" ? pickupDate : deliveryDate
  const setDate = leg === "pickup" ? setPickupDate : setDeliveryDate
  const slot = leg === "pickup" ? pickupSlot : deliverySlot
  const setSlot = leg === "pickup" ? setPickupSlot : setDeliverySlot

  return (
    <form action={saveSchedule} className="space-y-4 px-4 pb-8">
      <input type="hidden" name="pickupDate" value={pickupDate} />
      <input type="hidden" name="deliveryDate" value={deliveryDate} />
      <input type="hidden" name="pickupSlot" value={pickupSlot} />
      <input type="hidden" name="deliverySlot" value={deliverySlot} />
      <div className="seg">
        <button type="button" data-on={leg === "pickup"} onClick={() => setLeg("pickup")}>{labels.pickup}</button>
        <button type="button" data-on={leg === "delivery"} onClick={() => setLeg("delivery")}>{labels.dropoff}</button>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {days.map((day) => (
          <button key={day} type="button" data-on={date === day} onClick={() => setDate(day)} className="min-w-20 rounded-2xl border px-3 py-3 text-sm font-bold data-[on=true]:border-[var(--brand)] data-[on=true]:bg-[var(--brand-soft)]">
            {formatDay(day, locale)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {slots.map((item) => (
          <button key={item} type="button" data-on={slot === item} onClick={() => setSlot(item)} className="rounded-xl border px-2 py-3 text-sm font-semibold data-[on=true]:bg-primary data-[on=true]:text-primary-foreground">
            {item}
          </button>
        ))}
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-bold">{labels.address}</legend>
        {addresses.map((address) => (
          <label key={address.id} className="flex gap-3 rounded-2xl border p-3">
            <input type="radio" name="addressId" value={address.id} defaultChecked={draft.addressId ? draft.addressId === address.id : address === addresses[0]} />
            <span>
              <span className="block text-xs font-bold text-[var(--accent-ink)]">{address.label}</span>
              <span className="block text-sm">{address.line1}, {address.area}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <label className="block text-sm font-bold">
        {labels.preference}
        <select name="preference" defaultValue={draft.preference || "Regular"} className="mt-1 h-12 w-full rounded-xl border px-3 font-medium">
          <option value="Regular">{labels.regular}</option>
          <option value="Fragrance-free">{labels.free}</option>
          <option value="Baby mild">{labels.baby}</option>
        </select>
      </label>
      <textarea name="notes" defaultValue={draft.notes || ""} placeholder={labels.notes} className="min-h-20 w-full rounded-xl border px-3 py-2 text-sm" />
      <SubmitButton>{labels.next}</SubmitButton>
    </form>
  )
}
