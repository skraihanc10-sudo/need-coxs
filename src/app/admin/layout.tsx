import { AdminShell } from "@/components/shell"
import { requireUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["ADMIN"], "/admin")
  return <AdminShell name={user.name}>{children}</AdminShell>
}
