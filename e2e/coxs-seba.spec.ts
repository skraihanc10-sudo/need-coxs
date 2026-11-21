import { test, expect, type Page, type Browser } from "@playwright/test"

/**
 * End-to-end flows for Cox's Seba. Run against `npm run dev` with RATE_LIMIT=off
 * and a seeded database (`npm run db:setup`). Demo logins come from the seed.
 */

const ADMIN = { email: "admin@needcoxs.test", password: "admin123" }
const SUPPORT = { email: "support@needcoxs.test", password: "support123" }
const CUSTOMER = { email: "customer@needcoxs.test", password: "customer123" }
const TANIA = { email: "tania@needcoxs.test", password: "demo-01911000001" }
const RIDER = { email: "rider@needcoxs.test", password: "rider123" }
const JAMAL = { email: "jamal.electric@needcoxs.test", password: "rider123" }
const RINA = { email: "rina.clean@needcoxs.test", password: "rider123" }

/** Wait until React has hydrated the first form on the page, so clicks and fills stick. */
async function ready(page: Page) {
  await page.locator('form[data-ready="true"]').first().waitFor({ state: "attached" })
}

async function loginWithPassword(page: Page, who: { email: string; password: string }) {
  await page.goto("/login?tab=staff")
  await ready(page)
  await page.fill("#identifier", who.email)
  await page.fill("#password", who.password)
  await page.getByRole("button", { name: "লগইন" }).click()
  await page.waitForURL((url) => !url.pathname.startsWith("/login"))
}

async function loginWithOtp(page: Page, phone: string, name: string) {
  await page.goto("/login")
  await ready(page)
  await page.fill("#phone", phone)
  await page.getByRole("button", { name: "কোড পাঠান" }).click()
  await expect(page.getByText("ডেমো কোড: 123456")).toBeVisible()
  await page.fill("#code", "123456")
  await page.fill("#name", name)
  await page.getByRole("button", { name: "ঢুকুন" }).click()
  await page.waitForURL((url) => !url.pathname.startsWith("/login"))
}

async function freshPage(browser: Browser) {
  const context = await browser.newContext()
  return context.newPage()
}

/** Walk the 3-step wizard. Returns the booking code from the success URL. */
async function book(page: Page, path: string, opts: { quantity?: number; team?: number; days?: number; notes?: string } = {}) {
  await page.goto(path)
  await expect(page.getByRole("heading", { name: "বুকিং" })).toBeVisible()
  await ready(page)
  if (opts.quantity) await page.locator('input[type="number"]').first().fill(String(opts.quantity))
  if (opts.team) await page.locator('input[type="number"]').nth(1).fill(String(opts.team))
  if (opts.days) await page.locator('input[type="number"]').nth(2).fill(String(opts.days))
  if (opts.notes) await page.fill("#notes", opts.notes)
  await page.getByRole("button", { name: "পরের ধাপ" }).click()
  await page.selectOption("#area", { index: 1 })
  await page.fill("#addressLine", "বাড়ি ১২, রোড ৩")
  await page.fill("#landmark", "মসজিদের পাশে")
  if (!(await page.inputValue("#phone"))) await page.fill("#phone", "01711000001")
  await page.getByRole("button", { name: "08:00–11:00" }).click()
  await page.getByRole("button", { name: "পরের ধাপ" }).click()
  await page.getByRole("button", { name: "বুকিং নিশ্চিত করুন" }).click()
  await page.waitForURL(/\/bookings\/CS-\d{5}/)
  const code = page.url().match(/CS-\d{5}/)![0]
  await expect(page.getByText("বুকিং হয়ে গেছে!")).toBeVisible()
  return code
}

async function assign(page: Page, code: string, workerName: string) {
  await page.goto(`/admin/bookings/${code}`)
  await ready(page)
  const option = page.locator("select[name=workerId] option", { hasText: workerName }).first()
  await page.selectOption("select[name=workerId]", (await option.getAttribute("value"))!)
  await page.getByRole("button", { name: "ঠিক করুন" }).click()
  await expect(page.getByText(workerName).first()).toBeVisible()
  await expect(page.locator(".pill", { hasText: "কর্মী ঠিক হয়েছে" }).first()).toBeVisible()
}

async function press(page: Page, label: string, nextLabel?: string) {
  await ready(page)
  await page.getByRole("button", { name: label, exact: true }).click()
  if (nextLabel) await expect(page.getByRole("button", { name: nextLabel, exact: true })).toBeVisible()
}

