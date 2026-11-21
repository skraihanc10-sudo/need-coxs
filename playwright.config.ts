import { defineConfig, devices } from "@playwright/test"

/**
 * Runs against a dev server you start yourself:
 *   RATE_LIMIT=off npm run dev     (Windows PowerShell: $env:RATE_LIMIT="off"; npm run dev)
 * Chrome: set CHROME_PATH if it is not on the default Linux path.
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 150_000,
  expect: { timeout: 25_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:47291",
    launchOptions: { executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome-stable" },
    ...devices["Desktop Chrome"],
    locale: "bn-BD",
    trace: "retain-on-failure",
  },
})
