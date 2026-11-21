"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  HardHat,
  HelpCircle,
  Home,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  MapPin,
  MessageSquareText,
  Settings,
  Sparkles,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { logoutAction } from "@/actions/auth"
import { Logo } from "@/components/logo"
import { LocaleSwitch } from "@/components/locale-switch"
import type { Locale } from "@/lib/format"

const ICONS: Record<string, LucideIcon> = {
  home: Home,
  grid: LayoutGrid,
  list: ClipboardList,
  help: HelpCircle,
  user: UserRound,
  bell: Bell,
  wallet: Wallet,
  inbox: Inbox,
  chat: MessageSquareText,
  dashboard: LayoutDashboard,
  workers: HardHat,
  users: Users,
  services: Sparkles,
  map: MapPin,
  reports: BarChart3,
  settings: Settings,
  staff: BriefcaseBusiness,
}

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; badge?: number; exact?: boolean }

function isOn(path: string, item: NavItem) {
  if (item.exact || item.href === "/") return path === item.href
  return path === item.href || path.startsWith(`${item.href}/`)
}

function Badge({ count }: { count?: number }) {
  if (!count) return null
  return (
    <span className="absolute -top-1 right-1/2 translate-x-4 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-extrabold text-white md:static md:ml-auto md:translate-x-0">
      {count > 99 ? "99+" : count}
    </span>
  )
}

/** Phone bottom tabs. Up to five items. */
export function BottomNav({ items }: { items: NavItem[] }) {
  const path = usePathname()
  // The booking wizard has its own sticky bar, so the tabs step aside there.
  if (path.startsWith("/book/")) return null
  return (
    <nav className="nav-bottom" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map((item) => {
        const Icon = ICONS[item.icon]
        return (
          <Link key={item.href} href={item.href} data-on={isOn(path, item)}>
            <Icon className="size-5" />
            <Badge count={item.badge} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

/**
 * Desktop sidebar + top bar for worker, support and admin panels. On phones
 * the sidebar becomes bottom tabs (≤5 items) or a scrolling tab row.
 */
export function PanelShell({
  title,
  items,
  user,
  locale,
  children,
}: {
  title: string
  items: NavItem[]
  user: { name: string; role: string }
  locale: Locale
  children: React.ReactNode
}) {
  const path = usePathname()
  const tabs = items.length <= 5
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[256px_1fr]">
      <aside className="hidden bg-ink text-white md:sticky md:top-0 md:flex md:h-dvh md:flex-col">
        <div className="px-5 pt-6 pb-4">
          <Logo light bn={locale === "bn"} />
          <p className="mt-3 text-[11px] font-bold tracking-wider text-white/40 uppercase">{title}</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {items.map((item) => {
            const Icon = ICONS[item.icon]
            return (
              <Link key={item.href} href={item.href} className="side-link" data-on={isOn(path, item)}>
                <Icon className="size-[18px]" />
                <span className="flex-1">{item.label}</span>
                <Badge count={item.badge} />
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-bold">{user.name}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <LocaleSwitch locale={locale} light />
            <form action={logoutAction}>
              <button className="inline-flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-white">
                <LogOut className="size-3.5" /> {locale === "bn" ? "লগআউট" : "Log out"}
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 md:px-6">
            <span className="md:hidden">
              <Logo bn={locale === "bn"} size={28} />
            </span>
            <p className="hidden text-sm font-bold text-muted-foreground md:block">{title}</p>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-sm font-semibold text-ink sm:block">{user.name}</span>
              <span className="md:hidden">
                <LocaleSwitch locale={locale} />
              </span>
              <form action={logoutAction} className="md:hidden">
                <button aria-label="Log out" className="grid size-9 place-items-center rounded-full ring-1 ring-line">
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          </div>
          {!tabs ? (
            <nav className="flex gap-2 overflow-x-auto px-4 pb-2.5 md:hidden">
              {items.map((item) => (
                <Link key={item.href} href={item.href} className="chip shrink-0" data-on={isOn(path, item)}>
                  {item.label}
                  {item.badge ? <span className="ml-1.5 rounded-full bg-danger px-1.5 text-[10px] text-white">{item.badge}</span> : null}
                </Link>
              ))}
            </nav>
          ) : null}
        </header>
        <main className={`mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-7 ${tabs ? "pb-24 md:pb-8" : "pb-8"}`}>{children}</main>
        {tabs ? <BottomNav items={items} /> : null}
      </div>
    </div>
  )
}
