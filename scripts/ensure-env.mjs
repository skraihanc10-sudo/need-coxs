import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const db = path.join(root, "prisma", "dev.db")
const secret =
  process.env.AUTH_SECRET || "need-coxs-dev-secret-change-in-production"
const body = [
  `DATABASE_URL="file:${db}"`,
  `AUTH_SECRET="${secret}"`,
  "",
].join("\n")

if (!fs.existsSync(".env")) {
  fs.writeFileSync(".env", body)
  console.log("Wrote .env")
} else {
  const current = fs.readFileSync(".env", "utf8")
  if (!current.includes("DATABASE_URL")) {
    fs.appendFileSync(".env", `\n${body}`)
  }
}
