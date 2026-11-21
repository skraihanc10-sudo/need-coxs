import Link from "next/link"
import { Plus } from "lucide-react"
import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { named, pick } from "@/lib/i18n"
import { toggleUserAction } from "@/actions/admin"
import { Avatar, PageHeader } from "@/components/bits"

export default async function WorkersPage() {
  const [, locale] = await Promise.all([requireUser(["ADMIN"], "/admin/workers"), getLocale()])
  const workers = await db.workerProfile.findMany({
    include: {
      user: true,
      skills: { include: { category: true } },
      areas: { include: { area: true } },
      bookings: { where: { status: { notIn: ["COMPLETED", "CANCELLED"] } }, select: { id: true } },
      _count: { select: { bookings: { where: { status: "COMPLETED" } } } },
    },
    orderBy: [{ user: { active: "desc" } }, { rating: "desc" }],
  })
  return (
    <div>
      <PageHeader title={pick(locale, "কর্মী", "Workers")} sub={pick(locale, `${workers.filter((w) => w.user.active).length} জন সক্রিয়`, `${workers.filter((w) => w.user.active).length} active`)} action={<Link href="/admin/workers/new" className="btn-primary h-10 px-4 text-sm"><Plus className="size-4" /> {pick(locale, "নতুন কর্মী", "Add worker")}</Link>} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {workers.map((w) => (
          <div key={w.id} className={`card p-4 ${w.user.active ? "" : "opacity-60"}`}>
            <div className="flex items-center gap-3">
              <Avatar name={w.user.name} src={w.photo || undefined} size={48} />
              <div className="min-w-0 flex-1">
                <Link href={`/admin/workers/${w.id}`} className="block truncate font-extrabold text-ink hover:text-brand">{w.user.name}</Link>
                <p className="text-xs text-muted-foreground">{w.user.phone} · ★ {w.rating ? w.rating.toFixed(1) : "—"} ({w.ratingCount}) · {w._count.bookings} {pick(locale, "শেষ", "done")}</p>
              </div>
              <span className={`pill ${w.bookings.length ? "bg-emerald-100 text-emerald-800" : "bg-canvas text-muted-foreground"}`}>{w.bookings.length ? `${w.bookings.length} ${pick(locale, "জব", "jobs")}` : pick(locale, "ফ্রি", "free")}</span>
            </div>
            <p className="mt-3 flex flex-wrap gap-1">
              {w.isRider ? <span className="pill bg-teal-50 text-teal-700">{pick(locale, "রাইডার", "Rider")}</span> : null}
              {w.skills.map((s) => <span key={s.categoryId} className="pill bg-brand-soft text-brand">{named(locale, s.category)}</span>)}
            </p>
            {w.areas.length ? <p className="mt-2 text-xs text-muted-foreground">{w.areas.map((a) => named(locale, a.area)).join(", ")}</p> : null}
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className={w.nid ? "text-ok" : "text-amber-600"}>{w.nid ? `NID ✓ ${w.nid.slice(0, 4)}…` : pick(locale, "NID নেই", "No NID")}</span>
              <form action={toggleUserAction}>
                <input type="hidden" name="id" value={w.userId} />
                <button className="font-bold text-muted-foreground hover:text-ink">{w.user.active ? pick(locale, "নিষ্ক্রিয় করুন", "Deactivate") : pick(locale, "সক্রিয় করুন", "Activate")}</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
