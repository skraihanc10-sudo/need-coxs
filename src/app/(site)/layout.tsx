import { SiteFooter, SiteHeader } from "@/components/site/chrome"
import { getSettings } from "@/lib/settings"
import { getLocale } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, locale] = await Promise.all([getSettings(), getLocale()])
  return (
    <div className="public-site min-h-dvh">
      <SiteHeader phone={settings.supportPhone} bn={locale === "bn"} />
      <main>{children}</main>
      <SiteFooter phone={settings.supportPhone} email={settings.supportEmail} />
    </div>
  )
}
