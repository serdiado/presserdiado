import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import staticPlugin from '@fastify/static';
import { join } from 'node:path';
import { config } from './config.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { catalogRoutes } from './modules/catalog/catalog.routes.js';
import { projectRoutes } from './modules/project/project.routes.js';
import { exportRoutes } from './modules/export/export.routes.js';
import { uploadRoutes } from './modules/upload/upload.routes.js';
import { themeRoutes } from './modules/theme/theme.routes.js';
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
await app.register(cors, { origin: config.cors.origin, credentials: true });
await app.register(jwt, { secret: config.jwt.secret });
await app.register(multipart, { limits: { fileSize: 25 * 1024 * 1024 } });
await app.register(staticPlugin, {
  root: join(process.cwd(), 'uploads'),
  prefix: '/uploads/',
  decorateReply: false,
});

// Auth decorator
app.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    request.log.debug(err, 'JWT verification failed');
    return reply.status(401).send({ error: 'Unauthorized' });
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

  request.log.error(error);
  return reply.status(500).send({ error: 'Internal server error' });
});

// Routes
await app.register(
  async (api) => {
    await api.register(authRoutes);
    await api.register(catalogRoutes);
    await api.register(projectRoutes);
    await api.register(exportRoutes);
    await api.register(uploadRoutes);
    await api.register(themeRoutes);
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
