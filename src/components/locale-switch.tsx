"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { setLocaleAction } from "@/actions/auth"
import type { Locale } from "@/lib/format"

/** EN ⇄ বাং toggle. Works everywhere, including phones and every panel. */
export function LocaleSwitch({ locale, light = false }: { locale: Locale; light?: boolean }) {
  const path = usePathname()
  const query = useSearchParams().toString()
  const back = query ? `${path}?${query}` : path
  const base = light ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-ink"
  const on = light ? "bg-white text-ink" : "bg-ink text-white"
  return (
    <form action={setLocaleAction} className={`inline-flex items-center rounded-full p-0.5 text-xs font-extrabold ring-1 ${light ? "ring-white/20" : "ring-line bg-paper"}`} aria-label="Language">
      <input type="hidden" name="back" value={back} />
      <button name="locale" value="bn" className={`rounded-full px-2.5 py-1 ${locale === "bn" ? on : base}`} aria-pressed={locale === "bn"}>
        বাং
      </button>
      <button name="locale" value="en" className={`rounded-full px-2.5 py-1 ${locale === "en" ? on : base}`} aria-pressed={locale === "en"}>
        EN
      </button>
    </form>
  )
}
