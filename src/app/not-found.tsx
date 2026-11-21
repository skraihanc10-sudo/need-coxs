import Link from "next/link"
import { brand } from "@/theme/brand"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <p className="font-extrabold text-brand">{brand.nameBn}</p>
      <h1 className="display mt-2 text-3xl font-extrabold text-ink">পেজটা পাওয়া যায়নি</h1>
      <p className="mt-2 text-sm text-muted-foreground">That page is not here. The link may be old, or it belongs to someone else.</p>
      <Link href="/" className="btn-primary mt-6 inline-flex">হোমে ফিরে যান</Link>
    </div>
  )
}
