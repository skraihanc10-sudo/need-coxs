import { PageBanner } from "@/components/site/chrome"
import { getSettings } from "@/lib/settings"
import { sendInquiry } from "@/actions/site"
import { brand } from "@/theme/brand"

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams
  const settings = await getSettings()
  return (
    <div>
      <PageBanner title="Contact us" crumbs={["Contact Us"]} />
      <section className="site-wrap grid gap-10 py-14 lg:grid-cols-2">
        <div className="relative min-h-[320px] bg-[#d7e3df]">
          <svg viewBox="0 0 400 300" className="h-full w-full" aria-label="Map of central Dhaka">
            <rect width="400" height="300" fill="#e7efec" />
            <path d="M40 40h320v220H40z" fill="#f7fbfa" stroke="#c5d5d0" />
            <path d="M70 180 C140 120, 220 200, 330 90" fill="none" stroke="#9bb8c4" strokeWidth="8" />
            <circle cx="210" cy="150" r="8" fill="#00b45a" />
            <text x="222" y="146" fontSize="12" fill="#1f3a47">Dhanmondi desk</text>
          </svg>
          <a className="absolute top-4 left-4 bg-white px-3 py-2 text-xs font-bold shadow" href="https://www.google.com/maps/search/?api=1&query=23.746,90.374">Open in Maps</a>
        </div>
        <dl className="space-y-5 text-sm">
          <div className="border-b pb-4">
            <dt className="font-bold">Address</dt>
            <dd className="mt-1 text-[var(--pub-muted)]">{settings.address}</dd>
          </div>
          <div className="border-b pb-4">
            <dt className="font-bold">Telephone</dt>
            <dd className="mt-1"><a className="font-bold text-[var(--pub-green)]" href={`tel:${settings.supportPhone}`}>{settings.supportPhone}</a></dd>
          </div>
          <div className="border-b pb-4">
            <dt className="font-bold">WhatsApp</dt>
            <dd className="mt-1"><a className="font-bold text-[var(--pub-green)]" href={`https://wa.me/${settings.supportPhone.replace(/\D/g, "").replace(/^0/, "880")}`} target="_blank" rel="noreferrer">Message {brand.name} on WhatsApp</a></dd>
          </div>
          <div className="border-b pb-4">
            <dt className="font-bold">E-mail</dt>
            <dd className="mt-1"><a className="font-bold text-[var(--pub-green)]" href={`mailto:${settings.supportEmail}`}>{settings.supportEmail}</a></dd>
          </div>
        </dl>
      </section>
      <section className="site-wrap max-w-3xl pb-16 text-center">
        <p className="text-sm font-bold text-[var(--pub-green)]">● Contact us</p>
        <h2 className="mt-2 text-5xl">Get in touch</h2>
        <form action={sendInquiry} className="mt-8 space-y-4 text-left">
          {sp.error ? <p className="text-sm text-rose-600">{sp.error}</p> : null}
          {sp.ok ? <p className="text-sm text-[var(--pub-green)]">Message received.</p> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <input name="name" required placeholder="Name" className="h-12 border bg-[#f3f5f6] px-3" />
            <input name="email" type="email" required placeholder="E-mail" className="h-12 border bg-[#f3f5f6] px-3" />
          </div>
          <input name="phone" placeholder="Phone" className="hidden" />
          <input type="hidden" name="topic" value="Website" />
          <textarea name="message" required minLength={8} placeholder="Message" className="min-h-40 w-full border bg-[#f3f5f6] px-3 py-2" />
          <button className="pub-btn mx-auto">Send message</button>
        </form>
      </section>
    </div>
  )
}
