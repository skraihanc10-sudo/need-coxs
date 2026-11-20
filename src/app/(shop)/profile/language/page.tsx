import { getLocale } from "@/lib/auth"
import { copy } from "@/lib/i18n"
import { PageHeader } from "@/components/bits"
import { setLocale } from "@/actions/auth"

export default async function LanguagePage() {
  const locale = await getLocale()
  const t = copy(locale)
  return (
    <div>
      <PageHeader title={t.language} back="/profile" />
      <form action={setLocale} className="space-y-3 px-4">
        <input type="hidden" name="back" value="/profile/language" />
        {[["en", t.english], ["bn", t.bangla]].map(([value, label]) => (
          <label key={value} className="flex items-center gap-3 rounded-2xl border px-3 py-4 font-semibold">
            <input type="radio" name="locale" value={value} defaultChecked={locale === value} />
            {label}
          </label>
        ))}
        <button className="pill w-full bg-primary text-primary-foreground">{t.save}</button>
      </form>
    </div>
  )
}
