import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { adjustWallet, setUserPassword, toggleUser } from "@/actions/admin"
import { taka } from "@/lib/format"

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await requireUser(["ADMIN"], "/admin/customers")
  const sp = await searchParams
  const users = await db.user.findMany({ where: { role: "CUSTOMER" }, include: { wallet: true }, orderBy: { createdAt: "desc" } })
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Customers</h1>
      {sp.error ? <p className="text-sm text-rose-600">{sp.error}</p> : null}
      {sp.ok ? <p className="text-sm text-emerald-700">Saved.</p> : null}
      <div className="mt-4 space-y-3">
        {users.map((user) => (
          <article key={user.id} className="surface-card p-4">
            <p className="font-bold">{user.name} {user.active ? "" : "· paused"}</p>
            <p className="text-sm text-muted-foreground">{user.email} · wallet {taka(user.wallet?.balance ?? 0)}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <form action={toggleUser}><input type="hidden" name="id" value={user.id} /><input type="hidden" name="back" value="/admin/customers" /><button className="text-sm font-bold">{user.active ? "Pause" : "Activate"}</button></form>
            </div>
            <form action={adjustWallet} className="mt-2 flex gap-2">
              <input type="hidden" name="id" value={user.id} />
              <input name="amount" type="number" placeholder="+/- ৳" className="h-10 w-28 rounded-xl border px-2" />
              <input name="note" placeholder="Note" className="h-10 flex-1 rounded-xl border px-2" />
              <button className="text-sm font-bold">Wallet</button>
            </form>
            <form action={setUserPassword} className="mt-2 flex gap-2">
              <input type="hidden" name="id" value={user.id} />
              <input name="password" type="text" placeholder="New password" className="h-10 flex-1 rounded-xl border px-2" />
              <button className="text-sm font-bold">Set password</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  )
}
