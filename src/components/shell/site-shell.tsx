import Link from "next/link"
import { Phone, MessageCircle, UserRound } from "lucide-react"
import { Logo } from "@/components/logo"
import { LocaleSwitch } from "@/components/locale-switch"
import { BottomNav, type NavItem } from "./nav"
import { getLocale, getUser } from "@/lib/auth"
import { getSettings } from "@/lib/settings"
import { words } from "@/lib/i18n"
import { telHref, whatsappHref } from "@/lib/format"
import { unreadNotices } from "@/lib/notify"
import { unreadMessages } from "@/lib/support"
import { homeFor } from "@/lib/roles"
import { brand } from "@/theme/brand"

/** Public site and customer area: top bar, phone tabs, footer. */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const [locale, user, settings] = await Promise.all([getLocale(), getUser(), getSettings()])
  const t = words(locale)
  const customer = user?.role === "CUSTOMER"
  const [notices, messages] = customer ? await Promise.all([unreadNotices(user.id), unreadMessages(user)]) : [0, 0]
  const items: NavItem[] = [
    { href: "/", label: t.home, icon: "home", exact: true },
    { href: "/services", label: t.services, icon: "grid" },
    { href: "/bookings", label: t.bookings, icon: "list", badge: messages },
    { href: "/help", label: t.help, icon: "help" },
    { href: "/profile", label: t.profile, icon: "user", badge: notices },
  ]
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:px-6">
          <Link href="/" aria-label={brand.name}>
            <Logo bn={locale === "bn"} />
          </Link>
          <nav className="ml-6 hidden items-center gap-5 text-sm font-bold text-ink md:flex">
            <Link href="/services">{t.services}</Link>
            <Link href="/how-it-works">{locale === "bn" ? "কীভাবে কাজ করে" : "How it works"}</Link>
            <Link href="/help">{t.help}</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <a href={telHref(settings.helpline)} className="hidden items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-extrabold text-brand sm:inline-flex">
              <Phone className="size-3.5" /> {settings.helpline}
            </a>
            <LocaleSwitch locale={locale} />
            {user ? (
              <Link href={customer ? "/profile" : homeFor(user.role)} className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ring-1 ring-line md:inline-flex">
                <UserRound className="size-4" /> {user.name.split(" ")[0]}
              </Link>
            ) : (
              <Link href="/login" className="hidden rounded-full bg-ink px-4 py-2 text-sm font-bold text-white md:inline-flex">
                {t.login}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-5 pb-28 md:px-6 md:pt-8 md:pb-16">{children}</main>

      <footer className="hidden border-t border-line bg-paper md:block">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-3">
          <div>
            <Logo bn={locale === "bn"} />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{locale === "bn" ? brand.taglineBn : brand.tagline}</p>
            <p className="mt-2 text-xs font-bold text-brand">{t.sadarOnly}</p>
          </div>
          <div className="text-sm">
            <p className="font-extrabold text-ink">{locale === "bn" ? "যোগাযোগ" : "Contact"}</p>
            <p className="mt-2 text-muted-foreground">{locale === "bn" ? settings.address : settings.addressEn}</p>
            <p className="mt-1 text-muted-foreground">{locale === "bn" ? settings.officeHours : settings.officeHoursEn}</p>
            <div className="mt-3 flex gap-2">
              <a href={telHref(settings.helpline)} className="btn-soft h-10 px-4 text-sm">
                <Phone className="size-4" /> {settings.helpline}
              </a>
              <a href={whatsappHref(settings.whatsapp)} className="btn-ghost h-10 px-4 text-sm">
                <MessageCircle className="size-4" /> {t.whatsapp}
              </a>
            </div>
          </div>
          <div className="text-sm">
            <p className="font-extrabold text-ink">{locale === "bn" ? "লিংক" : "Links"}</p>
            <ul className="mt-2 space-y-1.5 text-muted-foreground">
              <li><Link href="/services">{t.services}</Link></li>
              <li><Link href="/how-it-works">{locale === "bn" ? "কীভাবে কাজ করে" : "How it works"}</Link></li>
              <li><Link href="/help">{t.help}</Link></li>
              <li><Link href="/login">{locale === "bn" ? "কর্মী বা অফিস লগইন" : "Worker & office login"}</Link></li>
            </ul>
          </div>
        </div>
        <p className="border-t border-line py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} {brand.name} · Cox&apos;s Bazar</p>
      </footer>

      <BottomNav items={items} />
    </div>
  )
}
