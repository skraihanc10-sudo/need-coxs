"use client"

import { brand } from "@/theme/brand"

export default function ErrorScreen({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <p className="font-extrabold">{brand.name}</p>
      <h1 className="mt-2 text-2xl font-extrabold">Something went wrong</h1>
      <button onClick={reset} className="mt-6 h-12 rounded-full bg-primary px-5 font-bold text-primary-foreground">Try again</button>
    </div>
  )
}
