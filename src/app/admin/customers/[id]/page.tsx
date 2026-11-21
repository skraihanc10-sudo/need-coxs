import Link from "next/link"
import { notFound } from "next/navigation"
import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatWhen } from "@/lib/format"
import { named, pick } from "@/lib/i18n"
import { TICKET_STATUSES } from "@/lib/support"
import { resetPasswordAction, toggleUserAction } from "@/actions/admin"
import { ActionForm, SubmitButton } from "@/components/forms"
import { Avatar, PageHeader, Section } from "@/components/bits"
import { BookingTable } from "@/components/booking/table"

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, me, locale] = await Promise.all([params, requireUser(["ADMIN"], "/admin/customers"), getLocale()])
  const c = await db.user.findUnique({
    where: { id },
    include: {
      addresses: { include: { area: true } },
      bookings: { orderBy: { createdAt: "desc" }, include: { customer: { select: { name: true } }, category: true, offering: true, area: true, worker: { include: { user: { select: { name: true } } } } } },
      tickets: { orderBy: { updatedAt: "desc" } },
      careThread: { select: { id: true, updatedAt: true } },
    },
  })
  if (!c) notFound()
  return (
    <div className="space-y-6">
      <PageHeader back="/admin/customers" title={c.name} sub={`${c.phone ?? ""} ${c.email ?? ""} · ${pick(locale, "যোগ দিয়েছেন", "joined")} ${formatWhen(c.createdAt, locale)}`} action={<Avatar name={c.name} size={48} />} />
      <div className="grid gap-4 md:grid-cols-3">
        <Section title={pick(locale, "ঠিকানা", "Addresses")}>
          {c.addresses.length ? c.addresses.map((a) => <p key={a.id} className="text-sm"><span className="font-bold">{a.label}</span> · {named(locale, a.area)} · {a.line}{a.landmark ? `, ${a.landmark}` : ""} · {a.phone}</p>) : <p className="text-sm text-muted-foreground">—</p>}
        </Section>
        <Section title={pick(locale, "সাপোর্ট", "Support")}>
          {c.careThread ? <Link href={`/support/care/${c.careThread.id}`} className="block text-sm font-bold text-brand">{pick(locale, "কাস্টমার কেয়ার চ্যাট", "Customer care chat")} →</Link> : <p className="text-sm text-muted-foreground">{pick(locale, "কোনো চ্যাট নেই", "No chat yet")}</p>}
          <ul className="mt-2 space-y-1 text-sm">
            {c.tickets.map((t) => <li key={t.id}><Link href={`/support/tickets/${t.code}`} className="font-bold text-brand">{t.code}</Link> · {t.subject} · <span className="text-muted-foreground">{TICKET_STATUSES[t.status as keyof typeof TICKET_STATUSES]?.[locale]}</span></li>)}
          </ul>
        </Section>
        <Section title={pick(locale, "অ্যাকাউন্ট", "Account")}>
          {c.id !== me.id ? (
            <form action={toggleUserAction} className="mb-3"><input type="hidden" name="id" value={c.id} /><button className={c.active ? "btn-danger h-10 w-full text-sm" : "btn-soft h-10 w-full text-sm"}>{c.active ? pick(locale, "অ্যাকাউন্ট বন্ধ করুন", "Disable account") : pick(locale, "অ্যাকাউন্ট চালু করুন", "Enable account")}</button></form>
          ) : null}
          <ActionForm action={resetPasswordAction} className="flex gap-2">
            <input type="hidden" name="id" value={c.id} />
            <input name="password" type="password" className="field h-10 flex-1" placeholder={pick(locale, "নতুন পাসওয়ার্ড", "New password")} minLength={6} required />
            <SubmitButton className="btn-soft h-10 px-3 text-sm">{pick(locale, "সেট", "Set")}</SubmitButton>
          </ActionForm>
        </Section>
      </div>
      <section>
        <h2 className="display mb-3 text-lg font-extrabold text-ink">{pick(locale, "বুকিং ইতিহাস", "Booking history")} ({c.bookings.length})</h2>
        <BookingTable rows={c.bookings} locale={locale} base="/admin/bookings" />
      </section>
    </div>
  )
}
