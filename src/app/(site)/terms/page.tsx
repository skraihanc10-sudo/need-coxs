import { PageBanner } from "@/components/site/chrome"
import { brand } from "@/theme/brand"

export default function TermsPage() {
  return (
    <div>
      <PageBanner title="Terms" crumbs={["Terms"]} />
      <article className="site-wrap max-w-3xl space-y-4 py-14 text-sm leading-7">
        <p>{brand.name} connects Dhaka homes with independent laundries. The shop is responsible for the clothes after pickup.</p>
        <p>Menu prices are locked onto the order when you place it. Cash on delivery is collected by the rider. Online methods stay unpaid until a gateway marks them paid.</p>
        <p>Cancel before pickup and wallet credit is returned. Passwords are stored only as hashes.</p>
      </article>
    </div>
  )
}
