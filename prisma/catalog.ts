/**
 * Cox's Bazar Sadar areas and our service list. The seed creates anything
 * missing and never overwrites what the admin has edited.
 * Prices are whole BDT. `charge` is the area's visit/delivery charge.
 */
export const AREAS = [
  { slug: "kolatoli", nameBn: "কলাতলী", name: "Kolatoli", charge: 0 },
  { slug: "sugandha-point", nameBn: "সুগন্ধা পয়েন্ট", name: "Sugandha Point", charge: 0 },
  { slug: "laboni-point", nameBn: "লাবণী পয়েন্ট", name: "Laboni Point", charge: 0 },
  { slug: "hotel-motel-zone", nameBn: "হোটেল-মোটেল জোন", name: "Hotel-Motel Zone", charge: 0 },
  { slug: "marine-drive-sadar", nameBn: "মেরিন ড্রাইভ (সদর অংশ)", name: "Marine Drive (Sadar part)", charge: 60 },
  { slug: "bazarghata", nameBn: "বাজারঘাটা", name: "Bazarghata", charge: 30 },
  { slug: "tekpara", nameBn: "টেকপাড়া", name: "Tekpara", charge: 30 },
  { slug: "peshkarpara", nameBn: "পেশকারপাড়া", name: "Peshkarpara", charge: 30 },
  { slug: "burmese-market", nameBn: "বার্মিজ মার্কেট", name: "Burmese Market", charge: 30 },
  { slug: "baharchhara", nameBn: "বাহারছড়া", name: "Baharchhara", charge: 30 },
  { slug: "ghonarpara", nameBn: "ঘোনারপাড়া", name: "Ghonarpara", charge: 30 },
  { slug: "link-road", nameBn: "লিংক রোড", name: "Link Road", charge: 40 },
  { slug: "college-gate", nameBn: "কলেজ গেট", name: "College Gate", charge: 30 },
  { slug: "jhautala", nameBn: "ঝাউতলা", name: "Jhautala", charge: 30 },
  { slug: "airport-road", nameBn: "এয়ারপোর্ট রোড", name: "Airport Road", charge: 40 },
  { slug: "airport-area", nameBn: "বিমানবন্দর এলাকা", name: "Airport area", charge: 50 },
  { slug: "pahartali", nameBn: "পাহাড়তলী", name: "Pahartali", charge: 40 },
  { slug: "khuruskul", nameBn: "খুরুশকুল", name: "Khuruskul", charge: 100 },
  { slug: "jhilonja", nameBn: "ঝিলংজা", name: "Jhilonja", charge: 80 },
  { slug: "pmkhali", nameBn: "পিএমখালী", name: "PMKhali", charge: 120 },
  { slug: "islampur", nameBn: "ইসলামপুর", name: "Islampur", charge: 150 },
  { slug: "bharuakhali", nameBn: "ভারুয়াখালী", name: "Bharuakhali", charge: 150 },
  { slug: "chowfaldandi", nameBn: "চৌফলদন্ডী", name: "Chowfaldandi", charge: 150 },
  { slug: "pokkhali", nameBn: "পোকখালী", name: "Pokkhali", charge: 150 },
  { slug: "jalalabad", nameBn: "জালালাবাদ", name: "Jalalabad", charge: 150 },
]

type Offer = {
  slug: string
  nameBn: string
  name: string
  detailBn: string
  detail: string
  pricing: "FIXED" | "PER_KG" | "PER_ITEM" | "PER_HOUR" | "PER_ROOM" | "QUOTE"
  price: number
  minQty?: number
  durationMin: number
}

