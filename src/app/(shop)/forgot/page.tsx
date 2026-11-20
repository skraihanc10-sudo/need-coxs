import Link from "next/link"
import { PageHeader } from "@/components/bits"
import { brand } from "@/theme/brand"

export default function ForgotPage() {
  return (
    <div>
      <PageHeader title="Forgot password" back="/login" />
      <div className="space-y-3 px-4 text-sm leading-6">
        <p>{brand.name} does not send reset email yet. Demo passwords are on the sign-in screen.</p>
        <p>An admin can set a new password from the customers desk.</p>
        <Link href="/login" className="pill flex items-center justify-center bg-primary text-primary-foreground">Back to sign in</Link>
      </div>
    </div>
  )
}
