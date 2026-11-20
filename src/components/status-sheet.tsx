"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ADMIN_STATUS_OPTIONS } from "@/lib/status"
import { adminSetStatus } from "@/actions/admin"
import { SubmitButton } from "./interactive"

export function StatusSheet({
  orderId,
  status,
  riders,
}: {
  orderId: string
  status: string
  riders: { id: string; name: string }[]
}) {
  return (
    <Sheet>
      <SheetTrigger className="pill flex w-full items-center justify-center bg-primary text-sm text-primary-foreground">
        Update order status
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[80dvh] rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Update order status</SheetTitle>
        </SheetHeader>
        <form action={adminSetStatus} className="space-y-3 px-4 pb-6">
          <input type="hidden" name="id" value={orderId} />
          {ADMIN_STATUS_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-3 rounded-xl border px-3 py-3">
              <input type="radio" name="status" value={option.value} defaultChecked={status === option.value || (status === "OUT_FOR_DELIVERY" && option.value === "READY")} />
              <span className="font-semibold">{option.label}</span>
            </label>
          ))}
          <label className="block text-sm font-semibold">
            Delivery assign
            <select name="riderId" className="mt-1 h-12 w-full rounded-xl border bg-white px-3 font-medium" defaultValue="">
              <option value="">Keep current rider</option>
              {riders.map((rider) => (
                <option key={rider.id} value={rider.id}>
                  {rider.name}
                </option>
              ))}
            </select>
          </label>
          <SubmitButton>Update</SubmitButton>
        </form>
      </SheetContent>
    </Sheet>
  )
}
