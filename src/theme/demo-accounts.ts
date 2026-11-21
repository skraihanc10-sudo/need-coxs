/** Demo sign-ins. The seed script and the login screen both read this list. */
export const demoPassword = {
  admin: "admin123",
  store: "store123",
  rider: "rider123",
  customer: "customer123",
  wifi: "wifi123",
  electric: "electric123",
  cleaning: "cleaning123",
} as const

export const demoAccounts = [
  {
    role: "CUSTOMER",
    label: "Customer",
    email: "customer@needcoxs.test",
    password: demoPassword.customer,
  },
  {
    role: "STORE",
    label: "Laundry",
    email: "store@needcoxs.test",
    password: demoPassword.store,
  },
  {
    role: "DELIVERY",
    label: "Rider",
    email: "rider@needcoxs.test",
    password: demoPassword.rider,
  },
  {
    role: "ADMIN",
    label: "Admin",
    email: "admin@needcoxs.test",
    password: demoPassword.admin,
  },
  {
    role: "STORE",
    label: "WiFi",
    email: "wifi@needcoxs.test",
    password: demoPassword.wifi,
  },
  {
    role: "STORE",
    label: "Electrician",
    email: "electric@needcoxs.test",
    password: demoPassword.electric,
  },
  {
    role: "STORE",
    label: "Cleaning",
    email: "cleaning@needcoxs.test",
    password: demoPassword.cleaning,
  },
] as const
