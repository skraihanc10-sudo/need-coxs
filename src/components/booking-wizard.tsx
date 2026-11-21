"use client"

import { useMemo, useState, useTransition } from "react"
import { Camera, Check, ChevronLeft, MapPin } from "lucide-react"
import { createBookingAction, } from "@/actions/booking"
import { sendOtpAction } from "@/actions/auth"
import { ActionForm, SubmitButton } from "./forms"
import { estimate, unitLabel, usesQuantity } from "@/lib/pricing"
import { formatDay, taka, type Locale } from "@/lib/format"

type Area = { id: string; name: string; nameBn: string; charge: number }
type Address = { id: string; label: string; areaId: string; line: string; landmark: string; phone: string }

export type WizardProps = {
  locale: Locale
  category: { slug: string; name: string; nameBn: string; flow: string }
  offering: { id: string; name: string; nameBn: string; pricing: string; price: number; minQty: number; detail: string; detailBn: string }
  areas: Area[]
  slots: string[]
  days: string[]
  payments: Array<{ id: string; label: string; labelBn: string; hint: string; hintBn: string }>
  user: { name: string; phone: string; addresses: Address[] } | null
}

export function BookingWizard({ locale, category, offering, areas, slots, days, payments, user }: WizardProps) {
  const bn = locale === "bn"
  const T = (b: string, e: string) => (bn ? b : e)
  const name = (r: { name: string; nameBn: string }) => (bn ? r.nameBn : r.name)
  const quantityJob = usesQuantity(offering.pricing)
  const team = category.flow === "TEAM"
  const custom = category.flow === "CUSTOM"
  const quote = offering.pricing === "QUOTE"

  const [step, setStep] = useState(1)
  const [quantity, setQuantity] = useState(offering.minQty)
  const [teamSize, setTeamSize] = useState(team ? 3 : 1)
  const [dayCount, setDayCount] = useState(1)
  const [areaId, setAreaId] = useState(user?.addresses[0]?.areaId ?? "")
  const [addressLine, setAddressLine] = useState(user?.addresses[0]?.line ?? "")
  const [landmark, setLandmark] = useState(user?.addresses[0]?.landmark ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [contactName, setContactName] = useState(user?.name ?? "")
  const [visitDate, setVisitDate] = useState(days[0])
  const [visitSlot, setVisitSlot] = useState("")
  const [notes, setNotes] = useState("")
  const [payment, setPayment] = useState(payments[0]?.id ?? "CASH")
  const [otpNote, setOtpNote] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [sending, startSending] = useTransition()
  const [problem, setProblem] = useState("")

  const area = areas.find((a) => a.id === areaId)
  const price = useMemo(
    () => estimate({ pricing: offering.pricing, unitPrice: offering.price, quantity, days: dayCount, areaCharge: area?.charge ?? 0 }),
    [offering, quantity, dayCount, area],
  )

  function next() {
    setProblem("")
    if (step === 1 && custom && notes.trim().length < 10) return setProblem(T("কী কাজ লাগবে, একটু বিস্তারিত লিখুন।", "Tell us a little more about the job."))
    if (step === 2) {
      if (!areaId) return setProblem(T("এলাকা বেছে নিন। এই মুহূর্তে আমরা শুধু কক্সবাজার সদরে সেবা দিচ্ছি।", "Choose your area. Right now we only serve Cox's Bazar Sadar."))
      if (addressLine.trim().length < 4) return setProblem(T("পুরো ঠিকানা লিখুন।", "Add your full address."))
      if (!/^(\+?88)?01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ""))) return setProblem(T("সঠিক মোবাইল নম্বর দিন (০১ দিয়ে শুরু, ১১ সংখ্যা)।", "Enter a valid mobile number (11 digits, starting with 01)."))
      if (!visitSlot) return setProblem(T("একটা সময় বেছে নিন।", "Choose a time slot."))
    }
    setStep((s) => Math.min(3, s + 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function sendCode() {
    const fd = new FormData()
    fd.set("phone", phone)
    startSending(async () => {
      const r = await sendOtpAction({}, fd)
      setOtpNote(r.error ?? r.message ?? "")
      if (r.ok) setOtpSent(true)
    })
  }

  const applyAddress = (a: Address) => {
    setAreaId(a.areaId)
    setAddressLine(a.line)
    setLandmark(a.landmark)
    setPhone(a.phone)
  }

  const stepTitles = [T("সেবা ও অপশন", "Service & options"), T("ঠিকানা ও সময়", "Address & time"), T("নিশ্চিত করুন", "Confirm")]

  return (
    <ActionForm action={createBookingAction} resetOnSuccess={false} className="pb-28">
      <input type="hidden" name="offeringId" value={offering.id} />
      <input type="hidden" name="areaId" value={areaId} />
      <input type="hidden" name="visitDate" value={visitDate} />
      <input type="hidden" name="visitSlot" value={visitSlot} />
      <input type="hidden" name="paymentMethod" value={payment} />
      <input type="hidden" name="quantity" value={quantity} />
      <input type="hidden" name="teamSize" value={teamSize} />
      <input type="hidden" name="days" value={dayCount} />

      {/* Stepper */}
      <ol className="mb-5 grid grid-cols-3 gap-2">
        {stepTitles.map((label, i) => {
          const n = i + 1
          return (
            <li key={label} className="flex items-center gap-2 text-xs font-bold">
              <span className={`grid size-7 shrink-0 place-items-center rounded-full ${n < step ? "bg-ok text-white" : n === step ? "bg-brand text-white" : "bg-line text-muted-foreground"}`}>
                {n < step ? <Check className="size-4" /> : n}
              </span>
              <span className={n === step ? "text-ink" : "text-muted-foreground"}>{label}</span>
            </li>
          )
        })}
      </ol>

      {/* Step 1: options */}
      <section className={step === 1 ? "space-y-4" : "hidden"}>
        <div className="card p-4">
          <p className="text-xs font-bold text-brand">{name(category)}</p>
          <h2 className="display text-xl font-extrabold text-ink">{name(offering)}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{bn ? offering.detailBn : offering.detail}</p>
          <p className="mt-2 text-sm font-bold text-ink">
            {quote ? (offering.price ? T(`পরিদর্শন ফি ${taka(offering.price, locale)}, কাজের দাম দেখে জানানো হবে`, `Inspection ${taka(offering.price, locale)}; the job is quoted after a visit`) : T("দাম দেখে জানানো হবে", "Priced after we see the job")) : `${taka(offering.price, locale)} / ${unitLabel(offering.pricing, locale)}`}
          </p>
        </div>

        {quantityJob ? (
          <Counter label={offering.pricing === "PER_ROOM" ? T("কত রুম?", "How many rooms?") : offering.pricing === "PER_KG" ? T("আনুমানিক কত কেজি?", "Roughly how many kg?") : offering.pricing === "PER_HOUR" ? T("কত ঘণ্টা?", "How many hours?") : T("কত পিস?", "How many items?")} value={quantity} min={offering.minQty} max={200} onChange={setQuantity} hint={offering.minQty > 1 ? T(`সর্বনিম্ন ${offering.minQty}`, `Minimum ${offering.minQty}`) : undefined} />
        ) : null}
        {team ? (
          <>
            <Counter label={T("টিমে কতজন?", "Team size")} value={teamSize} min={1} max={20} onChange={setTeamSize} />
            <Counter label={T("কত দিন?", "How many days?")} value={dayCount} min={1} max={30} onChange={setDayCount} />
          </>
        ) : null}

        <div className="card p-4">
          <label className="label" htmlFor="notes">{custom ? T("আপনার কাজটা লিখুন", "Describe your job") : T("নোট (ঐচ্ছিক)", "Notes (optional)")}</label>
          <textarea id="notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} className="field" placeholder={custom ? T("যেমন: ছাদের টিন ফুটো, বৃষ্টিতে পানি পড়ে, ২ জন লোক লাগবে", "e.g. the roof tin leaks when it rains, need 2 people") : T("সমস্যাটা বা বিশেষ কিছু থাকলে লিখুন", "Describe the problem or anything special")} />
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-bold text-brand">
            <Camera className="size-4" /> {T("ছবি যোগ করুন (ঐচ্ছিক, ৪টা পর্যন্ত)", "Add photos (optional, up to 4)")}
            <input type="file" name="photos" accept="image/*" multiple className="sr-only" />
          </label>
        </div>
      </section>

      {/* Step 2: where & when */}
      <section className={step === 2 ? "space-y-4" : "hidden"}>
        {user?.addresses.length ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {user.addresses.map((a) => (
              <button key={a.id} type="button" onClick={() => applyAddress(a)} className="chip shrink-0" data-on={a.line === addressLine && a.areaId === areaId}>
                <MapPin className="mr-1 size-3.5" /> {a.label}
              </button>
            ))}
          </div>
        ) : null}
        <div className="card space-y-4 p-4">
          <div>
            <label className="label" htmlFor="area">{T("এলাকা", "Area")} <span className="font-normal text-muted-foreground">· {T("শুধু কক্সবাজার সদর", "Cox's Bazar Sadar only")}</span></label>
            <select id="area" value={areaId} onChange={(e) => setAreaId(e.target.value)} className="field">
              <option value="">{T("এলাকা বেছে নিন", "Choose an area")}</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{name(a)}{a.charge ? ` (+${taka(a.charge, locale)})` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="addressLine">{T("ঠিকানা", "Address")}</label>
            <input id="addressLine" name="addressLine" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className="field" placeholder={T("বাড়ি নম্বর, রোড, ফ্লোর", "House, road, floor")} maxLength={200} />
          </div>
          <div>
            <label className="label" htmlFor="landmark">{T("বাড়ি বা ল্যান্ডমার্ক", "House or landmark")}</label>
            <input id="landmark" name="landmark" value={landmark} onChange={(e) => setLandmark(e.target.value)} className="field" placeholder={T("যেমন: মসজিদের পাশে, নীল গেট", "e.g. next to the mosque, blue gate")} maxLength={120} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="phone">{T("মোবাইল নম্বর", "Mobile number")}</label>
              <input id="phone" name="phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="field" placeholder="01XXXXXXXXX" maxLength={20} />
            </div>
            <div>
              <label className="label" htmlFor="contactName">{T("নাম", "Name")}</label>
              <input id="contactName" name="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} className="field" placeholder={T("যার সাথে যোগাযোগ হবে", "Who we should ask for")} maxLength={80} />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <p className="label">{T("তারিখ", "Date")}</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((d) => (
              <button key={d} type="button" onClick={() => setVisitDate(d)} className="chip shrink-0" data-on={d === visitDate}>{formatDay(d, locale)}</button>
            ))}
          </div>
          <p className="label mt-4">{T("সময়", "Time slot")}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {slots.map((s) => (
              <button key={s} type="button" onClick={() => setVisitSlot(s)} className="chip justify-center" data-on={s === visitSlot}>{s}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Step 3: confirm */}
      <section className={step === 3 ? "space-y-4" : "hidden"}>
        <div className="card divide-y divide-line p-4 text-[15px]">
          <Line k={T("সেবা", "Service")} v={`${name(category)} · ${name(offering)}`} />
          {quantityJob ? <Line k={T("পরিমাণ", "Quantity")} v={`${quantity} ${unitLabel(offering.pricing, locale)}${team ? ` × ${dayCount} ${T("দিন", "days")} · ${teamSize} ${T("জন", "people")}` : ""}`} /> : null}
          <Line k={T("এলাকা", "Area")} v={area ? name(area) : "—"} />
          <Line k={T("ঠিকানা", "Address")} v={`${addressLine}${landmark ? `, ${landmark}` : ""}`} />
          <Line k={T("সময়", "When")} v={`${formatDay(visitDate, locale)} · ${visitSlot}`} />
          <Line k={T("যোগাযোগ", "Contact")} v={`${contactName || "—"} · ${phone}`} />
          {notes ? <Line k={T("নোট", "Notes")} v={notes} /> : null}
        </div>

        <div className="card p-4">
          <p className="label">{T("কীভাবে টাকা দেবেন?", "How will you pay?")}</p>
          <div className="grid gap-2">
            {payments.map((p) => (
              <label key={p.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${payment === p.id ? "border-brand bg-brand-soft" : "border-line"}`}>
                <input type="radio" name="payment-choice" checked={payment === p.id} onChange={() => setPayment(p.id)} className="mt-1 accent-[var(--brand)]" />
                <span>
                  <span className="block font-bold text-ink">{bn ? p.labelBn : p.label}</span>
                  <span className="block text-xs text-muted-foreground">{bn ? p.hintBn : p.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {!user ? (
          <div className="card p-4">
            <p className="font-extrabold text-ink">{T("মোবাইল নম্বর যাচাই", "Verify your mobile")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{T(`${phone} নম্বরে একটা ৬ সংখ্যার কোড পাঠাব। অ্যাকাউন্ট খোলা লাগবে না।`, `We'll text a 6-digit code to ${phone}. No account needed.`)}</p>
            <input type="hidden" name="name" value={contactName} />
            <div className="mt-3 flex gap-2">
              <input name="otp" inputMode="numeric" maxLength={6} pattern="\d{6}" placeholder="______" className="field flex-1 text-center text-lg tracking-[0.5em]" disabled={!otpSent} />
              <button type="button" onClick={sendCode} disabled={sending} className="btn-soft shrink-0 px-4">{sending ? "…" : otpSent ? T("আবার পাঠান", "Resend") : T("কোড পাঠান", "Send code")}</button>
            </div>
            {otpNote ? <p className="mt-2 text-sm font-semibold text-brand">{otpNote}</p> : null}
          </div>
        ) : null}
      </section>

      {problem ? <p role="alert" className="mt-3 rounded-xl bg-[var(--danger-soft)] px-3.5 py-2.5 text-sm font-semibold text-danger">{problem}</p> : null}

      {/* Sticky estimate + nav */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase">{quote ? T("আনুমানিক", "Estimate") : T("আনুমানিক দাম", "Estimated price")}</p>
            <p className="text-lg font-extrabold text-ink">
              {quote && !offering.price ? T("দেখে জানাব", "Quoted on site") : taka(price.total, locale)}
              {area?.charge ? <span className="ml-1 text-xs font-semibold text-muted-foreground">({T("ভিজিট চার্জসহ", "incl. visit charge")})</span> : null}
            </p>
          </div>
          {step > 1 ? (
            <button type="button" onClick={() => { setProblem(""); setStep((s) => s - 1) }} className="btn-ghost h-12 px-4" aria-label="Back"><ChevronLeft className="size-5" /></button>
          ) : null}
          {step < 3 ? (
            <button type="button" onClick={next} className="btn-primary h-12 px-6">{T("পরের ধাপ", "Next")}</button>
          ) : (
            <SubmitButton className="btn-primary h-12 px-6" pendingText={T("বুক হচ্ছে…", "Booking…")}>{T("বুকিং নিশ্চিত করুন", "Confirm booking")}</SubmitButton>
          )}
        </div>
      </div>
    </ActionForm>
  )
}

function Counter({ label, value, min, max, onChange, hint }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; hint?: string }) {
  return (
    <div className="card flex items-center justify-between gap-3 p-4">
      <div>
        <p className="font-bold text-ink">{label}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="grid size-10 place-items-center rounded-full bg-canvas text-xl font-bold ring-1 ring-line">−</button>
        <input type="number" value={value} min={min} max={max} onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))} className="h-10 w-16 rounded-xl border border-line text-center font-extrabold" />
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="grid size-10 place-items-center rounded-full bg-brand text-xl font-bold text-white">+</button>
      </div>
    </div>
  )
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <span className="shrink-0 text-muted-foreground">{k}</span>
      <span className="text-right font-semibold text-ink">{v}</span>
    </div>
  )
}
