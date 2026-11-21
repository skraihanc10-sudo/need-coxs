import { PageBanner } from "@/components/site/chrome"
import { brand } from "@/theme/brand"

export default function TermsPage() {
  return (
    <div>
      <PageBanner title="Terms" crumbs={["Terms"]} />
      <article className="site-wrap max-w-3xl space-y-4 py-14 text-sm leading-7">
        <p>{brand.name} ({brand.nameBn}) connects people in Cox's Bazar with independent providers. {brand.tagline}.</p>
        <p>A quoted price is locked when you accept it. Cash, bKash, and Nagad are recorded on the visit and are not charged online.</p>
        <p>Cancel before pickup and wallet credit is returned. Passwords are stored only as hashes.</p>
      </article>
    </div>
  )
}
