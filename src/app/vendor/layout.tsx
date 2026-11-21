import { AppShell } from "@/components/shell"
import { requireUser } from "@/lib/auth"
import { logout } from "@/actions/auth"

export const dynamic = "force-dynamic"

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["STORE"], "/vendor")
  if (!user.store) {
    return <p className="p-6">This login has no provider profile attached.</p>
  }
  if (user.store.status !== "APPROVED") {
    return (
      <AppShell panel="store">
        <div className="px-5 py-12">
          <p className="text-sm font-bold text-[var(--store-brand)]">Need Cox&apos;s</p>
          <h1 className="mt-2 text-2xl font-extrabold">{user.store.name}</h1>
          <p className="mt-2 text-sm">This provider is {user.store.status.toLowerCase()}. You can sign in, but customers will not see you until an admin approves the profile.</p>
          <form action={logout} className="mt-6">
            <button className="pill w-full bg-primary text-primary-foreground">Log out</button>
          </form>
        </div>
      </AppShell>
    )
  }
  return <AppShell panel="store">{children}</AppShell>
}
