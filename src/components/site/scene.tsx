export function LaundryScene() {
  return (
    <svg viewBox="0 0 420 360" className="w-full max-w-md" aria-hidden>
      <rect x="20" y="40" width="250" height="280" rx="28" fill="white" opacity="0.12" />
      <rect x="150" y="24" width="240" height="300" rx="32" fill="white" />
      <rect x="174" y="58" width="192" height="120" rx="18" fill="var(--brand)" />
      <circle cx="270" cy="118" r="36" fill="var(--accent)" />
      <circle cx="270" cy="118" r="16" fill="white" />
      <rect x="174" y="196" width="90" height="78" rx="14" fill="color-mix(in srgb, var(--brand) 12%, white)" />
      <rect x="276" y="196" width="90" height="78" rx="14" fill="color-mix(in srgb, var(--accent) 30%, white)" />
      <path d="M196 228h48M196 244h36M298 228h48M298 244h28" stroke="var(--brand)" strokeWidth="6" strokeLinecap="round" />
      <rect x="48" y="210" width="90" height="70" rx="16" fill="var(--accent)" />
      <path d="M66 238h54M66 254h36" stroke="white" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}
