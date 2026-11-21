/**
 * Captures the main screens at phone (390px) and desktop widths into ./screenshots.
 *   npx tsx scripts/screenshots.ts        (dev server must be running on 47291)
 */
import { chromium, type Page } from "@playwright/test"
import { mkdirSync } from "node:fs"

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:47291"
const OUT = "screenshots"
const CHROME = process.env.CHROME_PATH || "/usr/bin/google-chrome-stable"

async function login(page: Page, email: string, password: string) {
  await page.context().clearCookies()
  await page.goto(`${BASE}/login?tab=staff`)
  await page.fill("#identifier", email)
  await page.fill("#password", password)
  await page.getByRole("button", { name: "লগইন" }).click()
  await page.waitForURL((u) => !u.pathname.startsWith("/login"))
}

async function shot(page: Page, path: string, name: string, full = true) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" })
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full })
  console.log("saved", name)
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ executablePath: CHROME })

  // Phone: customer journey
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, locale: "bn-BD" })
  let page = await phone.newPage()
  await shot(page, "/", "01-home-mobile")
  await shot(page, "/services", "02-services-mobile")
  await shot(page, "/services/electrician", "03-service-electrician-mobile")
  await shot(page, "/book/laundry/wash-iron", "04-booking-step1-mobile", false)
  await page.getByRole("button", { name: "পরের ধাপ" }).click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}/05-booking-step2-mobile.png`, fullPage: true })
  await shot(page, "/help", "06-help-mobile")
  await shot(page, "/login", "07-login-mobile")
  await login(page, "customer@needcoxs.test", "customer123")
  await shot(page, "/bookings", "08-my-bookings-mobile")
  await shot(page, "/bookings/CS-10003", "09-booking-quote-chat-mobile")
  await shot(page, "/care", "10-customer-care-chat-mobile")
  await page.close()

  // Phone: worker app
  page = await phone.newPage()
  await login(page, "jamal.electric@needcoxs.test", "rider123")
  await shot(page, "/worker", "11-worker-jobs-mobile")
  await shot(page, "/worker/jobs/CS-10002", "12-worker-job-detail-mobile")
  await shot(page, "/worker/earnings", "13-worker-earnings-mobile")
  await page.close()
  await phone.close()

  // Desktop: office
  const desk = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "bn-BD" })
  page = await desk.newPage()
  await shot(page, "/", "14-home-desktop", false)
  await login(page, "support@needcoxs.test", "support123")
  await shot(page, "/support", "15-support-inbox-desktop")
  await shot(page, "/support/tickets/TK-10001", "16-support-ticket-desktop")
  await page.close()
  page = await desk.newPage()
  await login(page, "admin@needcoxs.test", "admin123")
  await shot(page, "/admin?p=month", "17-admin-dashboard-desktop")
  await shot(page, "/admin/bookings", "18-admin-bookings-desktop")
  await shot(page, "/admin/bookings/CS-10004", "19-admin-booking-assign-desktop")
  await shot(page, "/admin/workers", "20-admin-workers-desktop")
  await shot(page, "/admin/services", "21-admin-services-desktop", false)
  await shot(page, "/admin/reports?p=month&g=service", "22-admin-reports-desktop")
  await shot(page, "/admin/settings", "23-admin-settings-desktop", false)
  // English toggle check
  await page.goto(`${BASE}/admin`)
  await page.getByRole("button", { name: "EN" }).first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/24-admin-dashboard-english-desktop.png` })
  await page.close()
  await desk.close()
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
