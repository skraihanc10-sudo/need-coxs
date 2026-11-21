# Cox's Seba · কক্স সেবা

One company, our own field team, every home service in **Cox's Bazar Sadar**: laundry pickup, WiFi, electricians, plumbers, cleaning crews, AC repair, moving, helpers, and "describe your job". Customers book in Bangla (English toggle), pay cash / bKash / Nagad when the job is done.

Next.js 16 · Prisma 6 + SQLite · Tailwind 4 · Playwright. Runs as one Docker container (Coolify) with the database and photos on a `/data` volume.

## Roles
| Role | Where | Can |
|---|---|---|
| **CUSTOMER** | `/` `/bookings` `/care` `/help` | book with phone + OTP, track live status, chat, cancel/reschedule, review, open tickets |
| **WORKER** | `/worker` | see today's jobs, Accept → On the way → Arrived → Start → Done (laundry: Pick up → At laundry → Ready → Delivering → Done), send quotes, before/after photos, chat, earnings |
| **SUPPORT** | `/support` | one inbox for care chats + tickets + booking chats, assign to self, reply templates, assign workers, move bookings |
| **ADMIN** | `/admin` | dashboard, bookings (filter / assign / price / refund notes), workers (skills, areas, NID), customers, services & prices, areas & charges, reports + CSV, staff, settings |

## Run locally
```bash
npm ci
npm run db:setup          # creates prisma/dev.db, applies migrations, seeds areas/services/demo data
npm run dev               # http://localhost:47291
```
Demo logins are listed on `/login` (and below). OTP in demo mode is always **123456**.

| Who | Login |
|---|---|
| Customer | customer@needcoxs.test / customer123 (or any mobile + OTP 123456) |
| Admin | admin@needcoxs.test / admin123 |
| Support | support@needcoxs.test / support123 |
| Laundry rider | rider@needcoxs.test / rider123 |
| WiFi · Electrician · Cleaning · Plumber · AC | sumon.wifi@ · jamal.electric@ · rina.clean@ · karim.plumber@ · rafiq.ac@needcoxs.test / rider123 |

## Checks
```bash
npm run lint && npm run typecheck && npm run build
RATE_LIMIT=off npm run dev           # in one terminal
CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" npx playwright test   # in another
npx tsx scripts/screenshots.ts       # phone + desktop screenshots into ./screenshots
```

## How it is built
- `prisma/schema.prisma` — single-operator model: `User` (4 roles), `WorkerProfile` + skills/areas, `ServiceCategory`/`ServiceOffering`, `ServiceArea` (Sadar only, per-area charge), `ServiceBooking` + `BookingEvent` history, photos, reviews, payments, booking chat, care chat, tickets, reply templates, notices, OTP codes, FAQs, settings.
- `src/lib/booking-flow.ts` — the state machine. Every status change goes through `moveBooking()` in `src/lib/bookings.ts`; wrong steps throw a Bangla error.
- `src/lib/validation.ts` — zod schemas for every form; `src/lib/auth.ts#actor()` checks the role in every server action; customers only ever load their own bookings (`bookingFor()`).
- `src/lib/sms.ts` / `src/lib/payments.ts` — provider interfaces. Demo SMS logs the code; payments are record-only until gateway keys exist.
- `src/lib/rate-limit.ts` — login, OTP, booking and message limits (set `RATE_LIMIT=off` for tests).
- `src/app/api/uploads/[name]` — serves photos from `/data/uploads`.
- Fonts: **Nikosh** (Bangladesh Government standard) for Bangla headings, Noto Sans Bengali for body, Plus Jakarta Sans for English.

## Still to do before real customers
- Real SMS provider for OTPs (`SMS_PROVIDER` + keys) — until then the code is 123456.
- Real bKash / Nagad checkout (interfaces are in `src/lib/payments.ts`).
- Replace the demo passwords (`npm run db:setup` seeds them; `/admin/staff` and `/admin/workers` can reset them).
- Email notifications (in-app notices exist; email/push can hang off `src/lib/notify.ts`).
