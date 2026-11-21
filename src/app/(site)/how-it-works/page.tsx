import Link from "next/link"
import { getLocale } from "@/lib/auth"
import { pick } from "@/lib/i18n"
import { PageHeader } from "@/components/bits"

export default async function HowItWorksPage() {
  const locale = await getLocale()
  const steps = [
    [pick(locale, "১. সেবা বেছে নিন", "1. Pick a service"), pick(locale, "লন্ড্রি, ইলেকট্রিশিয়ান, প্লাম্বার, ক্লিনিং, এসি, শিফটিং বা যেকোনো ছোট কাজ। বেশিরভাগ সেবার দাম আগেই লেখা থাকে, আর অপশন বাছার সাথে সাথে আনুমানিক দাম দেখবেন।", "Laundry, electrician, plumber, cleaning, AC, moving or any small job. Most prices are listed, and the estimate updates as you choose options.")],
    [pick(locale, "২. ঠিকানা আর সময় দিন", "2. Add address and time"), pick(locale, "কক্সবাজার সদরের এলাকা, বাড়ির ঠিকানা আর একটা ২–৩ ঘণ্টার স্লট বেছে নিন। লগইন লাগে না: মোবাইল নম্বরে একটা কোড আসবে, সেটা দিলেই বুকিং হয়ে যাবে।", "Choose your Sadar area, address and a 2–3 hour slot. No login needed: we text a code to your mobile and the booking is done.")],
    [pick(locale, "৩. কর্মী আসবেন, কাজ হবে", "3. The worker comes and does the job"), pick(locale, "অফিস থেকে একজন যাচাই করা কর্মী ঠিক করা হয়। অ্যাপে দেখবেন কর্মীর নাম, ছবি আর ফোন, আর তিনি কখন রওনা দিলেন ও পৌঁছালেন। যেসব কাজে আগে দেখা দরকার, কর্মী দেখে দাম পাঠাবেন; আপনি মানলে তবেই কাজ শুরু।", "The office assigns a verified worker. You see their name, photo and phone, and when they leave and arrive. For inspection jobs the worker sends a quote first; work starts only when you accept.")],
    [pick(locale, "৪. কাজ শেষে টাকা দিন", "4. Pay when it's done"), pick(locale, "ক্যাশ, বিকাশ বা নগদ। তারপর রেটিং দিয়ে জানান কেমন লাগল, এতে আমাদের টিম ভালো হয়।", "Cash, bKash or Nagad. Then rate the job so our team keeps improving.")],
  ]
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader back="/" title={pick(locale, "কীভাবে কাজ করে", "How it works")} />
      <div className="space-y-3">
        {steps.map(([title, body]) => (
          <section key={title} className="card p-5">
            <h2 className="display text-lg font-extrabold text-ink">{title}</h2>
            <p className="mt-2 text-[15px] text-muted-foreground">{body}</p>
          </section>
        ))}
      </div>
      <Link href="/services" className="btn-primary mt-6 w-full">{pick(locale, "সেবা দেখুন", "See services")}</Link>
    </div>
  )
}
