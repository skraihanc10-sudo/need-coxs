import { Check } from "lucide-react"
import { stepsFor, statusText, type Flow } from "@/lib/booking-flow"
import { formatWhen, type Locale } from "@/lib/format"
import { ROLE_LABEL } from "@/lib/roles"

type Event = { id: string; toStatus: string; note: string; createdAt: Date; actorRole: string; actor: { name: string; role: string } | null }

/** The live status timeline on a booking: steps of its flow, then the raw history. */
export function Timeline({ flow, status, events, locale, showHistory = true }: { flow: Flow; status: string; events: Event[]; locale: Locale; showHistory?: boolean }) {
  const steps = stepsFor(flow).filter((s) => s !== "CONFIRMED" || status === "CONFIRMED")
  const cancelled = status === "CANCELLED"
  const reached = new Set(events.map((e) => e.toStatus))
  const current = steps.indexOf(status)
  return (
    <div>
      <ol className="relative ml-3 border-l-2 border-line">
        {steps.map((s, i) => {
          const done = i < current || status === "COMPLETED" || (reached.has(s) && !cancelled && i <= current)
          const now = s === status
          const when = events.filter((e) => e.toStatus === s).at(-1)
          return (
            <li key={s} className="relative pb-4 pl-6 last:pb-0">
              <span className={`absolute top-0.5 -left-[11px] grid size-5 place-items-center rounded-full ring-4 ring-canvas ${done ? "bg-ok text-white" : now ? "bg-brand text-white" : "bg-line"}`}>
                {done ? <Check className="size-3" /> : now ? <span className="size-2 rounded-full bg-white" /> : null}
              </span>
              <p className={`text-[15px] font-bold ${done || now ? "text-ink" : "text-muted-foreground"}`}>{statusText(s, locale)}</p>
              {when ? <p className="text-xs text-muted-foreground">{formatWhen(when.createdAt, locale)}</p> : null}
            </li>
          )
        })}
        {cancelled ? (
          <li className="relative pl-6">
            <span className="absolute top-0.5 -left-[11px] grid size-5 place-items-center rounded-full bg-danger text-white ring-4 ring-canvas">×</span>
            <p className="text-[15px] font-bold text-danger">{statusText("CANCELLED", locale)}</p>
          </li>
        ) : null}
      </ol>
      {showHistory && events.length ? (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs font-bold text-muted-foreground">{locale === "bn" ? "পুরো ইতিহাস" : "Full history"}</summary>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            {events.map((e) => (
              <li key={e.id}>
                <span className="font-bold text-ink">{statusText(e.toStatus, locale)}</span>
                {e.note ? ` — ${e.note}` : ""} · {e.actor?.name ?? "—"} ({ROLE_LABEL[e.actorRole]?.[locale] ?? e.actorRole}) · {formatWhen(e.createdAt, locale)}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  )
}
