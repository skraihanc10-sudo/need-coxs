import { db } from "./db"

export type NoticeInput = {
  kind?: string
  title: string
  body: string
  link?: string
}

/** In-app notification. Email/SMS/push can hang off this later. */
export async function notify(userIds: Array<string | null | undefined>, notice: NoticeInput, except?: string) {
  const ids = [...new Set(userIds.filter((id): id is string => Boolean(id) && id !== except))]
  if (!ids.length) return
  await db.notice.createMany({
    data: ids.map((userId) => ({
      userId,
      kind: notice.kind ?? "INFO",
      title: notice.title,
      body: notice.body,
      link: notice.link ?? "",
    })),
  })
}

/** Everyone in the office who should hear about support events. */
export async function officeIds() {
  const rows = await db.user.findMany({ where: { role: { in: ["ADMIN", "SUPPORT"] }, active: true }, select: { id: true } })
  return rows.map((r) => r.id)
}

export async function unreadNotices(userId: string) {
  return db.notice.count({ where: { userId, read: false } })
}
