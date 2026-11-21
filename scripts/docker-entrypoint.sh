#!/bin/sh
set -eu

if [ "$(id -u)" = "0" ]; then
  mkdir -p /data /data/uploads
  chown -R nextjs:nodejs /data
  exec gosu nextjs:nodejs "$0" "$@"
fi

if [ -z "${DATABASE_URL:-}" ]; then
  export DATABASE_URL="file:/data/needcoxs.db"
fi

if [ "${NODE_ENV:-}" = "production" ] && [ -z "${AUTH_SECRET:-}" ]; then
  echo "AUTH_SECRET is required in production" >&2
  exit 1
fi

echo "Applying database migrations"
node /app/node_modules/prisma/build/index.js migrate deploy

echo "Seeding demo accounts only when the database has no users"
node scripts/seed-if-empty.mjs

echo "Adding any missing Sadar areas, services, FAQs and settings"
node prisma/seed.mjs --catalog

echo "Starting Cox's Seba on ${HOSTNAME:-0.0.0.0}:${PORT:-3000}"
exec node server.js
