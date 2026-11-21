import { Trash2 } from "lucide-react"
import { requireUser, getLocale } from "@/lib/auth"
import { replyTemplates } from "@/lib/office"
import { pick } from "@/lib/i18n"
import { deleteTemplateAction, saveTemplateAction } from "@/actions/admin"
import { ActionForm, SubmitButton } from "@/components/forms"
import { PageHeader, Section } from "@/components/bits"

export default async function TemplatesPage() {
  const [, locale, templates] = await Promise.all([requireUser(["SUPPORT", "ADMIN"], "/support/templates"), getLocale(), replyTemplates()])
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={pick(locale, "তৈরি উত্তর", "Reply templates")} sub={pick(locale, "চ্যাট আর টিকেটে এক ক্লিকে বসে।", "One tap to drop into a chat or ticket.")} />
      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="space-y-2">
          {templates.map((t) => (
            <details key={t.id} className="card group p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-extrabold text-ink">{t.title}<span className="text-xs text-muted-foreground group-open:hidden">{pick(locale, "এডিট", "Edit")}</span></summary>
              <ActionForm action={saveTemplateAction} resetOnSuccess={false} className="mt-3 space-y-2">
                <input type="hidden" name="id" value={t.id} />
                <input name="title" defaultValue={t.title} className="field" required maxLength={60} />
                <textarea name="body" defaultValue={t.body} className="field" required maxLength={1000} />
                <input type="hidden" name="sort" value={t.sort} />
                <div className="flex gap-2">
                  <SubmitButton className="btn-soft h-10 flex-1 text-sm">{pick(locale, "সেভ", "Save")}</SubmitButton>
                  <form action={deleteTemplateAction}><input type="hidden" name="id" value={t.id} /><button className="btn-danger h-10 px-3"><Trash2 className="size-4" /></button></form>
                </div>
              </ActionForm>
            </details>
          ))}
        </div>
        <Section title={pick(locale, "নতুন টেমপ্লেট", "New template")}>
          <ActionForm action={saveTemplateAction} className="space-y-2">
            <input name="title" className="field" placeholder={pick(locale, "শিরোনাম", "Title")} required maxLength={60} />
            <textarea name="body" className="field" placeholder={pick(locale, "উত্তর", "Reply text")} required maxLength={1000} />
            <input name="sort" type="number" className="field" placeholder={pick(locale, "ক্রম", "Order")} defaultValue={templates.length} />
            <SubmitButton>{pick(locale, "যোগ করুন", "Add")}</SubmitButton>
          </ActionForm>
        </Section>
      </div>
    </div>
  )
}
