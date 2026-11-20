import { PageBanner } from "@/components/site/chrome"
import { brand } from "@/theme/brand"

export default function TermsPage() {
  return (
    <div>
      <PageBanner title="Terms" crumb="Terms" />
      <article className="site-wrap max-w-3xl space-y-4 py-14 text-sm leading-7">
        <p>{brand.name} connects households in Dhaka with independent laundries. The shop you select is responsible for the clothes once the rider has handed them over.</p>
        <p>Prices on a booking are the shop&apos;s prices at the moment you place the order. A later menu change does not rewrite an open order.</p>
        <p>Cash on delivery is collected by the rider. Online payments stay unpaid until a configured gateway, or the payments webhook, marks them paid. You can switch an unpaid online order to cash from the pay screen.</p>
        <p>Cancel before pickup and any wallet amount used on the order is returned. After the clothes are collected, the laundry decides whether the job can still be cancelled.</p>
        <p>Accounts store a name, email, phone, and addresses so riders can find the gate. Passwords are hashed. Support chat and website inquiries are visible to the admin desk.</p>
      </article>
    </div>
  )
}
