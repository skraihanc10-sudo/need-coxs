/**
 * SMS sending sits behind one small interface. Today the demo provider only
 * logs, and the OTP is the fixed demo code. To go live, add a provider (for
 * example SSL Wireless, BulkSMSBD or Twilio) that implements `send`, and pick
 * it with SMS_PROVIDER plus that provider's keys in the environment.
 */
export interface SmsProvider {
  id: string
  /** True when this provider really delivers messages. */
  live: boolean
  send(to: string, text: string): Promise<void>
}

const demo: SmsProvider = {
  id: "demo",
  live: false,
  async send(to, text) {
    if (process.env.NODE_ENV !== "production") console.info(`[sms:demo] to ${to}: ${text}`)
  },
}

const providers: Record<string, SmsProvider> = { demo }

export function smsProvider(): SmsProvider {
  return providers[process.env.SMS_PROVIDER ?? "demo"] ?? demo
}
