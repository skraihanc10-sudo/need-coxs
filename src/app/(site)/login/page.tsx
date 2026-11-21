import Link from "next/link"
import { redirect } from "next/navigation"
import { getLocale, getUser } from "@/lib/auth"
import { homeFor, safeNext } from "@/lib/roles"
import { pick, words } from "@/lib/i18n"
import { loginAction } from "@/actions/auth"
import { ActionForm, SubmitButton } from "@/components/forms"
import { PageHeader } from "@/components/bits"
import { demoAccounts, demoWorkers, WORKER_PASSWORD } from "@/theme/demo-accounts"
import { OtpLogin } from "./otp-login"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; tab?: string }> }) {
  const [{ next = "", tab = "" }, locale, user] = await Promise.all([searchParams, getLocale(), getUser()])
  if (user) redirect(safeNext(user.role, next || homeFor(user.role)))
  const t = words(locale)
  const staff = tab === "staff"
  const showDemo = process.env.SHOW_DEMO_LOGINS !== "0"

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title={t.login} sub={pick(locale, "কাস্টমাররা মোবাইল নম্বর দিয়ে ঢুকুন। কর্মী আর অফিস ইমেইল-পাসওয়ার্ড দিয়ে।", "Customers sign in with a mobile number. Workers and office staff use email and password.")} />
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-paper p-1 ring-1 ring-line text-sm font-bold">
        <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className={`rounded-full py-2 text-center ${!staff ? "bg-ink text-white" : "text-muted-foreground"}`}>{pick(locale, "মোবাইল নম্বর", "Mobile number")}</Link>
        <Link href={`/login?tab=staff${next ? `&next=${encodeURIComponent(next)}` : ""}`} className={`rounded-full py-2 text-center ${staff ? "bg-ink text-white" : "text-muted-foreground"}`}>{pick(locale, "কর্মী / অফিস", "Worker / office")}</Link>
      </div>

      {staff ? (
        <ActionForm action={loginAction} resetOnSuccess={false} className="card space-y-4 p-5">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className="label" htmlFor="identifier">{pick(locale, "ইমেইল বা মোবাইল", "Email or mobile")}</label>
            <input id="identifier" name="identifier" className="field" autoComplete="username" required />
          </div>
          <div>
            <label className="label" htmlFor="password">{pick(locale, "পাসওয়ার্ড", "Password")}</label>
            <input id="password" name="password" type="password" className="field" autoComplete="current-password" required />
          </div>
          <SubmitButton pendingText={pick(locale, "ঢুকছি…", "Signing in…")}>{t.login}</SubmitButton>
        </ActionForm>
      ) : (
        <OtpLogin locale={locale} next={next} />
      )}

      {showDemo ? (
        <details className="mt-6 text-sm">
          <summary className="cursor-pointer font-bold text-muted-foreground">{pick(locale, "ডেমো লগইন", "Demo logins")}</summary>
          <div className="card mt-2 space-y-1 p-4 text-xs text-muted-foreground">
            {demoAccounts.map((a) => (
              <p key={a.email}><span className="font-bold text-ink">{a.label}:</span> {a.email} / {a.password}</p>
            ))}
            {demoWorkers.map((w) => (
              <p key={w.email}><span className="font-bold text-ink">{w.name}:</span> {w.email} / {WORKER_PASSWORD}</p>
            ))}
            <p className="pt-1">{pick(locale, "কাস্টমার OTP (ডেমো): 123456", "Customer OTP (demo): 123456")}</p>
          </div>
        </details>
      ) : null}
    </div>
  )
}
