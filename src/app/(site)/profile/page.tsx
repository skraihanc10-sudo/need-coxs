import Link from "next/link"
import { Bell, ChevronRight, LogOut, MapPin, Trash2 } from "lucide-react"
import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { activeAreas } from "@/lib/catalog"
import { unreadNotices } from "@/lib/notify"
import { named, pick, words } from "@/lib/i18n"
import { deleteAddressAction, logoutAction, saveAddressAction, updateProfileAction } from "@/actions/auth"
import { LocaleSwitch } from "@/components/locale-switch"
import { ActionForm, SubmitButton } from "@/components/forms"
import { Avatar, PageHeader, Section } from "@/components/bits"

export default async function ProfilePage() {
  const [user, locale] = await Promise.all([requireUser(["CUSTOMER"], "/profile"), getLocale()])
  const t = words(locale)
  const [addresses, areas, unread] = await Promise.all([
    db.address.findMany({ where: { userId: user.id }, include: { area: true }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] }),
    activeAreas(),
    unreadNotices(user.id),
  ])

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader title={t.profile} />
      <div className="card flex items-center gap-4 p-4">
        <Avatar name={user.name} size={56} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-extrabold text-ink">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.phone ?? user.email}</p>
        </div>
        <LocaleSwitch locale={locale} />
      </div>

      <Link href="/notifications" className="card flex items-center gap-3 p-4">
        <Bell className="size-5 text-brand" />
        <span className="flex-1 font-bold text-ink">{t.notifications}</span>
        {unread ? <span className="pill bg-danger text-white">{unread}</span> : null}
        <ChevronRight className="size-4 text-muted-foreground" />
      </Link>

      <Section title={pick(locale, "আমার ঠিকানা", "My addresses")}>
        {addresses.length ? (
          <ul className="mb-4 space-y-2">
            {addresses.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-xl bg-canvas p-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-bold text-ink">{a.label} · {named(locale, a.area)}</p>
                  <p className="text-muted-foreground">{a.line}{a.landmark ? `, ${a.landmark}` : ""} · {a.phone}</p>
                </div>
                <form action={deleteAddressAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button aria-label="Delete" className="text-muted-foreground hover:text-danger"><Trash2 className="size-4" /></button>
                </form>
              </li>
            ))}
          </ul>
        ) : null}
        <ActionForm action={saveAddressAction} className="grid gap-3 sm:grid-cols-2">
          <input name="label" className="field" placeholder={pick(locale, "নাম, যেমন: বাসা / অফিস", "Label, e.g. Home / Office")} maxLength={30} />
          <select name="areaId" className="field" required defaultValue="">
            <option value="" disabled>{pick(locale, "এলাকা (সদর)", "Area (Sadar)")}</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{named(locale, a)}</option>)}
          </select>
          <input name="line" className="field sm:col-span-2" placeholder={t.address} required minLength={4} maxLength={200} />
          <input name="landmark" className="field" placeholder={t.landmark} maxLength={120} />
          <input name="phone" inputMode="tel" className="field" placeholder={t.phone} defaultValue={user.phone ?? ""} required />
          <SubmitButton className="btn-soft w-full sm:col-span-2">{pick(locale, "ঠিকানা যোগ করুন", "Add address")}</SubmitButton>
        </ActionForm>
      </Section>

      <Section title={pick(locale, "প্রোফাইল এডিট", "Edit profile")}>
        <ActionForm action={updateProfileAction} resetOnSuccess={false} className="grid gap-3 sm:grid-cols-2">
          <input name="name" className="field" defaultValue={user.name} placeholder={t.name} required minLength={2} maxLength={80} />
          <input name="email" type="email" className="field" defaultValue={user.email ?? ""} placeholder={pick(locale, "ইমেইল (ঐচ্ছিক)", "Email (optional)")} />
          <input name="password" type="password" className="field sm:col-span-2" placeholder={pick(locale, "নতুন পাসওয়ার্ড (ঐচ্ছিক, ইমেইল দিয়ে ঢুকতে)", "New password (optional, for email sign-in)")} autoComplete="new-password" />
          <SubmitButton className="btn-primary w-full sm:col-span-2">{t.save}</SubmitButton>
        </ActionForm>
      </Section>

      <form action={logoutAction}>
        <button className="btn-ghost w-full"><LogOut className="size-4" /> {t.logout}</button>
      </form>
    </div>
  )
}
