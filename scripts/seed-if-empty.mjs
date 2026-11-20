import { spawnSync } from "node:child_process"
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()
let count = 0
try {
  count = await db.user.count()
} finally {
  await db.$disconnect()
}

if (count > 0) {
  console.log(`Database already has ${count} users; skipping seed`)
  process.exit(0)
}

console.log("Database is empty; seeding demo accounts")
const child = spawnSync(process.execPath, ["prisma/seed.mjs"], {
  stdio: "inherit",
  env: process.env,
})
process.exit(child.status ?? 1)