export const CATEGORIES: Array<{
  slug: string
  nameBn: string
  name: string
  blurbBn: string
  blurb: string
  icon: string
  image: string
  flow: "STANDARD" | "LAUNDRY" | "TEAM" | "CUSTOM"
  offerings: Offer[]
}> = [
  {
    slug: "laundry",
    nameBn: "লন্ড্রি",
    name: "Laundry",
    blurbBn: "আমাদের নিজের লন্ড্রি। রাইডার বাসা থেকে কাপড় নেবে, পরিষ্কার করে ফেরত দেবে।",
    blurb: "Our own laundry. A rider picks up from your door and brings it back clean.",
    icon: "shirt",
    image: "/services/laundry.svg",
    flow: "LAUNDRY",
    offerings: [
      { slug: "wash-iron", nameBn: "ওয়াশ ও আয়রন", name: "Wash & iron", detailBn: "ধোয়া, শুকানো, আয়রন করে ভাঁজ। সর্বনিম্ন ৩ কেজি।", detail: "Washed, dried, ironed and folded. Minimum 3 kg.", pricing: "PER_KG", price: 90, minQty: 3, durationMin: 2880 },
      { slug: "iron-only", nameBn: "শুধু আয়রন", name: "Iron only", detailBn: "শার্ট, প্যান্ট, শাড়ি – প্রতি পিস।", detail: "Shirts, trousers, saris – per piece.", pricing: "PER_ITEM", price: 15, minQty: 5, durationMin: 1440 },
      { slug: "dry-clean", nameBn: "ড্রাই ক্লিন", name: "Dry clean", detailBn: "স্যুট, ব্লেজার, পাঞ্জাবি, শাড়ি।", detail: "Suits, blazers, panjabis, saris.", pricing: "PER_ITEM", price: 250, durationMin: 4320 },
      { slug: "blanket-curtain", nameBn: "কম্বল বা পর্দা", name: "Blanket or curtain", detailBn: "কম্বল, লেপের কভার, ভারী পর্দা – প্রতি পিস।", detail: "Blankets, quilt covers, heavy curtains – per piece.", pricing: "PER_ITEM", price: 350, durationMin: 4320 },
      { slug: "hotel-linen", nameBn: "হোটেল ও রিসোর্টের বাল্ক লিনেন", name: "Hotel & resort bulk linen", detailBn: "বেডশিট, টাওয়েল, পিলো কভার। সর্বনিম্ন ২০ কেজি।", detail: "Bedsheets, towels, pillow covers. Minimum 20 kg.", pricing: "PER_KG", price: 60, minQty: 20, durationMin: 1440 },
    ],
  },
  {
    slug: "wifi",
    nameBn: "ওয়াইফাই ও ইন্টারনেট",
    name: "WiFi & internet",
    blurbBn: "নতুন কানেকশন, রাউটার সেটআপ আর লাইনের সমস্যা।",
    blurb: "New connections, router setup and line problems.",
    icon: "wifi",
    image: "/services/wifi.svg",
    flow: "STANDARD",
    offerings: [
      { slug: "new-connection", nameBn: "নতুন কানেকশন", name: "New connection", detailBn: "ক্যাবল, রাউটার কনফিগার আর প্রথম মাসের সেটআপ।", detail: "Cable, router configuration and first-month setup.", pricing: "FIXED", price: 1000, durationMin: 120 },
      { slug: "router-setup", nameBn: "রাউটার সেটআপ", name: "Router setup", detailBn: "নতুন রাউটার বসানো, পাসওয়ার্ড আর রেঞ্জ ঠিক করা।", detail: "Install a router, set the password and range.", pricing: "FIXED", price: 400, durationMin: 60 },
      { slug: "line-problem", nameBn: "লাইনের সমস্যা", name: "Line problem", detailBn: "নেট নেই, ধীর বা বারবার কেটে যায়।", detail: "No internet, slow or dropping.", pricing: "FIXED", price: 300, durationMin: 60 },
      { slug: "office-network", nameBn: "অফিস বা হোটেলের নেটওয়ার্ক", name: "Office or hotel network", detailBn: "পুরো ভবনে ওয়াইফাই। দেখে দাম জানানো হবে।", detail: "WiFi across a whole building. Priced after a visit.", pricing: "QUOTE", price: 300, durationMin: 180 },
    ],
  },
  {
    slug: "electrician",
    nameBn: "ইলেকট্রিশিয়ান",
    name: "Electrician",
    blurbBn: "ফ্যান, লাইট, ওয়্যারিং, IPS আর মিটারের কাজ।",
    blurb: "Fans, lights, wiring, IPS and meters.",
    icon: "zap",
    image: "/services/electrician.svg",
    flow: "STANDARD",
    offerings: [
      { slug: "fan-light", nameBn: "ফ্যান বা লাইট", name: "Fan or light", detailBn: "ফ্যান, লাইট, সুইচ বা সকেট লাগানো বা মেরামত।", detail: "Fit or repair a fan, light, switch or socket.", pricing: "FIXED", price: 250, durationMin: 60 },
      { slug: "wiring", nameBn: "ওয়্যারিং", name: "Wiring", detailBn: "নতুন লাইন বা পুরনো ওয়্যারিং। দেখে দাম জানানো হবে।", detail: "New lines or old wiring. Priced after a visit.", pricing: "QUOTE", price: 300, durationMin: 240 },
      { slug: "ips-meter", nameBn: "IPS বা মিটার", name: "IPS or meter", detailBn: "IPS লাগানো, ব্যাটারি বদল, মিটারের লাইন।", detail: "IPS install, battery change, meter line.", pricing: "FIXED", price: 600, durationMin: 120 },
      { slug: "ac-service", nameBn: "এসি সার্ভিস", name: "AC service", detailBn: "এসি পরিষ্কার আর চেক-আপ (১ টন – ২ টন)।", detail: "AC cleaning and check-up (1–2 ton).", pricing: "FIXED", price: 1200, durationMin: 90 },
    ],
  },
  {
    slug: "plumber",
    nameBn: "প্লাম্বার",
    name: "Plumber",
    blurbBn: "লিকেজ, ট্যাপ, বেসিন আর পানির পাম্প।",
    blurb: "Leaks, taps, basins and water pumps.",
    icon: "droplet",
    image: "/services/plumber.svg",
    flow: "STANDARD",
    offerings: [
      { slug: "leakage", nameBn: "লিকেজ মেরামত", name: "Leak repair", detailBn: "পাইপ বা দেয়ালের লিকেজ। দেখে দাম জানানো হবে।", detail: "Pipe or wall leaks. Priced after a visit.", pricing: "QUOTE", price: 300, durationMin: 120 },
      { slug: "tap-basin", nameBn: "ট্যাপ বা বেসিন", name: "Tap or basin", detailBn: "ট্যাপ, শাওয়ার বা বেসিন লাগানো ও মেরামত।", detail: "Fit or fix a tap, shower or basin.", pricing: "FIXED", price: 350, durationMin: 60 },
      { slug: "water-pump", nameBn: "পানির পাম্প", name: "Water pump", detailBn: "পাম্প বসানো বা মেরামত। দেখে দাম জানানো হবে।", detail: "Pump install or repair. Priced after a visit.", pricing: "QUOTE", price: 400, durationMin: 180 },
      { slug: "commode-drain", nameBn: "কমোড বা ড্রেন", name: "Toilet or drain", detailBn: "কমোড মেরামত, জ্যাম ড্রেন পরিষ্কার।", detail: "Toilet repair, clearing blocked drains.", pricing: "FIXED", price: 500, durationMin: 90 },
    ],
  },
  {
    slug: "home-cleaning",
    nameBn: "বাসা পরিষ্কার",
    name: "Home cleaning",
    blurbBn: "ডিপ ক্লিন, কিচেন আর বাথরুম পরিষ্কার।",
    blurb: "Deep cleans, kitchens and bathrooms.",
    icon: "spark",
    image: "/services/cleaning.svg",
    flow: "STANDARD",
    offerings: [
      { slug: "deep-clean", nameBn: "ডিপ ক্লিন", name: "Deep clean", detailBn: "পুরো বাসা, মেঝে থেকে জানালা – প্রতি রুম।", detail: "The whole home, floor to windows – per room.", pricing: "PER_ROOM", price: 800, minQty: 1, durationMin: 240 },
      { slug: "kitchen", nameBn: "কিচেন ক্লিন", name: "Kitchen clean", detailBn: "চুলা, তেল-চিটচিটে দেয়াল, সিঙ্ক, কেবিনেট।", detail: "Stove, greasy walls, sink, cabinets.", pricing: "FIXED", price: 1500, durationMin: 150 },
      { slug: "bathroom", nameBn: "বাথরুম ক্লিন", name: "Bathroom clean", detailBn: "টাইলস, কমোড, বেসিন, দাগ তোলা।", detail: "Tiles, toilet, basin, stain removal.", pricing: "PER_ITEM", price: 700, durationMin: 90 },
      { slug: "sofa-carpet", nameBn: "সোফা ও কার্পেট", name: "Sofa & carpet", detailBn: "সোফা শ্যাম্পু আর কার্পেট ক্লিন – প্রতি সিট বা পিস।", detail: "Sofa shampoo and carpet cleaning – per seat or piece.", pricing: "PER_ITEM", price: 300, durationMin: 120 },
    ],
  },
  {
    slug: "resort-cleaning",
    nameBn: "রিসোর্ট ও হোটেল ক্লিনিং টিম",
    name: "Resort & hotel cleaning team",
    blurbBn: "রুম সংখ্যা, টিম আর কত দিন বলুন। পুরো টিম পাঠাব।",
    blurb: "Tell us rooms, team size and days. We send a full crew.",
    icon: "building",
    image: "/services/cleaning.svg",
    flow: "TEAM",
    offerings: [
      { slug: "room-turnover", nameBn: "রুম টার্নওভার", name: "Room turnover", detailBn: "চেক-আউটের পর রুম রেডি করা – প্রতি রুম প্রতি দিন।", detail: "Rooms made ready after check-out – per room per day.", pricing: "PER_ROOM", price: 250, minQty: 5, durationMin: 480 },
      { slug: "team-deep-clean", nameBn: "সিজনের আগে ডিপ ক্লিন", name: "Pre-season deep clean", detailBn: "পুরো হোটেল ডিপ ক্লিন – প্রতি রুম প্রতি দিন।", detail: "Whole-hotel deep clean – per room per day.", pricing: "PER_ROOM", price: 600, minQty: 5, durationMin: 480 },
      { slug: "event-cleanup", nameBn: "অনুষ্ঠানের পরে পরিষ্কার", name: "After-event cleanup", detailBn: "হল, লন বা কনফারেন্স রুম। দেখে দাম জানানো হবে।", detail: "Halls, lawns or conference rooms. Priced after a visit.", pricing: "QUOTE", price: 500, durationMin: 480 },
    ],
  },
  {
    slug: "ac-fridge",
    nameBn: "এসি ও ফ্রিজ মেরামত",
    name: "AC & fridge repair",
    blurbBn: "এসি গ্যাস, ইনস্টল আর ফ্রিজ মেরামত।",
    blurb: "AC gas, installs and fridge repair.",
    icon: "snow",
    image: "/services/ac.svg",
    flow: "STANDARD",
    offerings: [
      { slug: "ac-repair", nameBn: "এসি মেরামত", name: "AC repair", detailBn: "ঠান্ডা হয় না, পানি পড়ে, শব্দ করে। দেখে দাম জানানো হবে।", detail: "Not cooling, leaking or noisy. Priced after a visit.", pricing: "QUOTE", price: 500, durationMin: 120 },
      { slug: "ac-gas", nameBn: "এসি গ্যাস রিফিল", name: "AC gas refill", detailBn: "লিক চেক আর গ্যাস ভরা (১–২ টন)।", detail: "Leak check and gas refill (1–2 ton).", pricing: "FIXED", price: 3500, durationMin: 120 },
      { slug: "ac-install", nameBn: "এসি ইনস্টল", name: "AC install", detailBn: "নতুন বা পুরনো এসি লাগানো, ৮ ফুট পাইপসহ।", detail: "Fit a new or used AC, with 8 ft of piping.", pricing: "FIXED", price: 2500, durationMin: 180 },
      { slug: "fridge-repair", nameBn: "ফ্রিজ মেরামত", name: "Fridge repair", detailBn: "ঠান্ডা হয় না বা বন্ধ হয়ে যায়। দেখে দাম জানানো হবে।", detail: "Not cooling or switching off. Priced after a visit.", pricing: "QUOTE", price: 500, durationMin: 120 },
    ],
  },
  {
    slug: "shifting",
    nameBn: "শিফটিং ও মালামাল টানা",
    name: "Moving & hauling",
    blurbBn: "বাসা বা অফিস বদল, ফার্নিচার টানা, পিকআপ ভ্যান।",
    blurb: "Home or office moves, furniture, pickup vans.",
    icon: "truck",
    image: "/services/movers.svg",
    flow: "STANDARD",
    offerings: [
      { slug: "house-shift", nameBn: "বাসা বদল", name: "House move", detailBn: "লোক, প্যাকিং আর গাড়ি। দেখে দাম জানানো হবে।", detail: "Crew, packing and a vehicle. Priced after a visit.", pricing: "QUOTE", price: 300, durationMin: 360 },
      { slug: "furniture-move", nameBn: "ফার্নিচার টানা", name: "Furniture move", detailBn: "খাট, আলমারি, ফ্রিজ – ২ জন লোক, শহরের মধ্যে।", detail: "Bed, wardrobe, fridge – 2 people, within town.", pricing: "FIXED", price: 1500, durationMin: 120 },
      { slug: "loading-help", nameBn: "মাল ওঠানো-নামানো", name: "Loading help", detailBn: "প্রতি ঘণ্টা প্রতি জন।", detail: "Per person, per hour.", pricing: "PER_HOUR", price: 250, minQty: 2, durationMin: 120 },
    ],
  },
  {
    slug: "labour",
    nameBn: "কাজের লোক / দৈনিক শ্রমিক",
    name: "Helpers & day labour",
    blurbBn: "যেকোনো ছোট কাজের জন্য বিশ্বস্ত লোক।",
    blurb: "A trusted pair of hands for any small job.",
    icon: "hardhat",
    image: "/services/labour.svg",
    flow: "STANDARD",
    offerings: [
      { slug: "hourly-helper", nameBn: "ঘণ্টা চুক্তিতে লোক", name: "Hourly helper", detailBn: "ঘর গোছানো, বাজার টানা, ছোট কাজ।", detail: "Tidying, carrying shopping, small jobs.", pricing: "PER_HOUR", price: 200, minQty: 2, durationMin: 120 },
      { slug: "day-labour", nameBn: "দৈনিক শ্রমিক", name: "Day labourer", detailBn: "সকাল ৯টা থেকে বিকেল ৫টা।", detail: "9 am to 5 pm.", pricing: "FIXED", price: 800, durationMin: 480 },
      { slug: "garden-roof", nameBn: "বাগান বা ছাদ পরিষ্কার", name: "Garden or roof clean-up", detailBn: "ঘাস কাটা, আবর্জনা সরানো – প্রতি ঘণ্টা।", detail: "Cutting grass, clearing rubbish – per hour.", pricing: "PER_HOUR", price: 250, minQty: 2, durationMin: 180 },
    ],
  },
  {
    slug: "other",
    nameBn: "অন্যান্য",
    name: "Something else",
    blurbBn: "তালিকায় নেই? আপনার কাজটা লিখুন, আমরা কল দিয়ে দাম জানাব।",
    blurb: "Not on the list? Describe the job and we'll call with a price.",
    icon: "pencil",
    image: "",
    flow: "CUSTOM",
    offerings: [
      { slug: "custom-job", nameBn: "আপনার কাজটা লিখুন", name: "Describe your job", detailBn: "নিজের ভাষায় লিখুন কী লাগবে। আমাদের টিম কল দিয়ে দাম জানাবে।", detail: "Tell us in your own words. Our team will call with a price.", pricing: "QUOTE", price: 0, durationMin: 60 },
    ],
  },
]

