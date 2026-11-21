"use client"

import { useActionState, useEffect, useRef, useSyncExternalStore } from "react"
import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { ActionState } from "@/lib/action"

type Action = (prev: ActionState, form: FormData) => Promise<ActionState>

const subscribeNoop = () => () => {}

/**
 * A form wired to a server action. Errors show under the form in the page's
 * language; a success message pops as a toast and the form resets.
 */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = true,
  successToast = true,
  onDone,
  ...rest
}: Omit<React.ComponentProps<"form">, "action"> & {
  action: Action
  resetOnSuccess?: boolean
  successToast?: boolean
  onDone?: () => void
}) {
  const [state, formAction] = useActionState(action, {})
  const ref = useRef<HTMLFormElement>(null)
  const seen = useRef<number | undefined>(undefined)
  // false on the server, true once hydrated: tests wait for it before clicking.
  const ready = useSyncExternalStore(subscribeNoop, () => true, () => false)
  useEffect(() => {
    if (!state.at || state.at === seen.current) return
    seen.current = state.at
    if (state.ok) {
      if (state.message && successToast) toast.success(state.message)
      if (resetOnSuccess) ref.current?.reset()
      onDone?.()
    }
  }, [state, resetOnSuccess, successToast, onDone])
  return (
    <form ref={ref} action={formAction} className={className} data-ready={ready} {...rest}>
      {children}
      {state.error ? (
        <p role="alert" className="mt-3 rounded-xl bg-[var(--danger-soft)] px-3.5 py-2.5 text-sm font-semibold text-danger">
          {state.error}
        </p>
      ) : null}
    </form>
  )
}

export function SubmitButton({
  children,
  className = "btn-primary w-full",
  pendingText,
  ...rest
}: React.ComponentProps<"button"> & { pendingText?: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={className} {...rest}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {pending && pendingText ? pendingText : children}
    </button>
  )
}

/** A tiny form with one button, for actions that need no fields. */
export function ActionButton({
  action,
  children,
  className = "btn-ghost",
  fields = {},
  confirm,
}: {
  action: Action
  children: React.ReactNode
  className?: string
  fields?: Record<string, string>
  confirm?: string
}) {
  return (
    <ActionForm
      action={action}
      className="inline"
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault()
      }}
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <SubmitButton className={className}>{children}</SubmitButton>
    </ActionForm>
  )
}

export function Stars({ name = "rating", value = 0 }: { name?: string; value?: number }) {
  return (
    <div className="flex gap-1" role="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n} className="cursor-pointer">
          <input type="radio" name={name} value={n} defaultChecked={n === value} className="peer sr-only" required />
          <span className="block text-3xl text-line transition peer-checked:text-amber-400 [&:has(~input:checked)]:text-amber-400 hover:text-amber-300">★</span>
        </label>
      ))}
    </div>
  )
}
