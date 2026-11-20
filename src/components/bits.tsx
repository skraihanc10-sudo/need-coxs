import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { statusLabel, statusTone } from "@/lib/status"
import { taka, type Locale } from "@/lib/format"

export function PageHeader({ title, back }: { title: string; back?: string }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center bg-white/95 px-2 backdrop-blur">
      {back ? (
        <Link href={back} className="grid size-10 place-items-center rounded-full hover:bg-muted" aria-label="Back">
          <ChevronLeft />
        </Link>
      ) : (
        <span className="size-10" />
      )}
      <h1 className="flex-1 pr-10 text-center text-base font-bold">{title}</h1>
    </header>
  )
}

export function StatusPill({ status, locale }: { status: string; locale: Locale }) {
  return <Badge className={`h-6 ${statusTone(status)}`}>{statusLabel(status, locale)}</Badge>
}

export function Money({ value, locale }: { value: number; locale: Locale }) {
  return <span className="price">{taka(value, locale)}</span>
}

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mx-4 mb-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p>
}

export function EmptyState({ title, body, href, action }: { title: string; body: string; href?: string; action?: string }) {
  return (
    <div className="surface-card mx-4 px-4 py-10 text-center">
      <p className="font-bold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      {href && action ? (
        <Link href={href} className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground">
          {action}
        </Link>
      ) : null}
    </div>
  )
}
