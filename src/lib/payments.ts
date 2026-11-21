/**
 * Payment providers. Today every method only records the payment: the worker
 * collects cash, or the customer sends bKash/Nagad and we note the reference.
 * A real gateway implements `startCheckout` and `verify`; nothing else changes.
 */
export type PaymentMethod = "CASH" | "BKASH" | "NAGAD"

export interface PaymentProvider {
  id: PaymentMethod
  labelBn: string
  label: string
  hintBn: string
  hint: string
  /** Env keys a live gateway needs. Empty for cash. */
  env: string[]
  /** Settings key that turns the method on or off. */
  setting: string
  /** Live gateways return a URL to send the customer to. Record-only providers return null. */
  startCheckout?(input: { bookingCode: string; amount: number }): Promise<string | null>
}

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    id: "CASH",
    labelBn: "ক্যাশ",
    label: "Cash",
    hintBn: "কাজ শেষে কর্মীর হাতে টাকা দিন।",
    hint: "Pay the worker when the job is done.",
    env: [],
    setting: "payCash",
  },
  {
    id: "BKASH",
    labelBn: "বিকাশ",
    label: "bKash",
    hintBn: "কাজ শেষে আমাদের বিকাশ নম্বরে পাঠান। পরে অনলাইন পেমেন্ট চালু হবে।",
    hint: "Send to our bKash number after the job. Online checkout comes later.",
    env: ["BKASH_APP_KEY", "BKASH_APP_SECRET", "BKASH_USERNAME", "BKASH_PASSWORD"],
    setting: "payBkash",
  },
  {
    id: "NAGAD",
    labelBn: "নগদ",
    label: "Nagad",
    hintBn: "কাজ শেষে আমাদের নগদ নম্বরে পাঠান। পরে অনলাইন পেমেন্ট চালু হবে।",
    hint: "Send to our Nagad number after the job. Online checkout comes later.",
    env: ["NAGAD_MERCHANT_ID", "NAGAD_PUBLIC_KEY", "NAGAD_PRIVATE_KEY"],
    setting: "payNagad",
  },
]

export function paymentProvider(id: string) {
  return PAYMENT_PROVIDERS.find((p) => p.id === id)
}

export function enabledProviders(settings: Record<string, string>) {
  return PAYMENT_PROVIDERS.filter((p) => settings[p.setting] !== "0")
}

export function gatewayReady(provider: PaymentProvider) {
  return provider.env.every((key) => Boolean(process.env[key]))
}
