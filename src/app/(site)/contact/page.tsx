import { PageBanner } from "@/components/site/chrome"
import { getSettings } from "@/lib/settings"
import { sendInquiry } from "@/actions/site"
import { brand } from "@/theme/brand"

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams
  const settings = await getSettings()
  return (
    <div>
      <PageBanner title="Contact" crumb="Contact" />
      <div className="site-wrap grid gap-10 py-14 md:grid-cols-2">
        <div className="space-y-4 text-sm leading-6">
          <p className="site-kicker">{brand.name}</p>
          <h2 className="text-3xl font-extrabold">Write to the desk</h2>
          <p>{settings.address}</p>
          <p><a className="font-bold text-[var(--brand)]" href={`tel:${settings.supportPhone}`}>{settings.supportPhone}</a></p>
          <p><a className="font-bold text-[var(--brand)]" href={`mailto:${settings.supportEmail}`}>{settings.supportEmail}</a></p>
          <p className="text-muted-foreground">Signed-in customers can also use the in-app chat. This form lands in the admin message queue.</p>
        </div>
        <form action={sendInquiry} className="surface-card space-y-3 p-5">
          {sp.error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{sp.error}</p> : null}
          {sp.ok ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Received. The desk has it.</p> : null}
          <input name="name" required placeholder="Name" className="h-12 w-full rounded-xl border px-3" />
          <input name="email" type="email" required placeholder="Email" className="h-12 w-full rounded-xl border px-3" />
          <input name="phone" placeholder="Phone" className="h-12 w-full rounded-xl border px-3" />
          <select name="topic" className="h-12 w-full rounded-xl border px-3">
            <option>Pickup</option>
            <option>Pricing</option>
            <option>Partnership</option>
            <option>Something else</option>
          </select>
          <textarea name="message" required minLength={8} placeholder="How can we help?" className="min-h-32 w-full rounded-xl border px-3 py-2" />
          <button className="h-12 w-full rounded-full bg-primary font-extrabold text-primary-foreground">Send</button>
        </form>
      </div>
    </div>
  )
}
