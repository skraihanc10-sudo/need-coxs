import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { deletePage, savePage } from "@/actions/admin"

export default async function PagesAdmin() {
  await requireUser(["ADMIN"], "/admin/pages")
  const pages = await db.cmsPage.findMany({ orderBy: { title: "asc" } })
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">CMS pages</h1>
      <div className="mt-4 space-y-2">
        {pages.map((page) => (
          <div key={page.id} className="rounded-2xl border bg-white p-3 text-sm">
            <p className="font-bold">{page.title} · /{page.slug}</p>
            <p className="text-muted-foreground">{page.body}</p>
            <form action={deletePage}><input type="hidden" name="id" value={page.id} /><button className="text-rose-600">Delete</button></form>
          </div>
        ))}
      </div>
      <form action={savePage} className="mt-4 grid max-w-lg gap-2">
        <input name="title" required placeholder="Title" className="h-11 rounded-xl border px-3" />
        <input name="slug" required placeholder="slug" className="h-11 rounded-xl border px-3" />
        <textarea name="body" required placeholder="Body" className="min-h-28 rounded-xl border px-3 py-2" />
        <button className="pill bg-primary text-primary-foreground">Save page</button>
      </form>
    </div>
  )
}
