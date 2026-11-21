/**
 * A problem the user can fix. `message` is Bangla (the default language);
 * `en` is shown when the page is in English.
 */
export class AppError extends Error {
  en: string
  constructor(bn: string, en?: string) {
    super(bn)
    this.en = en ?? bn
  }
}

export function errorText(error: unknown, locale: "bn" | "en" = "bn") {
  if (error instanceof AppError) return locale === "en" ? error.en : error.message
  return locale === "en"
    ? "Something went wrong. Please try again, or call our helpline."
    : "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন, না হলে হেল্পলাইনে কল দিন।"
}
