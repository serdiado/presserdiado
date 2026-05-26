import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { themeConfigs } from '../../db/schema/index.js';
import { defaultLightTheme, defaultDarkTheme } from '@matbaapro/shared';
import { ValidationError } from '../../lib/errors.js';

const modeSchema = z.enum(['light', 'dark']);

function defaultForMode(mode: 'light' | 'dark') {
  return mode === 'dark' ? defaultDarkTheme : defaultLightTheme;
}

async function ensureThemeExists(mode: 'light' | 'dark') {
  const existing = await db
    .select()
    .from(themeConfigs)
    .where(eq(themeConfigs.mode, mode))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(themeConfigs).values({
      mode,
      tokens: defaultForMode(mode),
    });
    return defaultForMode(mode);
  }
  return existing[0].tokens;
}

export async function themeRoutes(app: FastifyInstance) {
  app.get<{ Params: { mode: string } }>('/theme/:mode', async (request, reply) => {
    const parseResult = modeSchema.safeParse(request.params.mode);
    if (!parseResult.success) throw new ValidationError("mode must be 'light' or 'dark'");

    const mode = parseResult.data;
    const tokens = await ensureThemeExists(mode);
    return reply.send({ mode, tokens });
  });

  app.put<{ Params: { mode: string } }>('/theme/:mode', async (request, reply) => {
    const parseResult = modeSchema.safeParse(request.params.mode);
    if (!parseResult.success) throw new ValidationError("mode must be 'light' or 'dark'");

    const mode = parseResult.data;
    const tokens = request.body as Record<string, unknown>;

    await ensureThemeExists(mode);
    await db
      .update(themeConfigs)
      .set({ tokens })
      .where(eq(themeConfigs.mode, mode));

    return reply.send({ mode, tokens });
  });
}
