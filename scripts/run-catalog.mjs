import { ensureMarketplace } from "./seed-catalog.mjs"

ensureMarketplace().catch((error) => {
  console.error(error)
  process.exit(1)
})
