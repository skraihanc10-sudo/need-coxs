import { requireUser, getLocale } from "@/lib/auth"
import { PageHeader, ErrorNote } from "@/components/bits"
import { createTicketAction } from "@/actions/inbox"

export default async function NewTicket({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser(["CUSTOMER"], "/help/new")
  const { error } = await searchParams
  const locale = await getLocale()
  const bn = locale === "bn"
  return (
    <div>
      <PageHeader title={bn ? "নতুন টিকিট" : "New ticket"} back="/help" />
      <ErrorNote message={error} />
      <form action={createTicketAction} className="space-y-3 px-4">
        <input type="hidden" name="back" value="/help" />
        <input name="subject" required minLength={3} placeholder={bn ? "বিষয়" : "Subject"} className="h-12 w-full rounded-xl border px-3" />
        <textarea name="body" required minLength={3} rows={5} placeholder={bn ? "কী হয়েছে" : "What happened"} className="w-full rounded-xl border px-3 py-2" />
        <button type="submit" className="pill w-full bg-primary text-primary-foreground">{bn ? "পাঠান" : "Create ticket"}</button>
      </form>
    </div>
  )
}
