"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, Phone, Mail, MapPin } from "lucide-react"
import { Logo } from "@/components/logo"
import { brand } from "@/theme/brand"
import { setLocale } from "@/actions/auth"

const LINKS = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Pricing", "/pricing"],
  ["How it works", "/how-it-works"],
  ["Stories", "/testimonials"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
]

export function SiteHeader({ phone, email }: { phone: string; email: string }) {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="site-top">
        <div className="site-wrap flex flex-wrap items-center justify-between gap-2 py-2">
          <p className="inline-flex items-center gap-2">
            <MapPin className="size-3.5 text-[var(--accent)]" />
            {brand.address}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a className="inline-flex items-center gap-1" href={`tel:${phone}`}><Phone className="size-3.5 text-[var(--accent)]" />{phone}</a>
            <a className="inline-flex items-center gap-1" href={`mailto:${email}`}><Mail className="size-3.5 text-[var(--accent)]" />{email}</a>
            <form action={setLocale} className="flex gap-1">
              <input type="hidden" name="back" value={path} />
              <button name="locale" value="en" className="rounded-full px-2 font-bold">EN</button>
              <button name="locale" value="bn" className="rounded-full px-2 font-bold">বাং</button>
            </form>
          </div>
        </div>
      </div>
      <div className="site-wrap flex items-center justify-between gap-4 py-3">
        <Link href="/" aria-label={brand.name}><Logo /></Link>
        <nav className="hidden items-center gap-5 text-sm font-semibold lg:flex">
          {LINKS.map(([label, href]) => (
            <Link key={href} href={href} data-on={path === href} className="text-[var(--brand-ink)] data-[on=true]:text-[var(--brand)]">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/app" className="hidden h-11 items-center rounded-full bg-primary px-4 text-sm font-extrabold text-primary-foreground sm:inline-flex">
            Book a pickup
          </Link>
          <button className="grid size-11 place-items-center rounded-full border lg:hidden" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="site-wrap grid gap-1 pb-4 lg:hidden">
          {LINKS.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-semibold hover:bg-muted">
              {label}
            </Link>
          ))}
          <Link href="/app" onClick={() => setOpen(false)} className="mt-1 flex h-11 items-center justify-center rounded-full bg-primary font-extrabold text-primary-foreground">
            Book a pickup
          </Link>
        </nav>
      ) : null}
    </header>
  )
}

export function SiteFooter({ phone, email }: { phone: string; email: string }) {
  return (
    <footer className="bg-[var(--brand-ink)] text-white">
      <div className="site-wrap grid gap-8 py-12 md:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-3 text-sm leading-6 text-white/70">
            {brand.name} sends a rider from a neighbourhood laundry in Dhaka. You see the price before the bag leaves the house.
          </p>
        </div>
        <div>
          <p className="font-extrabold">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            {LINKS.slice(1).map(([label, href]) => (
              <li key={href}><Link href={href}>{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-extrabold">For laundries</p>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li><Link href="/partner">List your shop</Link></li>
            <li><Link href="/login">Laundry sign in</Link></li>
            <li><Link href="/login">Rider sign in</Link></li>
            <li><Link href="/terms">Terms</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-extrabold">Desk</p>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li>{brand.address}</li>
            <li><a href={`tel:${phone}`}>{phone}</a></li>
            <li><a href={`mailto:${email}`}>{email}</a></li>
            <li>Open 8:00–21:00, every day</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} {brand.name}. Dhaka laundry, booked at the door.
      </div>
    </footer>
  )
}

export function PageBanner({ title, crumb }: { title: string; crumb: string }) {
  return (
    <section className="site-hero">
      <div className="site-wrap py-16 text-center">
        <p className="text-sm text-white/70">Home / {crumb}</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">{title}</h1>
      </div>
    </section>
  )
}
