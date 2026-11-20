import { AppShell } from "@/components/shell"
import { copy } from "@/lib/i18n"
import { getViewer } from "@/lib/queries"

export const dynamic = "force-dynamic"

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer()
  const t = copy(viewer.locale)
  return (
    <AppShell
      panel="customer"
      labels={{ home: t.navHome, orders: t.navOrders, offers: t.navOffers, chat: t.navChat, profile: t.navProfile }}
    >
      {children}
    </AppShell>
  )
}
