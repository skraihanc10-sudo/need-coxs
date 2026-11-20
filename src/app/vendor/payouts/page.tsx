import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { storeBalance } from "@/lib/orders"
import { PageHeader, ErrorNote } from "@/components/bits"
import { requestPayout } from "@/actions/vendor"
import { taka } from "@/lib/format"

export default async function PayoutsPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const user = await requireUser(["STORE"], "/vendor/payouts")
  const sp = await searchParams
  const [balance, payouts] = await Promise.all([
    storeBalance(user.store!.id),
    db.payout.findMany({ where: { storeId: user.store!.id }, orderBy: { createdAt: "desc" } }),
  ])
  return (
    <div>
      <PageHeader title="Payouts" back="/vendor/account" />
      <ErrorNote message={sp.error} />
      {sp.ok ? <p className="px-4 text-sm text-emerald-700">Request sent.</p> : null}
      <p className="px-4 text-3xl font-extrabold">{taka(balance.available)}</p>
      <p className="px-4 text-sm text-muted-foreground">Available after commission. Reserved payouts are already subtracted.</p>
      <form action={requestPayout} className="mt-4 space-y-2 px-4">
        <input name="amount" type="number" min={100} required placeholder="Amount" className="h-11 w-full rounded-xl border px-3" />
        <select name="method" className="h-11 w-full rounded-xl border px-3"><option>bKash</option><option>Bank</option></select>
        <input name="account" required placeholder="Account number" className="h-11 w-full rounded-xl border px-3" />
        <button className="pill w-full bg-primary text-primary-foreground">Request payout</button>
      </form>
      <div className="mt-4 space-y-2 px-4 pb-8">
        {payouts.map((payout) => (
          <p key={payout.id} className="text-sm">{taka(payout.amount)} · {payout.method} · {payout.status}</p>
        ))}
      </div>
    </div>
  )
}