test("1. laundry: customer books, admin assigns, rider completes every step, customer reviews", async ({ browser }) => {
  const customer = await freshPage(browser)
  await loginWithOtp(customer, "01799990001", "টেস্ট কাস্টমার")
  const code = await book(customer, "/book/laundry/wash-iron", { quantity: 5 })

  const admin = await freshPage(browser)
  await loginWithPassword(admin, ADMIN)
  await assign(admin, code, "সাইফুল")

  const rider = await freshPage(browser)
  await loginWithPassword(rider, RIDER)
  await rider.goto("/worker")
  await expect(rider.getByText(code)).toBeVisible()
  await rider.goto(`/worker/jobs/${code}`)
  await press(rider, "জব গ্রহণ করুন", "কাপড় নিয়েছি")
  await press(rider, "কাপড় নিয়েছি", "লন্ড্রিতে জমা দিয়েছি")
  await press(rider, "লন্ড্রিতে জমা দিয়েছি", "কাপড় রেডি")
  await press(rider, "কাপড় রেডি", "ডেলিভারিতে যাচ্ছি")
  await press(rider, "ডেলিভারিতে যাচ্ছি", "কাজ শেষ")
  await press(rider, "কাজ শেষ")
  await expect(rider.getByRole("button", { name: "টাকা নেওয়া হয়েছে" })).toBeVisible()
  await rider.getByRole("button", { name: "টাকা নেওয়া হয়েছে" }).click()
  await expect(rider.getByText("পরিশোধিত")).toBeVisible()

  await customer.goto(`/bookings/${code}`)
  await expect(customer.locator(".pill", { hasText: "সম্পন্ন" }).first()).toBeVisible()
  await ready(customer)
  await customer.locator('input[name="rating"][value="5"]').check({ force: true })
  await customer.fill('textarea[name="comment"]', "কাপড় একদম ঝকঝকে, সময়মতো দিয়েছে।")
  await customer.getByRole("button", { name: "রিভিউ দিন" }).click()
  await expect(customer.getByText("আপনার রিভিউ")).toBeVisible()
})

test("2. electrician inspection: quote → customer accepts → work completed", async ({ browser }) => {
  const customer = await freshPage(browser)
  await loginWithPassword(customer, CUSTOMER)
  const code = await book(customer, "/book/electrician/wiring", { notes: "পুরো বাসার ওয়্যারিং পুরনো" })

  const admin = await freshPage(browser)
  await loginWithPassword(admin, ADMIN)
  await assign(admin, code, "জামাল")

  const worker = await freshPage(browser)
  await loginWithPassword(worker, JAMAL)
  await worker.goto(`/worker/jobs/${code}`)
  await press(worker, "জব গ্রহণ করুন", "রওনা দিয়েছি")
  await press(worker, "রওনা দিয়েছি", "পৌঁছেছি")
  await press(worker, "পৌঁছেছি")
  await expect(worker.getByText("আগে দাম পাঠান")).toBeVisible()
  await worker.fill('input[name="amount"]', "1500")
  await worker.fill('input[name="note"]', "২ রুমের তার বদল")
  await worker.getByRole("button", { name: "পাঠান" }).click()
  await expect(worker.getByText("পাঠানো হয়েছে").first()).toBeVisible()

  await customer.goto(`/bookings/${code}`)
  await expect(customer.getByText("দাম এসেছে")).toBeVisible()
  await ready(customer)
  await customer.getByRole("button", { name: "মেনে নিলাম" }).click()
  await expect(customer.getByText("দাম এসেছে")).toHaveCount(0)

  await worker.goto(`/worker/jobs/${code}`)
  await press(worker, "কাজ শুরু", "কাজ শেষ")
  await press(worker, "কাজ শেষ")
  await expect(worker.locator(".pill", { hasText: "সম্পন্ন" }).first()).toBeVisible()
  await expect(worker.getByText(/৳(1,500|১,৫০০)/).first()).toBeVisible()
})

test("3. resort cleaning team booking with rooms, team size and days", async ({ browser }) => {
  const customer = await freshPage(browser)
  await loginWithPassword(customer, CUSTOMER)
  const code = await book(customer, "/book/resort-cleaning/room-turnover", { quantity: 10, team: 4, days: 2 })
  await expect(customer.getByText("10 রুম × 2 দিন · 4 জন")).toBeVisible()

  const admin = await freshPage(browser)
  await loginWithPassword(admin, ADMIN)
  await assign(admin, code, "রিনা")
  const worker = await freshPage(browser)
  await loginWithPassword(worker, RINA)
  await worker.goto("/worker")
  await expect(worker.getByText(code)).toBeVisible()
})

