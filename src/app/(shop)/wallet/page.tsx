import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { copy } from "@/lib/i18n"
import { PageHeader } from "@/components/bits"
import { formatWhen, taka } from "@/lib/format"
import { brand } from "@/theme/brand"

export default async function WalletPage() {
  const user = await requireUser(["CUSTOMER"], "/wallet")
  const locale = await getLocale()
  const t = copy(locale)
  const [wallet, txns] = await Promise.all([
    db.wallet.findUnique({ where: { userId: user.id } }),
    db.walletTxn.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
  ])
  return (
    <div>
      <PageHeader title={t.walletTitle} back="/profile" />
      <div className="hero-banner mx-4 p-5">
        <p className="text-sm text-white/80">{brand.name}</p>
        <p className="text-xs uppercase tracking-wide">{t.available}</p>
        <p className="text-4xl font-extrabold">{taka(wallet?.balance ?? 0, locale)}</p>
      </div>
      <div className="mt-4 space-y-3 px-4 pb-6">
        {txns.map((txn) => (
          <div key={txn.id} className="flex justify-between text-sm">
            <span>
              <span className="block font-semibold">{txn.note}</span>
              <span className="text-muted-foreground">{formatWhen(txn.createdAt, locale)}</span>
            </span>
            <span className={txn.amount < 0 ? "text-rose-600" : "text-emerald-700"}>{txn.amount > 0 ? "+" : ""}{taka(txn.amount, locale)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
