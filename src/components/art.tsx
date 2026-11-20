export function HeroArt() {
  return (
    <svg viewBox="0 0 160 120" className="h-28 w-36" aria-hidden>
      <rect x="18" y="28" width="70" height="70" rx="16" fill="white" opacity="0.18" />
      <rect x="70" y="18" width="72" height="84" rx="18" fill="white" />
      <path d="M88 42h36v8H88zM90 56h32l-3 28H93l-3-28z" fill="var(--brand)" />
      <circle cx="108" cy="40" r="6" fill="var(--accent)" />
    </svg>
  )
}

export function OnboardArt({ n }: { n: number }) {
  const shapes = [
    <g key="a">
      <rect x="40" y="30" width="80" height="64" rx="18" fill="var(--brand-soft)" />
      <path d="M58 58h44v6H58zM62 68h36l-4 18H66z" fill="var(--brand)" />
    </g>,
    <g key="b">
      <rect x="36" y="36" width="88" height="52" rx="16" fill="var(--brand-soft)" />
      <circle cx="80" cy="62" r="16" fill="var(--accent)" />
      <path d="M74 62h12M80 56v12" stroke="white" strokeWidth="3" />
    </g>,
    <g key="c">
      <rect x="48" y="28" width="64" height="72" rx="18" fill="var(--brand)" />
      <rect x="60" y="48" width="40" height="8" rx="4" fill="var(--accent)" />
      <rect x="60" y="64" width="28" height="8" rx="4" fill="white" />
    </g>,
  ]
  return (
    <svg viewBox="0 0 160 120" className="h-44 w-56" aria-hidden>
      {shapes[n] ?? shapes[0]}
    </svg>
  )
}

export function SuccessArt() {
  return (
    <svg viewBox="0 0 120 120" className="mx-auto h-28 w-28" aria-hidden>
      <circle cx="60" cy="60" r="46" fill="color-mix(in srgb, var(--accent) 25%, white)" />
      <circle cx="60" cy="60" r="30" fill="var(--brand)" />
      <path d="M46 61l8 8 20-22" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

export function ShirtIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-8" aria-hidden>
      <path d="M16 14l8-4 8 4 6 4-4 6h-4v14H18V24h-4l-4-6 6-4z" fill="currentColor" />
    </svg>
  )
}
