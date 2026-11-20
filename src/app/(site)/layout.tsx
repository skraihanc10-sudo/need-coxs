import { SiteFooter, SiteHeader } from "@/components/site/chrome"
import { getSettings } from "@/lib/settings"

export const dynamic = "force-dynamic"

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  return (
    <div className="min-h-dvh bg-white text-[var(--brand-ink)]">
      <SiteHeader phone={settings.supportPhone} email={settings.supportEmail} />
      <main>{children}</main>
      <SiteFooter phone={settings.supportPhone} email={settings.supportEmail} />
    </div>
  )
}
