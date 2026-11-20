# Need Cox's

Doorstep laundry for Dhaka. Customers compare neighbourhood wash houses, pick clothes and a service (wash, iron, wash & iron, or dry clean), choose pickup and delivery slots, and pay cash on delivery. Laundries, riders, and the Need Cox's desk each have their own panel.

Currency is BDT (৳). The customer app is English with a Bangla toggle.

## Demo logins

| Role | Email | Password |
| --- | --- | --- |
| Customer | customer@needcoxs.test | customer123 |
| Laundry | store@needcoxs.test | store123 |
| Rider | rider@needcoxs.test | rider123 |
| Admin | admin@needcoxs.test | admin123 |

Pending laundry (so the admin approve button has something to do): `pending@needcoxs.test` / `store123` (Uttara Fold Lane).

Signup verification uses demo code `123456` because no SMS provider is connected. The sign-in screen can fill these accounts for you.

## Run locally

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://127.0.0.1:47291](http://127.0.0.1:47291). The public site (home, about, services, pricing, how it works, stories, FAQ, contact) is the marketing desk. Book a pickup opens the customer app at `/app`.

`db:setup` writes a `.env` with an absolute SQLite path, creates the database, and loads the demo city.

The walk-through that proves the product:

1. Sign in as the customer, open Chandni Wash House, add a shirt, and choose a service in the popup.
2. Review the order, apply `WELCOME100` if the bag is over ৳500, pick pickup and delivery slots, and pay cash on delivery.
3. Sign in as the laundry, accept the order, and assign Karim.
4. Sign in as the rider, mark picked up. Back on the laundry, mark it processing, then ready to deliver.
5. The rider marks it delivered. The admin reports and the desk chart include the order.

## Deploy

A single Node server is enough. SQLite lives in `prisma/dev.db`.

```bash
npm install
npm run db:setup
npm run build
npm start
```

Set `AUTH_SECRET` in the environment before you share it. The Docker image does the same:

```bash
docker build -t need-coxs .
docker run -p 47291:47291 need-coxs
```

To move to Postgres later, point `DATABASE_URL` at Postgres and change `provider` in `prisma/schema.prisma` from `sqlite` to `postgresql`, then `prisma db push` and seed again. The models do not use database enums.

## Payments

Cash on delivery is live. bKash, SSLCommerz, and Stripe are adapters in `src/lib/payments.ts`. They show on checkout when the matching setting is on, and the pay screen lists the env keys they still need:

- `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_USERNAME`, `BKASH_PASSWORD`
- `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`
- `STRIPE_SECRET_KEY`

`POST /api/payments/webhook` with header `x-neel-signature: $PAYMENTS_WEBHOOK_SECRET` and body `{ "orderCode", "provider", "reference", "status": "PAID" }` marks an online order paid.

## Theme

App panels (customer, laundry, rider, admin) use the blue and cyan tokens in `src/theme/tokens.css`. The public site uses a separate green, yellow, and navy block on `.public-site` in the same file, so both palettes can be switched without hunting through screens. The product name lives in `src/theme/brand.ts`.

## Public preview

This environment serves the app on port 47291 inside the agent machine. It is not on the public internet. To give the owner a link:

1. Host the repo on a Node service that keeps a disk (Render, Fly.io, or Railway). Use the Dockerfile. Set `AUTH_SECRET`. SQLite is stored in `prisma/dev.db`, so the disk must persist or you run `npm run db:setup` on boot.
2. Vercel can host the Next.js app, but serverless SQLite will not keep orders. Point `DATABASE_URL` at Postgres and change `provider` in `prisma/schema.prisma` to `postgresql` before that deploy.

There is no Vercel token in this session, so a public URL was not created from here.

## Panels

- Customer: home, clothes picker (Men / Women / Kids / Other) with a per-item service popup, cart, promo review, pickup and delivery slots, addresses (Home / Office / Other), offers, orders and timeline, wallet, referrals, FAQs, contact, terms, language, and customer-care chat.
- Laundry: prices, slots, coupons, riders, FAQs, accept / reject, assign rider, status updates, payouts, reviews.
- Rider: assigned and completed jobs, call, map, cash to collect, picked up / delivered, notifications, earnings.
- Admin: orders and revenue chart (week / month / year), new and past orders, status sheet, delivery assignment, messages, store approval, customers, riders, banners, coupons, FAQs, payouts, reports, notification queue, settings.
