import { expect, test, type Page } from "@playwright/test"

async function login(page: Page, email: string, password: string) {
  await page.context().clearCookies()
  await page.goto("/login")
  await page.locator("#email").fill(email)
  await page.locator("#password").fill(password)
  await page.locator("button[type=submit]").click()
  await expect(page).not.toHaveURL(/\/login/)
}

test("public home, faq, and contact show Cox's Bazar services", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: /কক্সবাজারের সব সেবা এক জায়গায়|All of Cox/ })).toBeVisible()
  await page.getByRole("button", { name: "EN" }).click()
  await expect(page.getByRole("heading", { name: /All of Cox's Bazar's services in one place/i })).toBeVisible()
  await page.goto("/contact")
  await expect(page.getByRole("link", { name: "WhatsApp", exact: true })).toBeVisible()
  await page.goto("/faq")
  await expect(page.getByRole("heading", { name: /Frequency and questions/i })).toBeVisible()
  await page.goto("/hub")
  await expect(page.getByText("ওয়াইফাই ও ইন্টারনেট").or(page.getByText("WiFi & internet"))).toBeVisible()
})

test("customer, provider, and field worker share a booking chat", async ({ page }) => {
  const note = `Gate code ${Date.now()}`
  await login(page, "customer@needcoxs.test", "customer123")
  await page.goto("/chat/b/SVC-44001")
  await page.locator('input[name="body"]').fill(note)
  await page.getByRole("button", { name: "Send" }).click()
  await expect(page.getByText(note)).toBeVisible()

  await login(page, "wifi@needcoxs.test", "wifi123")
  await page.goto("/vendor/chat/SVC-44001")
  await expect(page.getByText(note)).toBeVisible()
  const reply = `On my way ${Date.now()}`
  await page.locator('input[name="body"]').fill(reply)
  await page.getByRole("button", { name: "Send" }).click()
  await expect(page.getByText(reply)).toBeVisible()

  await login(page, "sumon.wifi@needcoxs.test", "rider123")
  await page.goto("/rider/chat/SVC-44001")
  await expect(page.getByText(reply)).toBeVisible()

  await login(page, "admin@needcoxs.test", "admin123")
  await page.goto("/admin/chats/SVC-44001")
  await expect(page.getByText(note)).toBeVisible()
  await expect(page.getByText(reply)).toBeVisible()
})

test("support ticket is created, answered, and closed", async ({ page }) => {
  const subject = `Router help ${Date.now()}`
  await login(page, "customer@needcoxs.test", "customer123")
  await page.goto("/help/new")
  await page.locator('input[name="subject"]').fill(subject)
  await page.locator('textarea[name="body"]').fill("The corridor router keeps dropping.")
  await page.getByRole("button", { name: /Create ticket|পাঠান/ }).click()
  await expect(page).toHaveURL(/\/help\/TK-/)
  const code = page.url().split("/").pop()!

  await login(page, "admin@needcoxs.test", "admin123")
  await page.goto(`/admin/support/${code}`)
  await expect(page.getByText(subject)).toBeVisible()
  await page.locator('textarea[name="body"]').fill("We will send Sumon this afternoon.")
  await page.getByRole("button", { name: "Close ticket" }).click()
  await expect(page.getByText("CLOSED")).toBeVisible()

  await login(page, "customer@needcoxs.test", "customer123")
  await page.goto(`/help/${code}`)
  await expect(page.getByText("We will send Sumon this afternoon.")).toBeVisible()
})

test("a quote can be declined", async ({ page }) => {
  await login(page, "customer@needcoxs.test", "customer123")
  await page.goto("/hub/c/electrician/house-visit")
  await page.locator('input[name="addressLine"]').fill("Cottage 2, Laboni")
  await page.locator('textarea[name="notes"]').fill("Quote please, then I will decline")
  await page.getByRole("button", { name: /বুক করুন|Request booking/ }).click()
  await expect(page).toHaveURL(/\/hub\/jobs\/SVC-/)
  const code = page.url().split("/").pop()!

  await login(page, "electric@needcoxs.test", "electric123")
  await page.goto(`/vendor/jobs/${code}`)
  await page.locator('input[name="amount"]').fill("2200")
  await page.getByRole("button", { name: "Send quote" }).click()
  await expect(page.getByText("Quoted", { exact: true })).toBeVisible()

  await login(page, "customer@needcoxs.test", "customer123")
  await page.goto(`/hub/jobs/${code}`)
  await page.getByRole("button", { name: /Decline quote|কোট বাতিল/ }).click()
  await expect(page.getByText(/Cancelled|বাতিল/).first()).toBeVisible()
})