test("4. a booking outside Cox's Bazar Sadar is rejected by the server", async ({ browser }) => {
  const customer = await freshPage(browser)
  await loginWithPassword(customer, CUSTOMER)
  await customer.goto("/book/plumber/tap-basin")
  await ready(customer)
  await customer.getByRole("button", { name: "পরের ধাপ" }).click()
  // Nothing chosen: the wizard explains the Sadar rule before even submitting.
  await customer.getByRole("button", { name: "পরের ধাপ" }).click()
  await expect(customer.getByText("শুধু কক্সবাজার সদরে")).toBeVisible()
  // Now force an area that is not ours and let the server decide.
  await customer.selectOption("#area", { index: 1 })
  await customer.fill("#addressLine", "চকরিয়া বাজার")
  await customer.getByRole("button", { name: "08:00–11:00" }).click()
  await customer.getByRole("button", { name: "পরের ধাপ" }).click()
  await customer.evaluate(() => {
    const input = document.querySelector<HTMLInputElement>('input[name="areaId"]')
    if (input) input.value = "teknaf-not-sadar"
  })
  await customer.getByRole("button", { name: "বুকিং নিশ্চিত করুন" }).click()
  await expect(customer.getByText("এই মুহূর্তে আমরা শুধু কক্সবাজার সদরে সেবা দিচ্ছি").first()).toBeVisible()
  expect(customer.url()).toContain("/book/")
})

test("5. customer care chat and a support ticket, both answered by support", async ({ browser }) => {
  const customer = await freshPage(browser)
  await loginWithPassword(customer, CUSTOMER)
  await customer.goto("/care")
  await ready(customer)
  const question = `খুরুশকুলে কি আজ প্লাম্বার পাওয়া যাবে? ${Date.now()}`
  await customer.fill('textarea[name="body"]', question)
  await customer.getByRole("button", { name: "Send" }).click()
  await expect(customer.getByText(question)).toBeVisible()

  const support = await freshPage(browser)
  await loginWithPassword(support, SUPPORT)
  await support.goto("/support")
  await support.getByRole("link", { name: /^রাশেদ আহমেদ/ }).first().click()
  await expect(support.getByText(question)).toBeVisible()
  await ready(support)
  await support.getByRole("button", { name: "স্বাগতম" }).click()
  await support.getByRole("button", { name: "Send" }).click()
  await expect(support.getByText("কক্স সেবা-তে যোগাযোগের জন্য ধন্যবাদ").first()).toBeVisible()
  await customer.goto("/care")
  await expect(customer.getByText("কক্স সেবা-তে যোগাযোগের জন্য ধন্যবাদ").first()).toBeVisible()

  await customer.goto("/help/tickets/new")
  await ready(customer)
  await customer.selectOption("#category", "REFUND")
  await customer.fill("#subject", "ভুল চার্জ কাটা হয়েছে")
  await customer.fill("#body", "গত সপ্তাহের লন্ড্রিতে ভিজিট চার্জ দুবার ধরা হয়েছে।")
  await customer.getByRole("button", { name: "টিকেট পাঠান" }).click()
  await customer.waitForURL(/\/help\/tickets\/TK-\d{5}/)
  const ticket = customer.url().match(/TK-\d{5}/)![0]

  await support.goto(`/support/tickets/${ticket}`)
  await expect(support.getByText("ভিজিট চার্জ দুবার")).toBeVisible()
  await ready(support)
  await support.fill('textarea[name="body"]', "দুঃখিত! বাড়তি টাকা বিকাশে ফেরত দিচ্ছি।")
  await support.getByRole("button", { name: "Send" }).click()
  await support.selectOption('select[name="status"]', "RESOLVED")
  await support.getByRole("button", { name: "সেভ" }).click()
  await customer.goto(`/help/tickets/${ticket}`)
  await expect(customer.getByText("বাড়তি টাকা বিকাশে ফেরত").first()).toBeVisible()
  await expect(customer.getByText("সমাধান হয়েছে")).toBeVisible()
})

test("6. a customer cannot open someone else's booking, and panels need the right role", async ({ browser }) => {
  const tania = await freshPage(browser)
  await loginWithPassword(tania, TANIA)
  const res = await tania.goto("/bookings/CS-10001")
  expect(res?.status()).toBe(404)
  await expect(tania.getByText("পেজটা পাওয়া যায়নি")).toBeVisible()
  await tania.goto("/admin")
  await expect(tania).toHaveURL(/\/$|\/login/)
  await tania.goto("/worker")
  await expect(tania).not.toHaveURL(/\/worker/)

  const anon = await freshPage(browser)
  await anon.goto("/support")
  await expect(anon).toHaveURL(/\/login\?next=%2Fsupport/)
})
