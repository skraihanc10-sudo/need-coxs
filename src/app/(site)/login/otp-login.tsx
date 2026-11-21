"use client"

import { useState, useTransition } from "react"
import { sendOtpAction, verifyOtpAction } from "@/actions/auth"
import { ActionForm, SubmitButton } from "@/components/forms"
import type { Locale } from "@/lib/format"

export function OtpLogin({ locale, next }: { locale: Locale; next: string }) {
  const bn = locale === "bn"
  const T = (b: string, e: string) => (bn ? b : e)
  const [phone, setPhone] = useState("")
  const [sent, setSent] = useState(false)
  const [note, setNote] = useState("")
  const [sending, start] = useTransition()

  function send() {
    const fd = new FormData()
    fd.set("phone", phone)
    start(async () => {
      const r = await sendOtpAction({}, fd)
      setNote(r.error ?? r.message ?? "")
      if (r.ok) setSent(true)
    })
  }

  return (
    <ActionForm action={verifyOtpAction} resetOnSuccess={false} className="card space-y-4 p-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="phone">{T("মোবাইল নম্বর", "Mobile number")}</label>
        <div className="flex gap-2">
          <input id="phone" name="phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="field flex-1" placeholder="01XXXXXXXXX" autoComplete="tel" required />
          <button type="button" onClick={send} disabled={sending || phone.replace(/\D/g, "").length < 11} className="btn-soft shrink-0 px-4">
            {sending ? "…" : sent ? T("আবার", "Resend") : T("কোড পাঠান", "Send code")}
          </button>
        </div>
        {note ? <p className="mt-2 text-sm font-semibold text-brand">{note}</p> : null}
      </div>
      <div className={sent ? "" : "opacity-50"}>
        <label className="label" htmlFor="code">{T("৬ সংখ্যার কোড", "6-digit code")}</label>
        <input id="code" name="code" inputMode="numeric" maxLength={6} pattern="\d{6}" className="field text-center text-xl tracking-[0.5em]" placeholder="______" disabled={!sent} required autoComplete="one-time-code" />
      </div>
      <div className={sent ? "" : "opacity-50"}>
        <label className="label" htmlFor="name">{T("নাম (নতুন হলে)", "Name (if you're new)")}</label>
        <input id="name" name="name" className="field" placeholder={T("আপনার নাম", "Your name")} disabled={!sent} maxLength={80} />
      </div>
      <SubmitButton disabled={!sent} pendingText={T("ঢুকছি…", "Signing in…")}>{T("ঢুকুন", "Continue")}</SubmitButton>
    </ActionForm>
  )
}
