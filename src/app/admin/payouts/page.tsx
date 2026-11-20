import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { markPayout } from "@/actions/admin"
import { taka } from "@/lib/format"

export default async function AdminPayouts() {
  await requireUser(["ADMIN"], "/admin/payouts")
  const payouts = await db.payout.findMany({ include: { store: true }, orderBy: { createdAt: "desc" } })
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Payouts</h1>
      <div className="mt-4 space-y-3">
        {payouts.map((payout) => (
          <article key={payout.id} className="surface-card p-4 text-sm">
            <p className="font-bold">{payout.store.name} · {taka(payout.amount)} · {payout.status}</p>
            <p>{payout.method} · {payout.account}</p>
            {payout.status === "REQUESTED" ? (
              <div className="mt-2 flex gap-2">
                <form action={markPayout}><input type="hidden" name="id" value={payout.id} /><input type="hidden" name="status" value="PAID" /><button className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">Mark paid</button></form>
                <form action={markPayout}><input type="hidden" name="id" value={payout.id} /><input type="hidden" name="status" value="REJECTED" /><button className="text-xs font-bold text-rose-600">Reject</button></form>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  )
}
