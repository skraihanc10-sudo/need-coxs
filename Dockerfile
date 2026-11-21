FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL="file:/tmp/needcoxs-build.db"
ENV AUTH_SECRET="build-time-placeholder-not-used-at-runtime"
RUN npx prisma generate \
  && npx esbuild prisma/seed.ts --bundle --platform=node --format=esm --outfile=prisma/seed.mjs --external:@prisma/client --external:bcryptjs \
  && npm run build

# Prisma CLI and the seed script need their own packages. Next's standalone
# trace does not include the migrate CLI.
RUN node --input-type=module -e 'import fs from "node:fs"; import path from "node:path"; const roots=["prisma","@prisma/client","bcryptjs"]; const seen=new Set(); function walk(name){ if(!name||seen.has(name)) return; const pkgPath=path.join("node_modules",name,"package.json"); if(!fs.existsSync(pkgPath)) return; seen.add(name); const pkg=JSON.parse(fs.readFileSync(pkgPath,"utf8")); for (const d of [...Object.keys(pkg.dependencies||{}), ...Object.keys(pkg.optionalDependencies||{})]) walk(d);} for (const r of roots) walk(r); fs.rmSync("/prisma-runtime",{recursive:true,force:true}); for (const name of seen){ const dest=path.join("/prisma-runtime",name); fs.mkdirSync(path.dirname(dest),{recursive:true}); fs.cpSync(path.join("node_modules",name), dest, {recursive:true, dereference:true}); } fs.cpSync("node_modules/.prisma","/prisma-runtime/.prisma",{recursive:true,dereference:true}); console.log("prisma runtime packages:", seen.size);'

FROM node:22-bookworm-slim AS runner
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates gosu \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --home-dir /app --shell /usr/sbin/nologin nextjs \
  && mkdir -p /data \
  && chown nextjs:nodejs /data

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL="file:/data/needcoxs.db"
ENV PATH="/app/node_modules/.bin:${PATH}"

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/db.ts ./src/lib/db.ts
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/settings.ts ./src/lib/settings.ts
COPY --from=builder --chown=nextjs:nodejs /app/src/theme ./src/theme
COPY --from=builder --chown=nextjs:nodejs /app/scripts/seed-if-empty.mjs ./scripts/seed-if-empty.mjs
COPY --from=builder --chown=nextjs:nodejs /app/scripts/seed-catalog.mjs ./scripts/seed-catalog.mjs
COPY --from=builder --chown=nextjs:nodejs /app/scripts/catalog-data.mjs ./scripts/catalog-data.mjs
COPY --from=builder --chown=nextjs:nodejs /app/scripts/run-catalog.mjs ./scripts/run-catalog.mjs
COPY --from=builder --chown=nextjs:nodejs /app/scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh
COPY --from=builder --chown=nextjs:nodejs /prisma-runtime ./node_modules

RUN chmod 755 ./scripts/docker-entrypoint.sh \
  && chown -R nextjs:nodejs /app /data

EXPOSE 3000
ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
