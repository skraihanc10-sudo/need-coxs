import type { Locale } from "@/lib/format"
import { named, pick } from "@/lib/i18n"
import { saveWorkerAction } from "@/actions/admin"
import { ActionForm, SubmitButton } from "@/components/forms"

type Worker = {
  id: string
  isRider: boolean
  nid: string
  user: { name: string; phone: string | null; email: string | null }
  skills: Array<{ categoryId: string }>
  areas: Array<{ areaId: string }>
} | null

export function WorkerForm({ locale, worker, categories, areas }: { locale: Locale; worker: Worker; categories: Array<{ id: string; name: string; nameBn: string }>; areas: Array<{ id: string; name: string; nameBn: string }> }) {
  const skills = new Set(worker?.skills.map((s) => s.categoryId))
  const covered = new Set(worker?.areas.map((a) => a.areaId))
  return (
    <ActionForm action={saveWorkerAction} resetOnSuccess={false} className="grid gap-4 md:grid-cols-2">
      {worker ? <input type="hidden" name="id" value={worker.id} /> : null}
      <div className="card space-y-3 p-4 md:col-span-1">
        <div><label className="label">{pick(locale, "নাম", "Name")}</label><input name="name" defaultValue={worker?.user.name} className="field" required minLength={2} maxLength={80} /></div>
        <div><label className="label">{pick(locale, "মোবাইল (লগইন)", "Mobile (login)")}</label><input name="phone" defaultValue={worker?.user.phone ?? ""} className="field" required /></div>
        <div><label className="label">{pick(locale, "ইমেইল (ঐচ্ছিক)", "Email (optional)")}</label><input name="email" type="email" defaultValue={worker?.user.email ?? ""} className="field" /></div>
        <div><label className="label">{worker ? pick(locale, "নতুন পাসওয়ার্ড (ফাঁকা = আগেরটা)", "New password (blank keeps old)") : pick(locale, "পাসওয়ার্ড", "Password")}</label><input name="password" type="password" className="field" autoComplete="new-password" required={!worker} minLength={6} /></div>
        <div><label className="label">{pick(locale, "NID নম্বর", "NID number")}</label><input name="nid" defaultValue={worker?.nid} className="field" inputMode="numeric" placeholder="10 / 13 / 17 digits" /></div>
        <label className="flex items-center gap-2 text-sm font-bold text-ink"><input type="checkbox" name="isRider" defaultChecked={worker?.isRider} className="size-4 accent-[var(--brand)]" /> {pick(locale, "লন্ড্রি রাইডার (পিকআপ-ডেলিভারি করেন)", "Laundry rider (does pickup & delivery)")}</label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm"><span className="label">{pick(locale, "ছবি", "Photo")}</span><input type="file" name="photoFile" accept="image/*" className="text-xs" /></label>
          <label className="text-sm"><span className="label">{pick(locale, "NID-র ছবি", "NID photo")}</span><input type="file" name="nidFile" accept="image/*" className="text-xs" /></label>
        </div>
      </div>
      <div className="space-y-4">
        <div className="card p-4">
          <p className="label">{pick(locale, "দক্ষতা (এই সেবাগুলোর কাজ পাবেন)", "Skills (gets jobs from these services)")}</p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 rounded-xl bg-canvas px-3 py-2 text-sm font-semibold"><input type="checkbox" name="skills" value={c.id} defaultChecked={skills.has(c.id)} className="size-4 accent-[var(--brand)]" /> {named(locale, c)}</label>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <p className="label">{pick(locale, "কাজের এলাকা (ফাঁকা = সদরের সব জায়গা)", "Working areas (blank = all of Sadar)")}</p>
          <div className="grid grid-cols-2 gap-1 text-sm">
            {areas.map((a) => (
              <label key={a.id} className="flex items-center gap-2 px-1 py-1"><input type="checkbox" name="areas" value={a.id} defaultChecked={covered.has(a.id)} className="size-4 accent-[var(--brand)]" /> {named(locale, a)}</label>
            ))}
          </div>
        </div>
        <SubmitButton>{worker ? pick(locale, "সেভ করুন", "Save") : pick(locale, "কর্মী যোগ করুন", "Add worker")}</SubmitButton>
      </div>
    </ActionForm>
  )
}
