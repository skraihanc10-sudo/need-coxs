import { brand } from "@/theme/brand"

export function Mark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <rect width="48" height="48" rx="14" fill="var(--brand)" />
      <path d="M14 20h20v3.2H14z" fill="white" />
      <path d="M16 25h16l-1.6 9H17.6L16 25z" fill="var(--accent)" />
      <path d="M19 16.5c.4-2.4 2.2-4 5-4s4.6 1.6 5 4" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ light = false, size = 34 }: { light?: boolean; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Mark size={size} />
      <span
        className={light ? "text-white" : "text-[var(--brand-ink)]"}
        style={{ fontWeight: 800, letterSpacing: "-0.04em" }}
      >
        {brand.name}
      </span>
    </span>
  )
}
