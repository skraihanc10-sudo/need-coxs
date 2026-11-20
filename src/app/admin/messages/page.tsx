import Link from "next/link"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatWhen } from "@/lib/format"

export default async function MessagesPage() {
  await requireUser(["ADMIN"], "/admin/messages")
  const inquiries = await db.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 20 })
  const threads = await db.thread.findMany({
    include: { customer: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  })
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">Messages</h1>
      <div className="mt-4 space-y-2">
        {threads.map((thread) => (
          <Link key={thread.id} href={`/admin/messages/${thread.id}`} className="surface-card block p-3">
            <p className="font-bold">{thread.customer.name}</p>
            <p className="truncate text-sm text-muted-foreground">{thread.messages[0]?.body ?? "No messages yet"}</p>
            <p className="text-xs text-muted-foreground">{formatWhen(thread.updatedAt, "en")}</p>
          </Link>
        ))}
        {!threads.length ? <p className="text-sm text-muted-foreground">No customer chats yet.</p> : null}
      </div>
      <h2 className="mt-8 text-xl font-extrabold">Website inquiries</h2>
      <div className="mt-3 space-y-2">
        {inquiries.map((inquiry) => (
          <article key={inquiry.id} className="surface-card p-3 text-sm">
            <p className="font-bold">{inquiry.name} · {inquiry.topic}</p>
            <p>{inquiry.email} {inquiry.phone}</p>
            <p className="mt-1">{inquiry.message}</p>
          </article>
        ))}
        {!inquiries.length ? <p className="text-sm text-muted-foreground">No website messages yet.</p> : null}
      </div>
    </div>
  )
}
