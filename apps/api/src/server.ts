import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import staticPlugin from '@fastify/static';
import rateLimit from '@fastify/rate-limit';
import { join } from 'node:path';
import { config } from './config.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { projectRoutes } from './modules/project/project.routes.js';
import { exportRoutes } from './modules/export/export.routes.js';
import { uploadRoutes } from './modules/upload/upload.routes.js';
import { themeRoutes } from './modules/theme/theme.routes.js';
import { productsRoutes } from './modules/products/routes.js';
import { productImagesRoutes } from './modules/product-images/routes.js';
import { mediaAssetsRoutes } from './modules/media-assets/routes.js';
import { billingRoutes } from './modules/billing/billing.routes.js';
import { pricingRoutes } from './modules/pricing/pricing.routes.js';
import { printCatalogRoutes } from './modules/print-catalog/print-catalog.routes.js';
import { orderRoutes } from './modules/orders/order.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { db } from './db/index.js';
import { users } from './db/schema/index.js';
import { eq } from 'drizzle-orm';
import { AppError } from './lib/errors.js';
import { ZodError } from 'zod';

const app = Fastify({
  bodyLimit: 10 * 1024 * 1024, // 10MB — catalogState payload can be large
  logger: {
    level: config.nodeEnv === 'production' ? 'info' : 'debug',
    transport:
      config.nodeEnv === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  },
});

// Plugins
await app.register(cors, {
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});
await app.register(jwt, { secret: config.jwt.secret });
// Güvenlik taraması bulgusu: /auth/login ve /auth/register'da hiç hız sınırlaması yoktu
// (brute-force / credential-stuffing / e-posta enumeration riski). Genel varsayılan ölçülü;
// auth.routes.ts'teki login/register route'ları ayrıca kendi config'inde daha sıkı bir limit
// tanımlıyor (bkz. o dosya).
await app.register(rateLimit, {
  global: true,
  max: 200,
  timeWindow: '1 minute',
  // /uploads/* düz statik dosya sunumu — DB sorgusu/iş yükü yok, kimlik doğrulaması da
  // gerektirmiyor; brute-force/DoS anlamında hassas bir "API isteği" değil. Bu ürünün ana
  // senaryosu (çok ürünlü broşür) tek proje açılışında onlarca-yüzlerce ürün görseli getiriyor;
  // bunlar aynı sayaca dahil edilince NORMAL kullanım bile sınırı aşıyordu (canlı doğrulandı:
  // 50-100 ürünlü bir proje açmak tek başına dakikalık limiti tüketiyordu).
  allowList: (request) => request.url.startsWith('/uploads/'),
});
await app.register(multipart, { limits: { fileSize: 25 * 1024 * 1024 } });
await app.register(staticPlugin, {
  root: join(process.cwd(), 'uploads'),
  prefix: '/uploads/',
  decorateReply: false,
  // Güvenlik taraması bulgusu: yüklenen dosyalar (özellikle .svg — script içerebilir)
  // hiçbir header olmadan serve ediliyordu. nosniff, tarayıcının içerik-tipini
  // "koklayıp" script çalıştırmasını engeller; SVG'lere ayrıca inline render yerine
  // indirme zorlanır (URL doğrudan yeni sekmede açılsa bile script tetiklenmez).
  setHeaders: (res, path) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (path.toLowerCase().endsWith('.svg')) {
      res.setHeader('Content-Disposition', 'attachment');
    }
  },
});

// Auth decorator
app.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    request.log.debug(err, 'JWT verification failed');
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  // Güvenlik taraması bulgusu: refresh token (7 gün ömürlü, type:'refresh' claim'i taşır)
  // imza doğrulamasından geçtiği için access token yerine her korumalı route'ta
  // kullanılabiliyordu. Yalnızca 'type' alanı olmayan (gerçek access) token'lar kabul edilir.
  if ((request.user as { type?: string } | undefined)?.type) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
});

// Admin yetki decorator — authenticate'ten SONRA çalışmalı (request.user.id gerekir).
// Rol her istekte DB'den okunur (JWT'ye gömülmez → bayatlamaz, anlık iptal mümkün).
app.decorate('authorizeAdmin', async function (request: any, reply: any) {
  const row = await db.query.users.findFirst({
    where: eq(users.id, request.user.id),
    columns: { role: true },
  });
  if (row?.role !== 'admin') {
    return reply.status(403).send({ error: 'Forbidden' });
  }
});

// Error handler
app.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ error: error.message });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'Validation error',
      details: error.errors,
    });
  }

  // Fastify eklentilerinin kendi statusCode'u ile fırlattığı hatalar (ör. @fastify/rate-limit'in
  // 429'u) — güvenlik taraması bulgusu: bunlar öncesinde tanınmayıp genel 500'e düşüyordu.
  const pluginError = error as { statusCode?: number; message: string };
  if (
    typeof pluginError.statusCode === 'number' &&
    pluginError.statusCode >= 400 &&
    pluginError.statusCode < 500
  ) {
    return reply.status(pluginError.statusCode).send({ error: pluginError.message });
  }

  request.log.error(error);
  return reply.status(500).send({ error: 'Internal server error' });
});

// Routes
await app.register(
  async (api) => {
    await api.register(authRoutes);
    await api.register(projectRoutes);
    await api.register(exportRoutes);
    await api.register(uploadRoutes);
    await api.register(themeRoutes);
    await api.register(productsRoutes);
    await api.register(productImagesRoutes);
    await api.register(mediaAssetsRoutes);
    await api.register(billingRoutes);
    await api.register(pricingRoutes);
    await api.register(printCatalogRoutes);
    await api.register(orderRoutes);
    await api.register(adminRoutes);
  },
  { prefix: '/api/v1' },
);

// Health check
app.get('/health', async () => ({ status: 'ok' }));

// Start
try {
  await app.listen({ port: config.port, host: config.host });
  console.log(`🚀 MatbaaPro API running on http://${config.host}:${config.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
