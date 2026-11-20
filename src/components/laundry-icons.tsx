export function KindIcon({ slug }: { slug: string }) {
  const common = "size-7"
  if (slug === "iron") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden>
        <path d="M10 30h22l4 8H14l-4-8z" fill="currentColor" />
        <path d="M14 18h16v8H14z" fill="currentColor" opacity=".45" />
        <path d="M18 12h8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }
  if (slug === "dry") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden>
        <path d="M16 10h16l4 8v16H12V18z" fill="currentColor" />
        <path d="M18 22h12M18 28h8" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    )
  }
  if (slug === "both") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden>
        <path d="M14 14h20v6H14z" fill="currentColor" />
        <path d="M12 22h24l-2 14H14z" fill="currentColor" opacity=".8" />
        <path d="M18 28h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 48 48" className={common} aria-hidden>
      <rect x="10" y="14" width="28" height="22" rx="6" fill="currentColor" />
      <circle cx="24" cy="25" r="6" fill="white" />
      <circle cx="24" cy="25" r="2.5" fill="currentColor" />
    </svg>
  )
}

export function StoreLogo({ mark }: { mark: string }) {
  return (
    <span className="grid size-11 place-items-center rounded-full bg-white text-[var(--brand)] shadow ring-2 ring-white">
      <KindIcon slug={mark === "iron" ? "iron" : mark === "machine" ? "wash" : mark === "hanger" || mark === "shirt" ? "dry" : "both"} />
    </span>
  )
}
