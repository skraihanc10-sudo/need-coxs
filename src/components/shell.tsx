"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ClipboardList, TicketPercent, MessageCircle, UserRound, LayoutGrid, Shirt, Wallet, Bell } from "lucide-react"
import { Logo } from "./logo"
import { brand } from "@/theme/brand"

const BARE = ["/onboarding", "/login", "/register", "/otp", "/forgot", "/checkout", "/pay", "/partner", "/orders/success"]

function bare(path: string) {
  return BARE.some((item) => path === item || path.startsWith(`${item}/`))
}

export function AppShell({
  panel,
  labels,
  children,
}: {
  panel: "customer" | "store" | "rider"
  labels?: { home: string; orders: string; offers: string; chat: string; profile: string }
  children: React.ReactNode
}) {
  const path = usePathname()
  const quiet = panel === "customer" && bare(path)
  const frame = quiet ? "app-shell bare" : "app-shell"
  return (
    <div className={panel === "customer" ? "desk" : "stage"}>
      {panel === "customer" ? <Desk /> : null}
      <div className={frame} data-panel={panel}>
        <div className={quiet ? "" : "pb-2"}>{children}</div>
        {!quiet && panel === "customer" && labels ? <CustomerNav path={path} labels={labels} /> : null}
        {!quiet && panel === "store" ? <StoreNav path={path} /> : null}
        {!quiet && panel === "rider" ? <RiderNav path={path} /> : null}
      </div>
      {panel === "customer" ? <Desk steps /> : null}
    </div>
  )
}

function Desk({ steps = false }: { steps?: boolean }) {
  return (
    <aside className="desk-side">
      <Logo />
      <div>
        <p className="text-3xl font-extrabold tracking-tight text-[var(--brand-ink)]">
          {steps ? "Pickup, wash, return." : brand.name}
        </p>
        <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--brand-muted)]">
          {steps
            ? "Compare neighbourhood laundries in Dhaka, choose a cloth and a service, and pay the rider in cash."
            : "Doorstep laundry for Dhaka. Cash on delivery is live."}
        </p>
      </div>
    </aside>
  )
}

function CustomerNav({
  path,
  labels,
}: {
  path: string
  labels: { home: string; orders: string; offers: string; chat: string; profile: string }
}) {
  const items = [
    [labels.home, "/app", Home],
    [labels.orders, "/orders", ClipboardList],
    [labels.offers, "/offers", TicketPercent],
    [labels.chat, "/chat", MessageCircle],
    [labels.profile, "/profile", UserRound],
  ] as const
  return (
    <nav className="bottom-nav grid-cols-5">
      {items.map(([label, href, Icon]) => {
        const on = href === "/app" ? path === "/app" : path === href || path.startsWith(`${href}/`)
        return (
          <Link key={href} href={href} data-on={on}>
            <Icon className="size-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

function StoreNav({ path }: { path: string }) {
  const items = [
    ["Home", "/vendor", LayoutGrid],
    ["Orders", "/vendor/orders", ClipboardList],
    ["Prices", "/vendor/prices", Shirt],
    ["Account", "/vendor/account", UserRound],
  ] as const
  return (
    <nav className="bottom-nav grid-cols-4">
      {items.map(([label, href, Icon]) => {
        const on = href === "/vendor" ? path === href : path.startsWith(href)
        return (
          <Link key={href} href={href} data-on={on}>
            <Icon className="size-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

function RiderNav({ path }: { path: string }) {
  const items = [
    ["Jobs", "/rider", ClipboardList],
    ["Earnings", "/rider/earnings", Wallet],
    ["Alerts", "/rider/notices", Bell],
    ["Account", "/rider/account", UserRound],
  ] as const
  return (
    <nav className="bottom-nav grid-cols-4">
      {items.map(([label, href, Icon]) => {
        const on = href === "/rider" ? path === "/rider" || path.startsWith("/rider/jobs") : path.startsWith(href)
        return (
          <Link key={href} href={href} data-on={on}>
            <Icon className="size-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminShell({ name, children }: { name: string; children: React.ReactNode }) {
  const path = usePathname()
  const links = [
    ["/admin", "Overview"],
    ["/admin/orders", "Orders"],
    ["/admin/messages", "Messages"],
    ["/admin/stores", "Stores"],
    ["/admin/customers", "Customers"],
    ["/admin/riders", "Riders"],
    ["/admin/banners", "Banners"],
    ["/admin/coupons", "Coupons"],
    ["/admin/faqs", "FAQs"],
    ["/admin/payouts", "Payouts"],
    ["/admin/reports", "Reports"],
    ["/admin/earnings", "Earnings"],
    ["/admin/zones", "Zones"],
    ["/admin/gateways", "Gateways"],
    ["/admin/pages", "Pages"],
    ["/admin/profile", "Profile"],
    ["/admin/notifications", "Notifications"],
    ["/admin/settings", "Settings"],
  ]
  return (
    <div className="admin" data-panel="admin">
      <aside className="admin-side md:min-h-screen">
        <div className="flex items-center gap-2 px-4 py-4">
          <Logo light />
        </div>
        <p className="px-4 pb-3 text-xs text-white/60">{name}</p>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:px-3">
          {links.map(([href, label]) => {
            const on = href === "/admin" ? path === href : path.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`block whitespace-nowrap rounded-full px-3 py-2 text-sm ${on ? "bg-[var(--brand)] text-white" : "text-white/75"}`}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
