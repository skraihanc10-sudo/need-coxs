import { requireUser, getLocale } from "@/lib/auth"
import { copy } from "@/lib/i18n"
import { PageHeader } from "@/components/bits"
import { CopyCode } from "@/components/interactive"
import { getSettings } from "@/lib/settings"
import { brand } from "@/theme/brand"

export default async function ReferPage() {
  const user = await requireUser(["CUSTOMER"], "/profile/refer")
  const locale = await getLocale()
  const t = copy(locale)
  const settings = await getSettings()
  return (
    <div>
      <PageHeader title={t.refer} back="/profile" />
      <div className="px-4">
        <div className="surface-card p-5 text-center">
          <p className="text-sm text-muted-foreground">{brand.name}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-widest">{user.referralCode}</p>
          <div className="mt-3 flex justify-center"><CopyCode code={user.referralCode} label={t.copy} /></div>
          <p className="mt-3 text-sm">You and a friend each get ৳{settings.referralBonus} when they register with your code.</p>
        </div>
      </div>
    </div>
  )
}
