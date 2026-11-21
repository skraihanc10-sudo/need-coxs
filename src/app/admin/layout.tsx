import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { unreadForOffice } from "@/lib/support"
import { pick } from "@/lib/i18n"
import { PanelShell, type NavItem } from "@/components/shell/nav"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, locale] = await Promise.all([requireUser(["ADMIN"], "/admin"), getLocale()])
  const [waiting, unread] = await Promise.all([db.serviceBooking.count({ where: { status: "REQUESTED" } }), unreadForOffice(user)])
  const items: NavItem[] = [
    { href: "/admin", label: pick(locale, "ড্যাশবোর্ড", "Dashboard"), icon: "dashboard", exact: true },
    { href: "/admin/bookings", label: pick(locale, "বুকিং", "Bookings"), icon: "list", badge: waiting },
    { href: "/admin/workers", label: pick(locale, "কর্মী", "Workers"), icon: "workers" },
    { href: "/admin/customers", label: pick(locale, "কাস্টমার", "Customers"), icon: "users" },
    { href: "/admin/services", label: pick(locale, "সেবা ও দাম", "Services & prices"), icon: "services" },
    { href: "/admin/areas", label: pick(locale, "এলাকা", "Areas"), icon: "map" },
    { href: "/support", label: pick(locale, "সাপোর্ট ইনবক্স", "Support inbox"), icon: "inbox", badge: unread },
    { href: "/admin/reports", label: pick(locale, "রিপোর্ট", "Reports"), icon: "reports" },
    { href: "/admin/staff", label: pick(locale, "স্টাফ", "Staff"), icon: "staff" },
    { href: "/admin/settings", label: pick(locale, "সেটিংস", "Settings"), icon: "settings" },
  ]
  return (
    <PanelShell title={pick(locale, "অ্যাডমিন প্যানেল", "Admin panel")} items={items} user={{ name: user.name, role: user.role }} locale={locale}>
      {children}
    </PanelShell>
  )
}
