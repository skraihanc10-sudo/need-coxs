import { AppShell } from "@/components/shell"
import { copy } from "@/lib/i18n"
import { getViewer } from "@/lib/queries"
import { unreadFor } from "@/lib/inbox"

export const dynamic = "force-dynamic"

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer()
  const t = copy(viewer.locale)
  const badges = viewer.user ? await unreadFor(viewer.user) : { chat: 0, notices: 0 }
  return (
    <AppShell
      panel="customer"
      badges={badges}
      bn={viewer.locale === "bn"}
      labels={{ home: t.navHome, orders: t.navOrders, offers: t.navOffers, chat: t.navChat, profile: t.navProfile }}
    >
      {children}
    </AppShell>
  )
}
