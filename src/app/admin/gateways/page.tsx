import { requireUser } from "@/lib/auth"
import { getSettings } from "@/lib/settings"
import { saveGateway } from "@/actions/admin"
import { providers } from "@/lib/payments"

export default async function GatewaysPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser(["ADMIN"], "/admin/gateways")
  const sp = await searchParams
  const settings = await getSettings()
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Payment gateways</h1>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">Cash on delivery charges nothing online. The others stay off until env keys exist. Secrets are never shown here.</p>
      {sp.ok ? <p className="text-sm text-emerald-700">Saved.</p> : null}
      <div className="mt-4 space-y-3">
        {providers.map((provider) => (
          <form key={provider.id} action={saveGateway} className="surface-card flex items-center justify-between p-4">
            <div>
              <p className="font-bold">{provider.label}</p>
              <p className="text-sm text-muted-foreground">{provider.hint}</p>
              <p className="text-xs">{provider.env.length ? `Needs ${provider.env.join(", ")}` : "No keys required"}</p>
            </div>
            <input type="hidden" name="key" value={provider.setting} />
            <label className="text-sm font-bold">
              <input type="checkbox" name="enabled" defaultChecked={settings[provider.setting] !== "0"} /> On
            </label>
            <button className="text-sm font-bold text-[var(--brand)]">Save</button>
          </form>
        ))}
      </div>
    </div>
  )
}
