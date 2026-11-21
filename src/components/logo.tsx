import { brand } from "@/theme/brand"

export function Mark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <rect width="48" height="48" rx="14" fill="var(--brand)" />
      {/* a roof for home services over a wave for the sea */}
      <path d="M14 23l10-9 10 9" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 23v-4h10v4" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M10 31c3-3 6-3 9 0s6 3 9 0 6-3 9 0" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ light = false, size = 34, bn = false }: { light?: boolean; size?: number; bn?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Mark size={size} />
      <span className={`display text-[1.15rem] font-extrabold ${light ? "text-white" : "text-ink"}`}>{bn ? brand.nameBn : brand.name}</span>
    </span>
  )
}
