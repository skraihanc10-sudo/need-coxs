import Link from "next/link"
import { requireUser, getLocale } from "@/lib/auth"
import { PageHeader } from "@/components/bits"
import { listTickets } from "@/lib/inbox"
import { db } from "@/lib/db"
import { brand } from "@/theme/brand"

export default async function HelpPage() {
  const user = await requireUser(["CUSTOMER"], "/help")
  const locale = await getLocale()
  const bn = locale === "bn"
  const tickets = await listTickets(user)
  const faqs = await db.faq.findMany({ where: { storeId: null }, orderBy: { sort: "asc" }, take: 4 })
  const phone = brand.supportPhone.replace(/\D/g, "")
  const wa = phone.startsWith("0") ? `88${phone}` : phone
  return (
    <div className="pb-8">
      <PageHeader title={bn ? "সাহায্য" : "Help"} back="/profile" />
      <div className="space-y-3 px-4">
        <div className="grid grid-cols-2 gap-2">
          <a className="rounded-2xl border px-3 py-3 text-sm font-bold" href={`tel:${brand.supportPhone}`}>{bn ? "ফোন" : "Call"} {brand.supportPhone}</a>
          <a className="rounded-2xl border px-3 py-3 text-sm font-bold" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
        <Link href="/faq" className="block text-sm font-bold text-[var(--brand)]">{bn ? "প্রশ্নোত্তর" : "FAQ"}</Link>
        <Link href="/contact" className="block text-sm font-bold text-[var(--brand)]">{bn ? "যোগাযোগ" : "Contact"}</Link>
        {faqs.map((faq) => (
          <article key={faq.id} className="rounded-2xl bg-muted px-3 py-3 text-sm">
            <p className="font-bold">{faq.question}</p>
            <p className="mt-1 text-muted-foreground">{faq.answer}</p>
          </article>
        ))}
        <Link href="/help/new" className="pill flex items-center justify-center bg-primary text-primary-foreground">{bn ? "টিকিট খুলুন" : "New ticket"}</Link>
        {tickets.map(({ ticket, unread }) => (
          <Link key={ticket.id} href={`/help/${ticket.code}`} className="flex items-center justify-between rounded-2xl border px-3 py-3">
            <span>
              <span className="block font-bold">{ticket.subject}</span>
              <span className="text-xs text-muted-foreground">{ticket.code} · {ticket.status}</span>
            </span>
            {unread ? <span className="grid size-6 place-items-center rounded-full bg-rose-600 text-xs font-bold text-white">{unread}</span> : null}
          </Link>
        ))}
      </div>
    </div>
  )
}
