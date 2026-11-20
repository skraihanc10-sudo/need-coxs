import { AppShell } from "@/components/shell"
import { requireUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function RiderLayout({ children }: { children: React.ReactNode }) {
  await requireUser(["DELIVERY"], "/rider")
  return <AppShell panel="rider">{children}</AppShell>
}
