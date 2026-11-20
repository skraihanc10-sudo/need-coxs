import { Logo } from "@/components/logo"
import { OnboardArt } from "@/components/art"
import { finishIntro } from "@/actions/auth"
import { getLocale } from "@/lib/auth"
import { copy } from "@/lib/i18n"
import { brand } from "@/theme/brand"

export default async function Onboarding({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const { s = "0" } = await searchParams
  const step = Math.min(2, Math.max(0, Number(s) || 0))
  const t = copy(await getLocale())
  const slides = [
    [t.onboard1, t.onboard1b],
    [t.onboard2, t.onboard2b],
    [t.onboard3, t.onboard3b],
  ]
  const [title, body] = slides[step]
  const last = step === 2
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6">
        {step === 0 ? <Logo /> : null}
        <OnboardArt n={step} />
        {step === 0 ? <p className="text-sm text-muted-foreground">{brand.name}</p> : null}
      </div>
      <div className="rounded-t-[28px] bg-primary px-6 pt-7 pb-8 text-primary-foreground">
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <p className="mt-2 text-sm text-white/80">{body}</p>
        <form action={finishIntro} className="mt-6 space-y-3">
          <input type="hidden" name="to" value={last ? "/" : `/onboarding?s=${step + 1}`} />
          {last ? <input type="hidden" name="done" value="1" /> : null}
          <button className="pill w-full bg-white text-[var(--brand-ink)]">{last ? t.getStarted : t.next}</button>
        </form>
        {!last ? (
          <form action={finishIntro}>
            <input type="hidden" name="done" value="1" />
            <input type="hidden" name="to" value="/" />
            <button className="mt-3 w-full text-sm text-white/80">{t.skip}</button>
          </form>
        ) : null}
      </div>
    </div>
  )
}
