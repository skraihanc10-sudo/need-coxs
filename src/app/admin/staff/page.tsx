import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { pick } from "@/lib/i18n"
import { ROLE_LABEL } from "@/lib/roles"
import { resetPasswordAction, saveStaffAction, toggleUserAction } from "@/actions/admin"
import { ActionForm, SubmitButton } from "@/components/forms"
import { PageHeader, Section } from "@/components/bits"

export default async function StaffPage() {
  const [me, locale] = await Promise.all([requireUser(["ADMIN"], "/admin/staff"), getLocale()])
  const staff = await db.user.findMany({ where: { role: { in: ["ADMIN", "SUPPORT"] } }, orderBy: [{ role: "asc" }, { name: "asc" }] })
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div>
        <PageHeader title={pick(locale, "স্টাফ", "Staff")} sub={pick(locale, "অ্যাডমিন (সব অধিকার) আর সাপোর্ট (ইনবক্স, বুকিং, কর্মী assign)।", "Admins (everything) and support agents (inbox, bookings, assigning).")} />
        <div className="space-y-2">
          {staff.map((s) => (
            <div key={s.id} className={`card flex flex-wrap items-center gap-3 p-4 ${s.active ? "" : "opacity-60"}`}>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-ink">{s.name} <span className="pill ml-1 bg-brand-soft text-brand">{ROLE_LABEL[s.role]?.[locale]}</span></p>
                <p className="text-xs text-muted-foreground">{s.email} {s.phone ? `· ${s.phone}` : ""}</p>
              </div>
              <ActionForm action={resetPasswordAction} className="flex gap-2">
                <input type="hidden" name="id" value={s.id} />
                <input name="password" type="password" className="field h-9 w-40 text-sm" placeholder={pick(locale, "নতুন পাসওয়ার্ড", "New password")} minLength={6} required />
                <SubmitButton className="btn-soft h-9 px-3 text-xs">{pick(locale, "সেট", "Set")}</SubmitButton>
              </ActionForm>
              {s.id !== me.id ? <form action={toggleUserAction}><input type="hidden" name="id" value={s.id} /><button className="text-xs font-bold text-muted-foreground hover:text-ink">{s.active ? pick(locale, "নিষ্ক্রিয়", "Deactivate") : pick(locale, "সক্রিয়", "Activate")}</button></form> : null}
            </div>
          ))}
        </div>
      </div>
      <Section title={pick(locale, "নতুন স্টাফ", "New staff")}>
        <ActionForm action={saveStaffAction} className="space-y-2">
          <input name="name" className="field" placeholder={pick(locale, "নাম", "Name")} required />
          <input name="email" type="email" className="field" placeholder="email@…" required />
          <input name="phone" className="field" placeholder={pick(locale, "মোবাইল (ঐচ্ছিক)", "Mobile (optional)")} />
          <input name="password" type="password" className="field" placeholder={pick(locale, "পাসওয়ার্ড", "Password")} minLength={6} required autoComplete="new-password" />
          <select name="role" className="field" defaultValue="SUPPORT"><option value="SUPPORT">{ROLE_LABEL.SUPPORT[locale]}</option><option value="ADMIN">{ROLE_LABEL.ADMIN[locale]}</option></select>
          <SubmitButton>{pick(locale, "অ্যাকাউন্ট তৈরি", "Create account")}</SubmitButton>
        </ActionForm>
      </Section>
    </div>
  )
}
