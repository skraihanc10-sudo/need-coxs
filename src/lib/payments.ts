export type ProviderId = "COD" | "BKASH" | "SSLCOMMERZ" | "STRIPE"

export const providers: {
  id: ProviderId
  label: string
  labelBn: string
  setting: string
  env: string[]
  hint: string
}[] = [
  {
    id: "COD",
    label: "Cash on delivery",
    labelBn: "ক্যাশ অন ডেলিভারি",
    setting: "payCod",
    env: [],
    hint: "Pay the rider when the clothes come back.",
  },
  {
    id: "BKASH",
    label: "bKash",
    labelBn: "বিকাশ",
    setting: "payBkash",
    env: ["BKASH_APP_KEY", "BKASH_APP_SECRET", "BKASH_USERNAME", "BKASH_PASSWORD"],
    hint: "Tokenized bKash checkout. Add the merchant keys to turn it on.",
  },
  {
    id: "SSLCOMMERZ",
    label: "SSLCommerz",
    labelBn: "এসএসএলকমার্জ",
    setting: "paySsl",
    env: ["SSLCOMMERZ_STORE_ID", "SSLCOMMERZ_STORE_PASSWORD"],
    hint: "Cards, mobile banking, and net banking through SSLCommerz.",
  },
  {
    id: "STRIPE",
    label: "Card (Stripe)",
    labelBn: "কার্ড (স্ট্রাইপ)",
    setting: "payStripe",
    env: ["STRIPE_SECRET_KEY"],
    hint: "Stripe Checkout session. Add the secret key to turn it on.",
  },
]

export function providerView(id: string, settings: Record<string, string>) {
  const provider = providers.find((item) => item.id === id) ?? providers[0]
  const enabled = settings[provider.setting] !== "0"
  const missing = provider.env.filter((key) => !process.env[key])
  const configured = missing.length === 0
  return { ...provider, enabled, configured, missing }
}
