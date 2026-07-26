# syntax=docker/dockerfile:1
# Turborepo standart deseni: prune -> install+build -> statik sunum (nginx).
# Build context KÖKTEN alınmalı: docker build -f apps/web/Dockerfile . (repo kökünden).
# Build-zamanı env (VITE_API_URL vb.) --build-arg ile geçilir (Vite bunları derleme anında
# bundle'a gömer, runtime'da değiştirilemez).

FROM node:20-slim AS base
RUN corepack enable

FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo@2.4.0
COPY . .
RUN turbo prune @matbaapro/web --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN corepack use pnpm@10.33.0 && pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
# turbo prune kök seviyesindeki tsconfig.base.json'u dahil etmiyor (her paketin tsconfig.json'u
# buna "extends" ile bağlı) — ayrıca kopyalanmazsa tsc "Cannot read file" ile patlar.
COPY tsconfig.base.json ./tsconfig.base.json

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN corepack use pnpm@10.33.0 && pnpm turbo build --filter=@matbaapro/web

FROM nginx:alpine AS runner
COPY --from=installer /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
