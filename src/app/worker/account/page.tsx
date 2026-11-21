import { LogOut } from "lucide-react"
import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { named, pick, words } from "@/lib/i18n"
import { logoutAction, updateProfileAction } from "@/actions/auth"
import { ActionForm, SubmitButton } from "@/components/forms"
import { Avatar, PageHeader, Section } from "@/components/bits"

export default async function WorkerAccountPage() {
  const [user, locale] = await Promise.all([requireUser(["WORKER"], "/worker/account"), getLocale()])
  const t = words(locale)
  const profile = user.worker ? await db.workerProfile.findUnique({ where: { id: user.worker.id }, include: { skills: { include: { category: true } }, areas: { include: { area: true } } } }) : null
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader title={pick(locale, "আমার অ্যাকাউন্ট", "My account")} />
      <div className="card flex items-center gap-4 p-4">
        <Avatar name={user.name} src={profile?.photo || undefined} size={60} />
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold text-ink">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.phone} · ★ {profile?.rating ? profile.rating.toFixed(1) : "—"} ({profile?.ratingCount ?? 0})</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {profile?.skills.map((s) => named(locale, s.category)).join(" · ")}{profile?.isRider ? ` · ${pick(locale, "লন্ড্রি রাইডার", "Laundry rider")}` : ""}
          </p>
        </div>
      </div>
      <Section title={pick(locale, "পাসওয়ার্ড বদলান", "Change password")}>
        <ActionForm action={updateProfileAction} resetOnSuccess={false} className="space-y-3">
          <input name="name" className="field" defaultValue={user.name} required minLength={2} maxLength={80} />
          <input name="email" type="email" className="field" defaultValue={user.email ?? ""} placeholder={pick(locale, "ইমেইল", "Email")} />
          <input name="password" type="password" className="field" placeholder={pick(locale, "নতুন পাসওয়ার্ড", "New password")} autoComplete="new-password" />
          <SubmitButton>{t.save}</SubmitButton>
        </ActionForm>
      </Section>
      <form action={logoutAction}><button className="btn-ghost w-full"><LogOut className="size-4" /> {t.logout}</button></form>
    </div>
  )
}
