import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { deleteBanner, saveBanner, toggleBanner } from "@/actions/admin"

export default async function BannersPage() {
  await requireUser(["ADMIN"], "/admin/banners")
  const banners = await db.banner.findMany({ orderBy: { sort: "asc" } })
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Banners</h1>
      <div className="mt-3 space-y-2">
        {banners.map((banner) => (
          <div key={banner.id} className="flex items-center justify-between rounded-2xl border bg-white px-3 py-3">
            <span>{banner.title} {banner.active ? "" : "(hidden)"}</span>
            <span className="flex gap-3 text-sm font-bold">
              <form action={toggleBanner}><input type="hidden" name="id" value={banner.id} /><button>{banner.active ? "Hide" : "Show"}</button></form>
              <form action={deleteBanner}><input type="hidden" name="id" value={banner.id} /><button className="text-rose-600">Delete</button></form>
            </span>
          </div>
        ))}
      </div>
      <form action={saveBanner} className="mt-4 grid max-w-lg gap-2">
        <input name="title" required placeholder="Title" className="h-11 rounded-xl border px-3" />
        <input name="titleBn" placeholder="Title in Bangla" className="h-11 rounded-xl border px-3" />
        <input name="subtitle" placeholder="Subtitle" className="h-11 rounded-xl border px-3" />
        <input name="subtitleBn" placeholder="Subtitle in Bangla" className="h-11 rounded-xl border px-3" />
        <input name="href" defaultValue="/offers" className="h-11 rounded-xl border px-3" />
        <button className="pill bg-primary text-primary-foreground">Add banner</button>
      </form>
    </div>
  )
}
