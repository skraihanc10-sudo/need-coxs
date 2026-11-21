import { ImageResponse } from "next/og"

export const dynamic = "force-dynamic"

/** PWA icon at any size: a rounded blue tile with the Cox's Seba mark. */
export async function GET(request: Request) {
  const size = Math.min(1024, Math.max(64, Number(new URL(request.url).searchParams.get("size")) || 512))
  return new ImageResponse(
    (
      <div style={{ width: size, height: size, background: "#1259e8", borderRadius: size * 0.22, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 48 48">
          <path d="M14 23l10-9 10 9" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 23v-4h10v4" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M10 31c3-3 6-3 9 0s6 3 9 0 6-3 9 0" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  )
}
