import { requireUser } from "@/lib/auth"
import { saveAdminProfile } from "@/actions/admin"

export default async function AdminProfile({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const user = await requireUser(["ADMIN"], "/admin/profile")
  const sp = await searchParams
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Profile</h1>
      <p className="text-sm text-muted-foreground">{user.email}. Passwords are stored as a hash and are never shown back.</p>
      {sp.ok ? <p className="text-sm text-emerald-700">Saved.</p> : null}
      {sp.error ? <p className="text-sm text-rose-600">{sp.error}</p> : null}
      <form action={saveAdminProfile} className="mt-4 grid max-w-lg gap-2">
        <input name="name" defaultValue={user.name} className="h-11 rounded-xl border px-3" />
        <input name="phone" defaultValue={user.phone} className="h-11 rounded-xl border px-3" />
        <input name="password" type="password" placeholder="New password, leave blank to keep" className="h-11 rounded-xl border px-3" autoComplete="new-password" />
        <button className="pill bg-primary text-primary-foreground">Save profile</button>
      </form>
    </div>
  )
}
