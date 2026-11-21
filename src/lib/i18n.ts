import type { Locale } from "./format"

/** Pick the right string for the page language. Every screen uses this. */
export function pick<T>(locale: Locale, bn: T, en: T): T {
  return locale === "bn" ? bn : en
}

/** Bangla/English pair from a row that has `x` and `xBn` fields. */
export function named(locale: Locale, row: { name: string; nameBn: string }) {
  return locale === "bn" ? row.nameBn : row.name
}

/** Words used across many screens. Page-specific copy sits next to the page. */
const bn = {
  appName: "কক্স সেবা",
  home: "হোম",
  services: "সেবা",
  bookings: "আমার বুকিং",
  help: "সাহায্য",
  profile: "প্রোফাইল",
  care: "কাস্টমার কেয়ার",
  notifications: "নোটিফিকেশন",
  login: "লগইন",
  logout: "লগআউট",
  bookNow: "বুক করুন",
  call: "কল করুন",
  whatsapp: "হোয়াটসঅ্যাপ",
  send: "পাঠান",
  save: "সেভ করুন",
  cancel: "বাতিল",
  back: "পেছনে",
  next: "পরের ধাপ",
  search: "খুঁজুন",
  from: "শুরু",
  area: "এলাকা",
  address: "ঠিকানা",
  landmark: "বাড়ি বা ল্যান্ডমার্ক",
  phone: "মোবাইল নম্বর",
  name: "নাম",
  date: "তারিখ",
  time: "সময়",
  notes: "নোট",
  price: "দাম",
  total: "মোট",
  status: "অবস্থা",
  worker: "কর্মী",
  customer: "কাস্টমার",
  chat: "চ্যাট",
  empty: "এখনো কিছু নেই",
  seeAll: "সব দেখুন",
  language: "ভাষা",
  sadarOnly: "শুধু কক্সবাজার সদর",
}

const en: typeof bn = {
  appName: "Cox's Seba",
  home: "Home",
  services: "Services",
  bookings: "My bookings",
  help: "Help",
  profile: "Profile",
  care: "Customer care",
  notifications: "Notifications",
  login: "Log in",
  logout: "Log out",
  bookNow: "Book now",
  call: "Call",
  whatsapp: "WhatsApp",
  send: "Send",
  save: "Save",
  cancel: "Cancel",
  back: "Back",
  next: "Next",
  search: "Search",
  from: "From",
  area: "Area",
  address: "Address",
  landmark: "House or landmark",
  phone: "Mobile number",
  name: "Name",
  date: "Date",
  time: "Time",
  notes: "Notes",
  price: "Price",
  total: "Total",
  status: "Status",
  worker: "Worker",
  customer: "Customer",
  chat: "Chat",
  empty: "Nothing here yet",
  seeAll: "See all",
  language: "Language",
  sadarOnly: "Cox's Bazar Sadar only",
}

export function words(locale: Locale) {
  return locale === "bn" ? bn : en
}
