"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Mail, MapPin, Menu, Phone, X } from "lucide-react"
import { brand } from "@/theme/brand"
import { setLocale } from "@/actions/auth"
import { subscribe } from "@/actions/site"

const LINKS = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Blog", "/blog"],
  ["Shop", "/shop"],
  ["Contact", "/contact"],
]

export function SiteHeader({ phone }: { phone: string }) {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="site-wrap flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid size-11 place-items-center rounded-full text-white" style={{ background: "var(--pub-green)" }}>
            <svg viewBox="0 0 32 32" className="size-6" aria-hidden>
              <path d="M8 14h16v3H8zM10 18h12l-1 8H11z" fill="white" />
            </svg>
          </span>
          <span>
            <span className="block text-xl leading-none" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>{brand.name}</span>
            <span className="text-[10px] tracking-[0.16em] text-[var(--pub-muted)]">COX&apos;S BAZAR</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold lg:flex">
          {LINKS.map(([label, href]) => (
            <Link key={href} href={href} className={path === href ? "text-[var(--pub-green)]" : "text-[var(--pub-ink)]"}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <form action={setLocale} className="hidden text-xs font-bold sm:flex">
            <input type="hidden" name="back" value={path} />
            <button name="locale" value="en" className="px-1">EN</button>
            <button name="locale" value="bn" className="px-1">বাং</button>
          </form>
          <Link href="/hub" className="hidden items-center gap-2 sm:flex">
            <span className="grid size-12 place-items-center rounded-full text-white" style={{ background: "var(--pub-green)" }}>
              <Phone className="size-5" />
            </span>
            <span className="text-xs font-extrabold leading-tight tracking-wide">BOOK<br />NOW</span>
          </Link>
          <button className="grid size-10 place-items-center lg:hidden" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="site-wrap grid gap-1 pb-4 lg:hidden">
          {LINKS.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="py-2 font-semibold">{label}</Link>
          ))}
          <Link href="/hub" className="pub-btn mt-2" onClick={() => setOpen(false)}>Book now</Link>
        </nav>
      ) : null}
      <span className="sr-only">{phone}</span>
    </header>
  )
}

export function SiteFooter({ phone, email }: { phone: string; email: string }) {
  return (
    <footer style={{ background: "var(--pub-navy)", color: "white" }}>
      <div className="site-wrap grid gap-8 py-12 md:grid-cols-4">
        <div>
          <p className="text-sm font-bold tracking-widest text-[var(--pub-green)]">CONTACT US</p>
          <p className="mt-4 flex gap-2 text-sm text-white/80"><Phone className="size-4 text-[var(--pub-green)]" /> {phone}</p>
          <p className="mt-2 flex gap-2 text-sm text-white/80"><MapPin className="size-4 text-[var(--pub-green)]" /> {brand.address}</p>
          <p className="mt-2 flex gap-2 text-sm text-white/80"><Mail className="size-4 text-[var(--pub-green)]" /> {email}</p>
        </div>
        <div>
          <p className="text-sm font-bold tracking-widest">PRODUCTS</p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li><Link href="/services/wash-fold">Wash & fold</Link></li>
            <li><Link href="/services/dry-cleaning">Dry cleaning</Link></li>
            <li><Link href="/services/iron">Iron only</Link></li>
            <li><Link href="/shop">Shop</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold tracking-widest">CATEGORIES</p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li><Link href="/c/wash">Wash</Link></li>
            <li><Link href="/c/dry">Dry clean</Link></li>
            <li><Link href="/c/iron">Iron</Link></li>
            <li><Link href="/stores">Laundries</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm text-[var(--pub-green)]">Our newsletter</p>
          <p className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>SUBSCRIBE NOW !</p>
          <form action={subscribe} className="mt-4 flex">
            <input name="email" type="email" required placeholder="Enter your email..." className="h-12 flex-1 bg-white/10 px-3 text-sm outline-none" />
            <button className="grid size-12 place-items-center text-white" style={{ background: "var(--pub-green)" }} aria-label="Subscribe">→</button>
          </form>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-white/50">© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
    </footer>
  )
}

export function PageBanner({ title, crumbs }: { title: string; crumbs: string[] }) {
  return (
    <section style={{ background: "var(--pub-navy)", color: "white" }}>
      <div className="site-wrap py-14">
        <p className="text-sm text-white/70">
          <Link href="/">Home</Link>
          {crumbs.map((crumb) => (
            <span key={crumb}> → <span className="text-[var(--pub-green)]">{crumb}</span></span>
          ))}
        </p>
        <h1 className="mt-3 text-5xl">{title}</h1>
      </div>
    </section>
  )
}

export function Partners() {
  const names = ["Chandni Wash", "Press Room", "Banani Apron", "Soak Studio", "Linen House"]
  return (
    <div className="site-wrap flex flex-wrap items-center justify-center gap-8 py-10 text-sm font-extrabold tracking-wide text-[#9aa7ae]">
      {names.map((name) => (
        <span key={name}>{name}</span>
      ))}
    </div>
  )
}
