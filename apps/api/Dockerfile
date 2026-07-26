# syntax=docker/dockerfile:1
# Turborepo standart deseni: prune -> install+build -> runtime (bkz. turbo.build docs).
# Build context KÖKTEN alınmalı: docker build -f apps/api/Dockerfile . (repo kökünden).

FROM node:20-slim AS base
RUN corepack enable

# --- 1) Prune: yalnızca @matbaapro/api'nin ihtiyaç duyduğu workspace alt kümesini çıkar ---
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo@2.4.0
COPY . .
RUN turbo prune @matbaapro/api --docker

# --- 2) Install + build: önce sadece package.json'lar (katman önbelleği), sonra kaynak ---
FROM base AS installer
WORKDIR /app
# bcrypt native derleme gerektirebilir (prebuilt binary yoksa) — sadece bu aşamada.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY --from=pruner /app/out/json/ .
RUN corepack use pnpm@10.33.0 && pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
# turbo prune paket kaynaklarını taşır ama kök seviyesindeki (herhangi bir workspace paketine
# ait olmayan) tsconfig.base.json'u DAHIL ETMEZ — her paketin tsconfig.json'u buna "extends"
# ile bağlı, o yüzden ayrıca kopyalanmalı (yoksa tsc "Cannot read file" ile patlar).
COPY tsconfig.base.json ./tsconfig.base.json
# seed.ts/seed-turmatsan.ts docs/vitrin/*.json'u (kâr marjı config'i + turmatsan referans
# verisi) __dirname'den GÖRECELİ okuyor — turbo prune workspace-dışı bu klasörü taşımaz,
# ayrıca kopyalanmazsa `pnpm db:seed` container içinde ENOENT ile patlar (canlı doğrulamada
# YAKALANDI). Yalnızca ilk kurulumda / db:seed çalıştırıldığında gerekli, ama runtime imajından
# çıkarmaya değecek kadar büyük değil.
COPY docs/vitrin ./docs/vitrin
RUN corepack use pnpm@10.33.0 && pnpm turbo build --filter=@matbaapro/api

# --- 3) Runtime: Puppeteer için Debian chromium + gerekli paylaşımlı kütüphaneler ---
FROM base AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
  chromium fonts-liberation ca-certificates \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
  libpango-1.0-0 libpangocairo-1.0-0 libcairo2 \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
WORKDIR /app
COPY --from=installer /app .
# process.cwd() ile server.ts'in "uploads" klasörünü aradığı yer BURASI olmalı (yerel dev'de
# tsx watch src/server.ts de apps/api/ içinden çalışır, cwd orada) — docker-compose.prod.yml'in
# api_uploads hacmi de /app/apps/api/uploads'a bağlanıyor, ikisi eşleşmezse yüklenen görseller
# kalıcı hacme değil geçici bir yere gider (canlı doğrulamada YAKALANDI, bkz. Faz 2 notları).
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/server.js"]
