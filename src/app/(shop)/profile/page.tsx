import Link from "next/link"
import { requireUser, getLocale } from "@/lib/auth"
import { copy } from "@/lib/i18n"
import { logout } from "@/actions/auth"
import { brand } from "@/theme/brand"

const LINKS = [
  ["/orders", "navOrders"],
  ["/wallet", "walletTitle"],
  ["/profile/addresses", "addresses"],
  ["/offers", "offers"],
  ["/faq", "faq"],
  ["/contact", "contact"],
  ["/chat", "chatTitle"],
  ["/terms", "terms"],
  ["/profile/language", "language"],
  ["/profile/refer", "refer"],
  ["/profile/edit", "fullName"],
  ["/partner", "partner"],
] as const

export default async function ProfilePage() {
  const user = await requireUser(["CUSTOMER"], "/profile")
  const locale = await getLocale()
  const t = copy(locale)
  const bn = locale === "bn"
  return (
    <div className="pb-6">
      <div className="bg-[var(--brand)] px-4 py-8 text-white">
        <p className="text-sm text-white/80">{bn ? brand.nameBn : brand.name}</p>
        <p className="text-2xl font-extrabold">{user.name}</p>
        <p className="text-sm text-white/80">{user.email}</p>
      </div>
      <div className="mt-3 divide-y px-2">
        {LINKS.map(([href, key]) => (
          <Link key={href} href={href} className="block px-3 py-3 font-semibold">
            {t[key]}
          </Link>
        ))}
        <Link href="/help" className="block px-3 py-3 font-semibold">{bn ? "সাপোর্ট টিকিট" : "Support tickets"}</Link>
        <Link href="/notices" className="block px-3 py-3 font-semibold">{bn ? "নোটিশ" : "Notifications"}</Link>
      </div>
      <form action={logout} className="px-4 pt-4">
        <button className="pill w-full border text-rose-600">{t.logout}</button>
      </form>
    </div>
  )
}
