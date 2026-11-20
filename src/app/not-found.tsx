import Link from "next/link"
import { brand } from "@/theme/brand"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <p className="font-extrabold">{brand.name}</p>
      <h1 className="mt-2 text-3xl font-extrabold">That page is not here</h1>
      <Link href="/" className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-5 font-bold text-primary-foreground">Go home</Link>
    </div>
  )
}
