import { AppShell } from "@/components/shell"
import { requireUser } from "@/lib/auth"
import { unreadFor } from "@/lib/inbox"

export const dynamic = "force-dynamic"

export default async function RiderLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["DELIVERY"], "/rider")
  const badges = await unreadFor(user)
  return <AppShell panel="rider" badges={badges}>{children}</AppShell>
}
