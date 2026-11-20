import { requireUser } from "@/lib/auth"
import { logout, setLocale } from "@/actions/auth"
import { toggleAvailability } from "@/actions/rider"

export default async function RiderAccount() {
  const user = await requireUser(["DELIVERY"], "/rider/account")
  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-extrabold">{user.name}</h1>
      <p className="text-sm text-muted-foreground">{user.phone} · {user.rider!.vehicle} · {user.rider!.zone}</p>
      <form action={toggleAvailability} className="mt-4">
        <button className="pill w-full border">{user.rider!.available ? "Pause new jobs" : "I am available"}</button>
      </form>
      <form action={setLocale} className="mt-4 flex gap-2">
        <input type="hidden" name="back" value="/rider/account" />
        <button name="locale" value="en" className="rounded-full border px-4 py-2 text-sm font-bold">English</button>
        <button name="locale" value="bn" className="rounded-full border px-4 py-2 text-sm font-bold">বাংলা</button>
      </form>
      <form action={logout}>
        <button className="pill w-full bg-primary text-primary-foreground">Log out</button>
      </form>
    </div>
  )
}
