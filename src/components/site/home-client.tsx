"use client"

import Link from "next/link"
import { useState } from "react"
import { brand } from "@/theme/brand"

const slides = [
  {
    image: "/marketing/hero-laundry.jpg",
    kicker: "Dhaka doorstep laundry",
    title: "Need Cox's cleaning & laundry services.",
    titleBn: "Need Cox's পরিষ্কার কাপড়, দরজায়।",
  },
  {
    image: "/marketing/svc-fold.jpg",
    kicker: "Price the cloth first",
    title: "Wash, press, or dry-clean. You pick.",
    titleBn: "ধোয়া, ইস্ত্রি, বা ড্রাই-ক্লিন।",
  },
]

export function HeroSlider({ bn }: { bn: boolean }) {
  const [i, setI] = useState(0)
  const slide = slides[i]
  return (
    <section className="relative min-h-[560px] overflow-hidden text-white">
      <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#12323d]/85 via-[#12323d]/55 to-[#12323d]/20" />
      <div className="site-wrap relative grid min-h-[560px] items-center py-16 md:grid-cols-[1.1fr_0.9fr]">
        <div className="reveal">
          <p className="text-sm font-bold tracking-[0.2em] text-[var(--pub-green)]">{slide.kicker}</p>
          <h1 className="mt-3 max-w-xl text-5xl leading-[0.95] md:text-7xl">{bn ? slide.titleBn : slide.title}</h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/about" className="pub-btn">Learn more</Link>
            <Link href="/services" className="pub-btn ghost">Our services</Link>
          </div>
        </div>
        <Link href="/offers" className="absolute top-10 right-4 grid size-28 place-items-center rounded-full bg-[var(--pub-yellow)] text-center text-xs font-extrabold text-[var(--pub-ink)] shadow-lg md:right-10">
          ৳100 OFF
          <br />THIS MONTH
        </Link>
      </div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button key={index} aria-label={`Slide ${index + 1}`} onClick={() => setI(index)} className="size-2.5 rounded-full" style={{ background: index === i ? "var(--pub-green)" : "white" }} />
        ))}
      </div>
      <p className="sr-only">{brand.name}</p>
    </section>
  )
}

export function QuoteSlider({ quotes }: { quotes: { name: string; text: string; meta: string }[] }) {
  const [i, setI] = useState(0)
  const quote = quotes[i] ?? quotes[0]
  if (!quote) return null
  return (
    <div className="mx-auto max-w-3xl rounded-[28px] bg-[#f4f7f8] p-8 md:p-12">
      <p className="text-6xl leading-none text-[var(--pub-yellow)]">“</p>
      <h3 className="text-2xl normal-case">{quote.name}</h3>
      <p className="text-xs text-[var(--pub-muted)]">{quote.meta}</p>
      <p className="mt-4 text-sm leading-7">{quote.text}</p>
      <div className="mt-6 flex gap-2">
        <button className="grid size-9 place-items-center text-white" style={{ background: "var(--pub-green)" }} onClick={() => setI((i + quotes.length - 1) % quotes.length)} aria-label="Previous">←</button>
        <button className="grid size-9 place-items-center text-white" style={{ background: "var(--pub-green)" }} onClick={() => setI((i + 1) % quotes.length)} aria-label="Next">→</button>
      </div>
    </div>
  )
}
