import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authService } from './auth.service.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

// Güvenlik taraması bulgusu: brute-force / credential-stuffing (login) ve e-posta
// enumeration (register'ın 409 yanıtı) için özel, sıkı bir hız sınırı — server.ts'teki
// genel 200/dk varsayılanından bağımsız, IP başına çok daha düşük bir tavan.
const STRICT_AUTH_RATE_LIMIT = { rateLimit: { max: 5, timeWindow: '15 minutes' } };

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', { config: STRICT_AUTH_RATE_LIMIT }, async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const result = await authService.register(body, app);
    return reply.status(201).send(result);
  });

  app.post('/auth/login', { config: STRICT_AUTH_RATE_LIMIT }, async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const result = await authService.login(body, app);
    return reply.send(result);
  });

  app.post('/auth/refresh', async (request, reply) => {
    const body = refreshSchema.parse(request.body);
    const result = await authService.refresh(body.refreshToken, app);
    return reply.send(result);
  });

  app.get(
    '/auth/me',
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const user = await authService.getProfile(request.user.id);
      return reply.send(user);
    },
  );
}
