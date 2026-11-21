import Link from "next/link"
import { AlertTriangle, MessageCircle, MessageSquareText, Phone, TicketCheck } from "lucide-react"
import { getLocale, getUser } from "@/lib/auth"
import { getSettings } from "@/lib/settings"
import { activeFaqs } from "@/lib/catalog"
import { pick, words } from "@/lib/i18n"
import { telHref, whatsappHref } from "@/lib/format"
import { PageHeader } from "@/components/bits"
import { myTickets, TICKET_STATUSES } from "@/lib/support"

export default async function HelpPage() {
  const [locale, user, settings, faqs] = await Promise.all([getLocale(), getUser(), getSettings(), activeFaqs()])
  const t = words(locale)
  const bn = locale === "bn"
  const tickets = user?.role === "CUSTOMER" ? await myTickets(user.id) : []

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t.help} sub={pick(locale, "আমরা সমাধান না হওয়া পর্যন্ত পাশে আছি।", "We stay with it until it's fixed.")} />

      <a href={telHref(settings.emergency)} className="card mb-4 flex items-center gap-4 border-l-4 border-l-danger p-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--danger-soft)] text-danger"><AlertTriangle className="size-5" /></span>
        <span>
          <span className="block font-extrabold text-ink">{pick(locale, "ইমার্জেন্সি? এখনই কল দিন", "Emergency? Call now")}</span>
          <span className="block text-sm text-muted-foreground">{settings.emergency} · {pick(locale, "পানি, বিদ্যুৎ বা গ্যাসের বিপদে ২৪ ঘণ্টা", "24h for water, electrical or gas danger")}</span>
        </span>
      </a>

      <div className="grid gap-3 sm:grid-cols-2">
        <a href={telHref(settings.helpline)} className="card flex items-center gap-3 p-4">
          <Phone className="size-5 text-brand" />
          <span><span className="block font-extrabold text-ink">{pick(locale, "হেল্পলাইন", "Helpline")}</span><span className="block text-sm text-muted-foreground">{settings.helpline}</span></span>
        </a>
        <a href={whatsappHref(settings.whatsapp)} className="card flex items-center gap-3 p-4">
          <MessageCircle className="size-5 text-ok" />
          <span><span className="block font-extrabold text-ink">{t.whatsapp}</span><span className="block text-sm text-muted-foreground">{settings.whatsapp}</span></span>
        </a>
        <Link href="/care" className="card flex items-center gap-3 p-4">
          <MessageSquareText className="size-5 text-brand" />
          <span><span className="block font-extrabold text-ink">{t.care}</span><span className="block text-sm text-muted-foreground">{pick(locale, "অ্যাপের ভেতরে চ্যাট করুন", "Chat with us in the app")}</span></span>
        </Link>
        <Link href="/help/tickets/new" className="card flex items-center gap-3 p-4">
          <TicketCheck className="size-5 text-amber" />
          <span><span className="block font-extrabold text-ink">{pick(locale, "অভিযোগ বা রিফান্ড", "Complaint or refund")}</span><span className="block text-sm text-muted-foreground">{pick(locale, "একটা টিকেট খুলুন", "Open a ticket")}</span></span>
        </Link>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        <span className="font-bold text-ink">{pick(locale, "অফিসের সময়:", "Office hours:")}</span> {bn ? settings.officeHours : settings.officeHoursEn} · {bn ? settings.address : settings.addressEn}
      </p>

      {tickets.length ? (
        <section className="mt-6">
          <h2 className="display text-lg font-extrabold text-ink">{pick(locale, "আমার টিকেট", "My tickets")}</h2>
          <ul className="mt-2 space-y-2">
            {tickets.map((tk) => {
              const last = tk.messages[0]
              const unread = last && last.senderId !== user!.id && (!tk.reads[0] || tk.reads[0].readAt < last.createdAt)
              return (
                <li key={tk.id}>
                  <Link href={`/help/tickets/${tk.code}`} className="card flex items-center justify-between gap-3 p-4">
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-ink">{tk.code} · {tk.subject}</span>
                      <span className="block truncate text-xs text-muted-foreground">{last?.body}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {unread ? <span className="size-2.5 rounded-full bg-danger" /> : null}
                      <span className="pill bg-canvas text-ink">{TICKET_STATUSES[tk.status as keyof typeof TICKET_STATUSES]?.[locale] ?? tk.status}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      <section className="mt-6">
        <h2 className="display text-lg font-extrabold text-ink">{pick(locale, "সাধারণ প্রশ্ন", "FAQ")}</h2>
        <div className="mt-2 space-y-2">
          {faqs.map((f) => (
            <details key={f.id} className="card group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-ink">
                {bn ? f.questionBn : f.question}
                <span className="text-brand transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{bn ? f.answerBn : f.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
