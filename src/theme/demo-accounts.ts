/** Demo sign-ins. The seed script and the login screen both read this list. */
export const demoPassword = {
  admin: "admin123",
  store: "store123",
  rider: "rider123",
  customer: "customer123",
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
] as const
