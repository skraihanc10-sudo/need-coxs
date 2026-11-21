export const services = [
  {
    slug: "dry-cleaning",
    title: "Dry cleaning",
    titleBn: "ড্রাই ক্লিন",
    blurb: "Sarees, suits, and anything that should skip the machine.",
    price: "৳120",
    unit: "from / piece",
    discount: "10% off this week",
    image: "/marketing/svc-rail.jpg",
    body: "Each formal piece is priced on its own. A silk saree is not the same job as a cotton shirt, and the shop you pick shows both rates before you book.",
  },
  {
    slug: "laundry",
    title: "Laundry service",
    titleBn: "লন্ড্রি",
    blurb: "Everyday wash for tees, polos, and school clothes.",
    price: "৳40",
    unit: "from / piece",
    discount: "Everyday rate",
    image: "/marketing/svc-wash.jpg",
    body: "Wash only, or wash and iron. You choose on the cloth itself, inside the shop menu.",
  },
  {
    slug: "wash-fold",
    title: "Wash & fold",
    titleBn: "ওয়াশ অ্যান্ড ফোল্ড",
    blurb: "A kilo bag, washed, dried, and folded.",
    price: "৳90",
    unit: "from / kg",
    discount: "15% under ৳500 with a code",
    image: "/marketing/svc-fold.jpg",
    body: "Best for a family basket. Shops list a per-kilo rate. Delivery is a separate line on the bill.",
  },
  {
    slug: "iron",
    title: "Iron only",
    titleBn: "ইস্ত্রি",
    blurb: "You washed it. The press does the rest.",
    price: "৳20",
    unit: "from / piece",
    discount: "Same-day slots",
    image: "/marketing/news-press.jpg",
    body: "Shirts come back on a hanger. Tell the shop if you want fragrance-free steam.",
  },
]

export const posts = [
  {
    slug: "gate-pickup",
    title: "What to leave at the gate",
    date: "12 Nov 2026",
    image: "/marketing/news-gate.jpg",
    excerpt: "A named bag, a phone that rings, and a note if anything is silk.",
    body: "Riders in Dhaka work from the pin on your address. Leave the bag where the guard can see it, and keep the phone on. If a saree is in the pile, mark it in the order note so the shop does not machine-wash it.",
  },
  {
    slug: "press-finish",
    title: "How a shirt should come back",
    date: "4 Nov 2026",
    image: "/marketing/news-press.jpg",
    excerpt: "Collar, cuffs, and a hanger. That is the press standard on Cox's Seba.",
    body: "Wash and iron is a different line from wash and fold. If you need the collar sharp for the office, pick wash and iron on the shirt, not the kilo bundle.",
  },
  {
    slug: "kilo-vs-piece",
    title: "Kilo bundles versus piece rates",
    date: "28 Oct 2026",
    image: "/marketing/news-foldline.jpg",
    excerpt: "Use the kilo rate for everyday cotton. Use piece rates for anything formal.",
    body: "A mixed bag of tees is cheaper by the kilo. A suit, a silk saree, or a heavy curtain should be booked as its own line so the price matches the work.",
  },
]

export const plans = [
  { name: "Everyday", price: "৳90", unit: "/ kg", points: ["Wash and fold", "48-hour return", "Gate pickup", "Cash on delivery"], href: "/app" },
  { name: "Pressed", price: "৳140", unit: "/ kg", points: ["Wash and iron", "Shirts on hangers", "Fragrance-free option", "Slot you choose"], href: "/app", featured: true },
  { name: "Formal", price: "৳120", unit: "/ piece", points: ["Dry clean from this rate", "Saree and suit care", "Separate piece pricing", "Shop you can name"], href: "/c/dry" },
]

export const steps = [
  { n: "01", title: "Book a time", text: "Open a shop and choose a pickup slot." },
  { n: "02", title: "We collect", text: "The rider calls from the gate." },
  { n: "03", title: "We clean", text: "The shop washes, presses, or dry-cleans." },
  { n: "04", title: "We deliver", text: "Pay the rider when the bag returns." },
]

export function postBySlug(slug: string) {
  return posts.find((post) => post.slug === slug)
}

export function serviceBySlug(slug: string) {
  return services.find((service) => service.slug === slug)
}
