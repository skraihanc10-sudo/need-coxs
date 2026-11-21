import { requireUser, getLocale } from "@/lib/auth"
import { getSettings } from "@/lib/settings"
import { myCareThread } from "@/lib/support"
import { pick, words } from "@/lib/i18n"
import { sendCareMessageAction } from "@/actions/support"
import { PageHeader } from "@/components/bits"
import { Composer, MessageList } from "@/components/chat-pane"

export default async function CarePage() {
  const [user, locale, settings] = await Promise.all([requireUser(["CUSTOMER"], "/care"), getLocale(), getSettings()])
  const t = words(locale)
  const thread = await myCareThread(user.id)
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader back="/help" title={t.care} sub={pick(locale, `${locale === "bn" ? settings.officeHours : settings.officeHoursEn} · সাধারণত কয়েক মিনিটে উত্তর দিই`, `${settings.officeHoursEn} · we usually reply within minutes`)} />
      <div className="card p-4">
        <MessageList messages={thread.messages} me={user.id} locale={locale} empty={pick(locale, "আসসালামু আলাইকুম! কী জানতে চান লিখুন, আমরা উত্তর দিচ্ছি।", "Hello! Ask us anything and we'll reply here.")} />
        <Composer action={sendCareMessageAction} fields={{}} placeholder={pick(locale, "বার্তা লিখুন…", "Write a message…")} />
      </div>
    </div>
  )
}