export const FAQS = [
  {
    questionBn: "আপনারা কোন কোন এলাকায় সেবা দেন?",
    question: "Which areas do you serve?",
    answerBn: "এখন শুধু কক্সবাজার সদর উপজেলায়: কলাতলী, সুগন্ধা, লাবণী, বাজারঘাটা, টেকপাড়া, ঝাউতলা, খুরুশকুল, ঝিলংজা, পিএমখালী সহ সদরের সব এলাকা।",
    answer: "Only Cox's Bazar Sadar for now: Kolatoli, Sugandha, Laboni, Bazarghata, Tekpara, Jhautala, Khuruskul, Jhilonja, PMKhali and every other Sadar area.",
  },
  {
    questionBn: "কাজটা কে করবে?",
    question: "Who does the work?",
    answerBn: "আমাদের নিজের টিম। প্রতিটা কর্মীর NID যাচাই করা, ট্রেনিং দেওয়া আর রেটিং দেখে কাজ দেওয়া হয়।",
    answer: "Our own team. Every worker's NID is checked, they are trained, and jobs go by rating.",
  },
  {
    questionBn: "দাম কীভাবে ঠিক হয়?",
    question: "How is the price set?",
    answerBn: "বেশিরভাগ সেবার দাম আগেই লেখা থাকে। লিকেজ, ওয়্যারিং বা এসি মেরামতের মতো কাজে কর্মী গিয়ে দেখে দাম জানান; আপনি মানলে তবেই কাজ শুরু।",
    answer: "Most services have a fixed price up front. For jobs like leaks, wiring or AC repair, the worker inspects first and sends a quote; work starts only if you accept.",
  },
  {
    questionBn: "কীভাবে টাকা দেব?",
    question: "How do I pay?",
    answerBn: "কাজ শেষে ক্যাশ, বিকাশ বা নগদে দিতে পারবেন।",
    answer: "Cash, bKash or Nagad when the job is done.",
  },
  {
    questionBn: "বুকিং বাতিল বা সময় বদলানো যায়?",
    question: "Can I cancel or reschedule?",
    answerBn: "কর্মী রওনা দেওয়ার আগে পর্যন্ত অ্যাপ থেকেই বাতিল বা সময় বদলাতে পারবেন। পরে হলে হেল্পলাইনে কল দিন।",
    answer: "Yes, from the app, until the worker is on the way. After that, call our helpline.",
  },
  {
    questionBn: "কাজ নিয়ে সমস্যা হলে?",
    question: "What if something goes wrong?",
    answerBn: "বুকিংয়ের ভেতর থেকে চ্যাট করুন বা একটা টিকেট খুলুন। জরুরি হলে হেল্পলাইনে কল দিন – আমরা সমাধান না হওয়া পর্যন্ত পাশে আছি।",
    answer: "Chat from inside the booking or open a ticket. If it's urgent, call the helpline – we stay with it until it's fixed.",
  },
]

