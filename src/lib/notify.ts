import { db } from "./db"
import { getSettings } from "./settings"

export async function notify(userId: string | null | undefined, title: string, body: string) {
  if (!userId) return
  const settings = await getSettings()
  const rows = [
    { channel: "IN_APP", status: settings.notifyInApp === "1" ? "SENT" : "SKIPPED" },
    { channel: "EMAIL", status: settings.notifyEmail === "1" ? "QUEUED" : "SKIPPED" },
    { channel: "SMS", status: settings.notifySms === "1" ? "QUEUED" : "SKIPPED" },
    { channel: "PUSH", status: settings.notifyPush === "1" ? "QUEUED" : "SKIPPED" },
  ]
  await db.notice.createMany({
    data: rows.map((row) => ({
      userId,
      channel: row.channel,
      title,
      body,
      status: row.status,
    })),
  })
}
