import Link from "next/link"
import { notFound } from "next/navigation"
import { requireUser, getLocale } from "@/lib/auth"
import { AppError } from "@/lib/errors"
import { careThreadFor } from "@/lib/support"
import { replyTemplates } from "@/lib/office"
import { pick } from "@/lib/i18n"
import { careThreadAction, sendCareMessageAction } from "@/actions/support"
import { ActionButton } from "@/components/forms"
import { Composer, MessageList } from "@/components/chat-pane"
import { PageHeader } from "@/components/bits"

export default async function CareThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user, locale, templates] = await Promise.all([params, requireUser(["SUPPORT", "ADMIN"], "/support"), getLocale(), replyTemplates()])
  let thread
  try {
    thread = await careThreadFor(user, id)
  } catch (error) {
    if (error instanceof AppError) notFound()
    throw error
  }
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        back="/support"
        title={thread.customer.name}
        sub={`${pick(locale, "কাস্টমার কেয়ার চ্যাট", "Customer care chat")} · ${thread.customer.phone ?? thread.customer.email ?? ""} · ${thread.assignee ? `${pick(locale, "দেখছেন", "Handled by")} ${thread.assignee.name}` : pick(locale, "কেউ নেয়নি", "Unassigned")}`}
        action={
          <div className="flex gap-2">
            {thread.assigneeId !== user.id ? <ActionButton action={careThreadAction} fields={{ threadId: thread.id, assignToMe: "1" }} className="btn-soft h-10 px-3 text-sm">{pick(locale, "আমি নিচ্ছি", "Take it")}</ActionButton> : null}
            {thread.status === "OPEN" ? <ActionButton action={careThreadAction} fields={{ threadId: thread.id, close: "1" }} className="btn-ghost h-10 px-3 text-sm">{pick(locale, "বন্ধ", "Close")}</ActionButton> : null}
            <Link href={`/admin/customers/${thread.customerId}`} className="btn-ghost h-10 px-3 text-sm">{pick(locale, "প্রোফাইল", "Profile")}</Link>
          </div>
        }
      />
      <div className="card p-4">
        <MessageList messages={thread.messages} me={user.id} locale={locale} empty="" />
        <Composer action={sendCareMessageAction} fields={{ threadId: thread.id }} placeholder={pick(locale, "উত্তর লিখুন…", "Write a reply…")} templates={templates} />
      </div>
    </div>
  )
}
