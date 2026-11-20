FROM node:22-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV AUTH_SECRET=change-me-before-sharing
RUN node scripts/ensure-env.mjs && npx prisma generate && npx prisma db push && npx tsx prisma/seed.ts && npm run build
EXPOSE 47291
CMD ["npm", "start"]
