import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { pick } from "@/lib/i18n"
import { saveAreaAction, toggleAreaAction } from "@/actions/admin"
import { ActionForm, SubmitButton } from "@/components/forms"
import { PageHeader, Section } from "@/components/bits"

export default async function AreasPage() {
  const [, locale] = await Promise.all([requireUser(["ADMIN"], "/admin/areas"), getLocale()])
  const areas = await db.serviceArea.findMany({ orderBy: { sort: "asc" }, include: { _count: { select: { bookings: true } } } })
  return (
    <div className="space-y-4">
      <PageHeader title={pick(locale, "এলাকা ও ভিজিট চার্জ", "Areas & visit charges")} sub={pick(locale, "শুধু কক্সবাজার সদর। বন্ধ করা এলাকায় বুকিং নেওয়া হবে না।", "Cox's Bazar Sadar only. Switched-off areas can't be booked.")} />
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>{pick(locale, "বাংলা", "Bangla")}</th><th>{pick(locale, "ইংরেজি", "English")}</th><th>slug</th><th>{pick(locale, "চার্জ (৳)", "Charge (৳)")}</th><th>{pick(locale, "ক্রম", "Order")}</th><th>{pick(locale, "বুকিং", "Bookings")}</th><th></th><th></th></tr></thead>
          <tbody>
            {areas.map((a) => (
              <tr key={a.id} className={a.active ? "" : "opacity-50"}>
                <td colSpan={5}>
                  <ActionForm action={saveAreaAction} resetOnSuccess={false} className="grid grid-cols-[1fr_1fr_1fr_100px_80px_auto] gap-2">
                    <input type="hidden" name="id" value={a.id} />
                    <input name="nameBn" defaultValue={a.nameBn} className="field h-9 text-sm" required />
                    <input name="name" defaultValue={a.name} className="field h-9 text-sm" required />
                    <input name="slug" defaultValue={a.slug} className="field h-9 text-sm" required pattern="[a-z0-9-]{2,40}" />
                    <input name="charge" type="number" defaultValue={a.charge} className="field h-9 text-sm" min={0} max={5000} />
                    <input name="sort" type="number" defaultValue={a.sort} className="field h-9 text-sm" />
                    <SubmitButton className="btn-soft h-9 px-3 text-xs">{pick(locale, "সেভ", "Save")}</SubmitButton>
                  </ActionForm>
                </td>
                <td>{a._count.bookings}</td>
                <td><span className={`pill ${a.active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"}`}>{a.active ? pick(locale, "চালু", "On") : pick(locale, "বন্ধ", "Off")}</span></td>
                <td><form action={toggleAreaAction}><input type="hidden" name="id" value={a.id} /><button className="text-xs font-bold text-muted-foreground hover:text-ink">{a.active ? pick(locale, "বন্ধ করুন", "Turn off") : pick(locale, "চালু করুন", "Turn on")}</button></form></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Section title={pick(locale, "নতুন এলাকা", "New area")}>
        <ActionForm action={saveAreaAction} className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_120px_90px_auto]">
          <input name="nameBn" className="field h-10" placeholder={pick(locale, "বাংলা নাম", "Bangla name")} required />
          <input name="name" className="field h-10" placeholder="English name" required />
          <input name="slug" className="field h-10" placeholder="slug" required pattern="[a-z0-9-]{2,40}" />
          <input name="charge" type="number" className="field h-10" placeholder="৳" defaultValue={0} min={0} />
          <input name="sort" type="number" className="field h-10" defaultValue={areas.length} />
          <SubmitButton className="btn-primary h-10 px-4 text-sm">{pick(locale, "যোগ করুন", "Add")}</SubmitButton>
        </ActionForm>
      </Section>
    </div>
  )
}