export const REPLY_TEMPLATES = [
  { title: "স্বাগতম", body: "আসসালামু আলাইকুম! কক্স সেবা-তে যোগাযোগের জন্য ধন্যবাদ। কীভাবে সাহায্য করতে পারি?" },
  { title: "কর্মী আসছেন", body: "আপনার কর্মী রওনা দিয়েছেন, অল্প সময়ের মধ্যে পৌঁছাবেন। দেরি হলে আমরা জানিয়ে দেব।" },
  { title: "দাম জানানো", body: "কর্মী কাজটা দেখে দাম পাঠিয়েছেন। অ্যাপে বুকিংয়ের ভেতরে দাম দেখে মেনে নিলে কাজ শুরু হবে।" },
  { title: "রিফান্ড চলছে", body: "আপনার রিফান্ডের অনুরোধ পেয়েছি। ৩ কর্মদিবসের মধ্যে বিকাশ/নগদে টাকা ফেরত যাবে।" },
  { title: "দুঃখপ্রকাশ", body: "অসুবিধার জন্য আমরা আন্তরিকভাবে দুঃখিত। বিষয়টা এখনই দেখছি এবং আপনাকে আপডেট দেব।" },
  { title: "সমাধান হয়েছে", body: "আপনার সমস্যার সমাধান হয়েছে বলে আমরা টিকেটটা বন্ধ করছি। আর কিছু লাগলে জানাবেন। ধন্যবাদ!" },
]
