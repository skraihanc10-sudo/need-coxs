/** Demo sign-ins. The seed script and the login screen both read this list. */
export const demoAccounts = [
  { role: "CUSTOMER", label: "কাস্টমার", email: "customer@needcoxs.test", password: "customer123", name: "রাশেদ আহমেদ", phone: "01711000001" },
  { role: "ADMIN", label: "অ্যাডমিন", email: "admin@needcoxs.test", password: "admin123", name: "কক্স সেবা অ্যাডমিন", phone: "01711000002" },
  { role: "SUPPORT", label: "সাপোর্ট", email: "support@needcoxs.test", password: "support123", name: "নুসরাত (কাস্টমার কেয়ার)", phone: "01711000003" },
] as const

/** Our field team. Every worker signs in with the same demo password. */
export const WORKER_PASSWORD = "rider123"

export const demoWorkers = [
  { email: "rider@needcoxs.test", name: "সাইফুল (লন্ড্রি রাইডার)", phone: "01811000001", isRider: true, skills: ["laundry"] },
  { email: "sumon.wifi@needcoxs.test", name: "সুমন (ওয়াইফাই টেকনিশিয়ান)", phone: "01811000002", isRider: false, skills: ["wifi"] },
  { email: "jamal.electric@needcoxs.test", name: "জামাল (ইলেকট্রিশিয়ান)", phone: "01811000003", isRider: false, skills: ["electrician"] },
  { email: "rina.clean@needcoxs.test", name: "রিনা (ক্লিনিং টিম লিড)", phone: "01811000004", isRider: false, skills: ["home-cleaning", "resort-cleaning"] },
  { email: "karim.plumber@needcoxs.test", name: "করিম (প্লাম্বার)", phone: "01811000005", isRider: false, skills: ["plumber", "labour", "shifting"] },
  { email: "rafiq.ac@needcoxs.test", name: "রফিক (এসি ও ফ্রিজ মেকানিক)", phone: "01811000006", isRider: false, skills: ["ac-fridge", "electrician", "other"] },
] as const
