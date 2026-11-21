import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { Noto_Sans_Bengali, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { brand } from "@/theme/brand"
import { getLocale } from "@/lib/auth"
import { Toaster } from "@/components/ui/sonner"

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

/** Body text in Bangla: readable at small sizes on phones. */
const bengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-bengali",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

/** Nikosh, the Bangladesh Government's standard Bangla face, for headings. */
const nikosh = localFont({
  src: "../fonts/Nikosh.woff2",
  variable: "--font-nikosh",
  display: "swap",
  weight: "400",
})

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const bn = locale === "bn"
  const title = bn ? brand.nameBn : brand.name
  const description = bn ? brand.taglineBn : brand.tagline
  return {
    title: { default: title, template: `%s · ${title}` },
    description,
    applicationName: title,
    appleWebApp: { capable: true, title: brand.nameBn, statusBarStyle: "default" },
    openGraph: { title, description, siteName: title, locale: bn ? "bn_BD" : "en_US", type: "website" },
  }
}

export const viewport: Viewport = {
  themeColor: "#1259e8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export const dynamic = "force-dynamic"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  return (
    <html
      lang={locale}
      data-theme={brand.theme}
      className={`${sans.variable} ${bengali.variable} ${nikosh.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
