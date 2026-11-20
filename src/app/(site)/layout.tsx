import { SiteFooter, SiteHeader } from "@/components/site/chrome"
import { getSettings } from "@/lib/settings"

export const dynamic = "force-dynamic"

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  return (
    <div className="public-site min-h-dvh">
      <SiteHeader phone={settings.supportPhone} />
      <main>{children}</main>
      <SiteFooter phone={settings.supportPhone} email={settings.supportEmail} />
    </div>
  )
}
