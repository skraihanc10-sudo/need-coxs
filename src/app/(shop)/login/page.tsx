import Link from "next/link"
import { redirect } from "next/navigation"
import { Logo } from "@/components/logo"
import { LoginForm } from "@/components/login-form"
import { getUser, getLocale } from "@/lib/auth"
import { homeFor } from "@/lib/roles"
import { copy } from "@/lib/i18n"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const user = await getUser()
  if (user) redirect(homeFor(user.role))
  const { next = "" } = await searchParams
  const t = copy(await getLocale())
  return (
    <div className="px-5 py-10">
      <Logo />
      <h1 className="mt-6 text-2xl font-extrabold">{t.loginTitle}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Demo accounts fill the form. Passwords are on the cards.</p>
      <div className="mt-6">
        <LoginForm next={next} title={t.email} />
      </div>
      <p className="mt-4 text-sm">
        <Link href="/forgot" className="font-bold text-[var(--brand)]">Forgot password</Link>
      </p>
      <p className="mt-2 text-sm">
        {t.noAccount} <Link href="/register" className="font-bold text-[var(--brand)]">{t.register}</Link>
      </p>
      <p className="mt-2 text-sm">
        <Link href="/partner" className="font-bold text-[var(--brand)]">{t.partner}</Link>
      </p>
    </div>
  )
}
