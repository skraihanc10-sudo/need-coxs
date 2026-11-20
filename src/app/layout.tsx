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

export const metadata: Metadata = {
  title: { default: brand.name, template: `%s · ${brand.name}` },
  description: "Doorstep laundry from neighbourhood wash houses in Dhaka. Compare prices, book a pickup, and pay cash on delivery.",
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
