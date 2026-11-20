import Link from "next/link"
import { requireUser } from "@/lib/auth"
import { logout } from "@/actions/auth"

const LINKS = [
  ["/vendor/categories", "Categories"],
  ["/vendor/attributes", "Attributes"],
  ["/vendor/gallery", "Gallery"],
  ["/vendor/slots", "Time slots"],
  ["/vendor/coupons", "Coupons"],
  ["/vendor/riders", "Riders"],
  ["/vendor/faq", "FAQs"],
  ["/vendor/payouts", "Payouts"],
  ["/vendor/reviews", "Reviews"],
  ["/vendor/profile", "Laundry profile"],
]

export default async function VendorAccount() {
  const user = await requireUser(["STORE"], "/vendor/account")
  return (
    <div className="px-4 py-5">
      <h1 className="text-2xl font-extrabold">{user.store!.name}</h1>
      <div className="mt-3 divide-y">
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} className="block py-3 font-semibold">{label}</Link>
        ))}
      </div>
      <form action={logout} className="pt-4">
        <button className="pill w-full border">Log out</button>
      </form>
    </div>
  )
}
