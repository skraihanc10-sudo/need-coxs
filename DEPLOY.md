# Deploy Need Cox's on Coolify

Self-hosted Coolify v4 (tested against the v4.7.6 Dockerfile build pack with Traefik). The app is a Next.js standalone server. SQLite lives at `/data/needcoxs.db` so a persistent volume keeps orders across redeploys.

## Coolify application

| Setting | Value |
| --- | --- |
| Build pack | Dockerfile |
| Dockerfile location | `/Dockerfile` (repository root) |
| Ports Exposes | `3000` |
| Port mapping | Coolify / Traefik publishes HTTPS. The container listens on 3000. |
| Health check path | `/api/health` (expects HTTP 200 and JSON `{ "ok": true }`) |
| Start command | Leave empty. The image entrypoint runs migrations, seeds an empty database, then `node server.js`. |

## Persistent volume

| Volume name | Mount path |
| --- | --- |
| `needcoxs-data` | `/data` |

The entrypoint creates `/data` if needed and gives it to the `nextjs` user (uid 1001) before the server starts. Do not mount the volume over `/app`.

Backup the database file:

```text
/data/needcoxs.db
```

Copy that file (and `/data/needcoxs.db-journal` if it exists) while the app is stopped, or use `sqlite3 /data/needcoxs.db ".backup /data/needcoxs-backup.db"` from a shell in the container.

## Environment variables

Set these in Coolify. Do not commit real values.

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | yes | `file:/data/needcoxs.db` | SQLite file on the volume. This is the default if you omit it. |
| `AUTH_SECRET` | yes | long random string, 32+ characters | Signs session cookies. The container exits if this is missing in production. |
| `AUTH_URL` | yes | `https://laundry.example.com` | Public origin. Used for redirects and to mark cookies `Secure` when the URL is `https://`. |
| `AUTH_TRUST_HOST` | yes | `true` | Trust `X-Forwarded-Proto` and `X-Forwarded-Host` from Traefik. |
| `NODE_ENV` | yes | `production` | Production mode. |
| `PORT` | yes | `3000` | Must match Ports Exposes. |
| `HOSTNAME` | yes | `0.0.0.0` | Bind every interface so Traefik can reach the process. |

`SITE_URL` is accepted as an alias of `AUTH_URL` if you already use that name on other apps.

Optional payment keys (the site runs with cash on delivery without them):

- `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_USERNAME`, `BKASH_PASSWORD`
- `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`
- `STRIPE_SECRET_KEY`
- `PAYMENTS_WEBHOOK_SECRET`

Generate a secret:

```bash
openssl rand -base64 32
```

## First boot

1. `prisma migrate deploy` creates the schema on the empty file.
2. If the `User` table has no rows, the demo seed runs once.
3. Later restarts migrate again and skip the seed, so demo rows are not duplicated and real orders stay on the volume.

Demo logins after the first seed:

| Role | Email | Password |
| --- | --- | --- |
| Customer | customer@needcoxs.test | customer123 |
| Laundry | store@needcoxs.test | store123 |
| Rider | rider@needcoxs.test | rider123 |
| Admin | admin@needcoxs.test | admin123 |

Change these passwords from the admin profile and customer screens after the owner signs in. Passwords are stored as hashes.

## Health check

```text
GET /api/health
```

Response: `200` and `{ "ok": true, "service": "need-coxs" }`.

In Coolify, set the health check path to `/api/health` and the port to `3000`.
