# Deploying Cox's Seba on Coolify

The app runs as one container built from `Dockerfile`. SQLite and uploaded photos live on a persistent volume at `/data`, so redeploys keep the data.

## Coolify application settings
- **Source:** this repo, branch `main`, build pack **Dockerfile** (`/Dockerfile`, base directory `/`).
- **Ports Exposes:** `3000` (leave Ports Mappings empty; Traefik routes by domain).
- **Health check:** path `/api/health` → `{"ok":true,"service":"coxs-seba"}`.
- **Persistent Storage:** volume `needcoxs-data` → `/data`.
- **Environment (runtime):**
  ```
  DATABASE_URL=file:/data/needcoxs.db
  AUTH_SECRET=<openssl rand -base64 48>
  AUTH_URL=https://your-domain            # http://… while on the sslip.io test address
  AUTH_TRUST_HOST=true
  NODE_ENV=production
  PORT=3000
  HOSTNAME=0.0.0.0
  SHOW_DEMO_LOGINS=0                      # hide the demo box on /login once real users arrive
  ```

## What the container does on start
`scripts/docker-entrypoint.sh` runs as the `nextjs` user and:
1. applies Prisma migrations (`prisma migrate deploy`);
2. seeds demo accounts **only if the database has no users**;
3. adds any missing Sadar areas, services, FAQs, reply templates and settings (never overwrites admin edits);
4. starts `node server.js`.

## Updating
Push to `main`, then press **Redeploy** in Coolify (the GitHub webhook can't reach the panel while port 8000 is closed). The `/data` volume is untouched.

## Backups
The whole state is `/var/lib/docker/volumes/<app>-data/_data/` on the host: `needcoxs.db` plus `uploads/`. Copy that folder.
