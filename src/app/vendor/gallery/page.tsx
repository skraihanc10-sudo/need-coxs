import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, ErrorNote } from "@/components/bits"
import { deleteGallery, saveGallery } from "@/actions/vendor"

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["STORE"], "/vendor/gallery")
  const sp = await searchParams
  const rows = await db.galleryItem.findMany({ where: { storeId: user.store!.id } })
  return (
    <div>
      <PageHeader title="Gallery" back="/vendor/account" />
      <ErrorNote message={sp.error} />
      <div className="grid grid-cols-2 gap-3 px-4">
        {rows.map((row) => (
          <figure key={row.id} className="overflow-hidden rounded-2xl border">
            <img src={row.image} alt="" className="h-28 w-full object-cover" />
            <figcaption className="flex items-center justify-between px-2 py-2 text-xs">
              {row.caption}
              <form action={deleteGallery}><input type="hidden" name="id" value={row.id} /><button className="text-rose-600">Delete</button></form>
            </figcaption>
          </figure>
        ))}
      </div>
      <form action={saveGallery} className="mt-4 grid gap-2 px-4 pb-8">
        <input name="caption" required placeholder="Caption" className="h-11 rounded-xl border px-3" />
        <input name="image" placeholder="/marketing/news-foldline.jpg" className="h-11 rounded-xl border px-3" />
        <button className="pill bg-primary text-primary-foreground">Add photo</button>
      </form>
    </div>
  )
}
