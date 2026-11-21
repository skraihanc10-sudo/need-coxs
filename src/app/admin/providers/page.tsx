import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { reviewDocumentAction } from "@/actions/marketplace"

export default async function AdminProviders() {
  await requireUser(["ADMIN"], "/admin")
  const stores = await db.store.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: true,
      documents: true,
      providerCategories: { include: { category: true } },
      providerAreas: { include: { area: true } },
    },
  })
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Providers</h1>
      <p className="text-sm text-muted-foreground">Approve the NID to publish a provider. Laundry shops keep their existing approval.</p>
      <div className="mt-4 space-y-3">
        {stores.map((store) => (
          <article key={store.id} className="surface-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-extrabold">{store.name}</p>
                <p className="text-xs text-muted-foreground">{store.owner.email} · {store.listing} · {store.providerType} · team {store.teamSize} · {store.status}</p>
              </div>
              <p className="text-sm">{store.providerCategories.map((row) => row.category.name).join(", ") || "Laundry catalog"}</p>
            </div>
            <p className="mt-1 text-xs">{store.providerAreas.map((row) => row.area.name).join(", ")}</p>
            <ul className="mt-2 space-y-1">
              {store.documents.map((doc) => (
                <li key={doc.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <span>{doc.kind} {doc.reference} · {doc.status}</span>
                  {doc.status === "PENDING" ? (
                    <>
                      <form action={reviewDocumentAction}>
                        <input type="hidden" name="id" value={doc.id} />
                        <input type="hidden" name="storeId" value={store.id} />
                        <input type="hidden" name="status" value="APPROVED" />
                        <button className="font-bold text-emerald-700">Approve</button>
                      </form>
                      <form action={reviewDocumentAction}>
                        <input type="hidden" name="id" value={doc.id} />
                        <input type="hidden" name="storeId" value={store.id} />
                        <input type="hidden" name="status" value="REJECTED" />
                        <button className="font-bold text-rose-700">Reject</button>
                      </form>
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}
