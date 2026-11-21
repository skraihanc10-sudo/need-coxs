"use client"

import { useRef } from "react"
import { SendHorizonal } from "lucide-react"
import { formatWhen, type Locale } from "@/lib/format"
import { ActionForm, SubmitButton } from "./forms"
import type { ActionState } from "@/lib/action"
import { ROLE_LABEL } from "@/lib/roles"

export type ChatMessage = {
  id: string
  body: string
  createdAt: Date
  senderId: string
  sender: { name: string; role: string }
}

export function MessageList({ messages, me, locale, empty }: { messages: ChatMessage[]; me: string; locale: Locale; empty: string }) {
  if (!messages.length) return <p className="py-10 text-center text-sm text-muted-foreground">{empty}</p>
  return (
    <ol className="flex flex-col gap-2.5">
      {messages.map((m) => {
        const mine = m.senderId === me
        return (
          <li key={m.id} className="flex flex-col">
            <div className="bubble" data-mine={mine}>
              {!mine ? (
                <p className="mb-0.5 text-[11px] font-extrabold text-brand">
                  {m.sender.name} · {ROLE_LABEL[m.sender.role]?.[locale] ?? m.sender.role}
                </p>
              ) : null}
              <p className="whitespace-pre-wrap">{m.body}</p>
            </div>
            <span className={`mt-0.5 text-[10px] text-muted-foreground ${mine ? "text-right" : ""}`}>{formatWhen(m.createdAt, locale)}</span>
          </li>
        )
      })}
    </ol>
  )
}

export function Composer({
  action,
  fields,
  placeholder,
  templates,
}: {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>
  fields: Record<string, string>
  placeholder: string
  templates?: Array<{ id: string; title: string; body: string }>
}) {
  const box = useRef<HTMLTextAreaElement>(null)
  return (
    <ActionForm
      action={action}
      className="sticky bottom-[calc(3.9rem+env(safe-area-inset-bottom))] mt-4 rounded-2xl bg-paper p-2 ring-1 ring-line md:bottom-4"
      successToast={false}
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {templates?.length ? (
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              className="chip shrink-0"
              onClick={() => {
                if (!box.current) return
                box.current.value = t.body
                box.current.focus()
              }}
            >
              {t.title}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <textarea
          ref={box}
          name="body"
          required
          maxLength={2000}
          rows={1}
          placeholder={placeholder}
          className="field min-h-12 flex-1 resize-none py-3"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) e.currentTarget.form?.requestSubmit()
          }}
        />
        <SubmitButton className="btn-primary size-12 shrink-0 rounded-xl px-0" aria-label="Send">
          <SendHorizonal className="size-5" />
        </SubmitButton>
      </div>
    </ActionForm>
  )
}
