import type { Metadata } from "next"
import { Noto_Sans_Bengali, Open_Sans, Plus_Jakarta_Sans, Rajdhani } from "next/font/google"
import "./globals.css"
import { brand } from "@/theme/brand"
import { getLocale } from "@/lib/auth"

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
})

const bengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-bengali",
  weight: ["400", "500", "600", "700"],
})

const display = Rajdhani({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700"],
})

const open = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open",
  weight: ["400", "600", "700"],
})

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const bn = locale === "bn"
  const title = bn ? brand.nameBn : brand.name
  const description = bn ? brand.taglineBn : brand.tagline
  return {
    title: { default: title, template: `%s · ${title}` },
    description,
    openGraph: {
      title,
      description,
      siteName: title,
      locale: bn ? "bn_BD" : "en_US",
      type: "website",
    },
  }
}

export const dynamic = "force-dynamic"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  return (
    <html
      lang={locale === "bn" ? "bn" : "en"}
      data-theme={brand.theme}
      className={`${sans.variable} ${bengali.variable} ${display.variable} ${open.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  )
}
