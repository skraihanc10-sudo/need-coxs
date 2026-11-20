import { requireUser } from "@/lib/auth"
import { getSettings, SETTING_DEFAULTS } from "@/lib/settings"
import { saveGeneralSettings } from "@/actions/admin"

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser(["ADMIN"], "/admin/settings")
  const sp = await searchParams
  const settings = await getSettings()
  const toggles = Object.keys(SETTING_DEFAULTS).filter((key) => key.startsWith("pay"))
  const fields = Object.keys(SETTING_DEFAULTS).filter((key) => !key.startsWith("pay") && !key.startsWith("notify"))
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Settings</h1>
      {sp.ok ? <p className="text-sm text-emerald-700">Saved.</p> : null}
      <form action={saveGeneralSettings} className="mt-4 grid max-w-lg gap-2">
        {fields.map((key) => (
          <label key={key} className="text-sm font-semibold">
            {key}
            <input name={key} defaultValue={settings[key]} className="mt-1 h-11 w-full rounded-xl border px-3 font-medium" />
          </label>
        ))}
        {toggles.map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name={key} defaultChecked={settings[key] !== "0"} /> {key}
          </label>
        ))}
        <button className="pill bg-primary text-primary-foreground">Save settings</button>
      </form>
    </div>
  )
}
