import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "e2e",
  timeout: 60000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:47291",
    launchOptions: { executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome-stable" },
    ...devices["Desktop Chrome"],
  },
})
