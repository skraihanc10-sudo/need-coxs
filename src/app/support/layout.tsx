import { requireUser, getLocale } from "@/lib/auth"
import { unreadForOffice } from "@/lib/support"
import { pick } from "@/lib/i18n"
import { PanelShell, type NavItem } from "@/components/shell/nav"

export default async function SupportLayout({ children }: { children: React.ReactNode }) {
  const [user, locale] = await Promise.all([requireUser(["SUPPORT", "ADMIN"], "/support"), getLocale()])
  const unread = await unreadForOffice(user)
  const items: NavItem[] = [
    { href: "/support", label: pick(locale, "ইনবক্স", "Inbox"), icon: "inbox", exact: true, badge: unread },
    { href: "/support/bookings", label: pick(locale, "বুকিং", "Bookings"), icon: "list" },
    { href: "/support/tickets", label: pick(locale, "টিকেট", "Tickets"), icon: "help" },
    { href: "/support/templates", label: pick(locale, "টেমপ্লেট", "Templates"), icon: "chat" },
    ...(user.role === "ADMIN" ? [{ href: "/admin", label: pick(locale, "অ্যাডমিন", "Admin"), icon: "dashboard" as const }] : []),
  ]
  return (
    <PanelShell title={pick(locale, "কাস্টমার কেয়ার", "Customer care")} items={items} user={{ name: user.name, role: user.role }} locale={locale}>
      {children}
    </PanelShell>
  )
}
