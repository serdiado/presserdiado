import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { themeConfigs } from '../../db/schema/index.js';
import { defaultLightTheme, defaultDarkTheme } from '@matbaapro/shared';
import { ValidationError } from '../../lib/errors.js';

const modeSchema = z.enum(['light', 'dark']);

// UIThemeTokens ile birebir (packages/shared/src/types/ui-tokens.ts) — güvenlik taraması
// bulgusu: PUT eskiden request.body'yi hiç doğrulamadan DB'ye yazıyordu.
const typographyTokenSchema = z.object({
  fontSize: z.string(),
  fontWeight: z.string(),
  lineHeight: z.string(),
  letterSpacing: z.string(),
});
const themeTokensSchema = z.object({
  colors: z.object({
    primary: z.string(),
    primaryHover: z.string(),
    danger: z.string(),
    success: z.string(),
    warning: z.string(),
    surfaceApp: z.string(),
    surfacePanel: z.string(),
    surfaceSubtle: z.string(),
    borderDefault: z.string(),
    borderStrong: z.string(),
    borderSelected: z.string(),
    textPrimary: z.string(),
    textSecondary: z.string(),
    textMuted: z.string(),
  }),
  typography: z.object({
    fontFamilySans: z.string(),
    headingXl: typographyTokenSchema,
    navLabel: typographyTokenSchema,
    headingMd: typographyTokenSchema,
    headingSm: typographyTokenSchema,
    bodyMd: typographyTokenSchema,
    bodySm: typographyTokenSchema,
    bodyXs: typographyTokenSchema,
    labelMd: typographyTokenSchema,
    labelSm: typographyTokenSchema,
    iconLabel: typographyTokenSchema,
  }),
  radii: z.object({
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
    xl: z.string(),
    full: z.string(),
  }),
  shadows: z.object({
    dropSm: z.string(),
    dropMd: z.string(),
    dropLg: z.string(),
  }),
  buttons: z.object({
    radius: z.string(),
    height: z.string(),
  }),
});

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
  // GET bilinçli olarak PUBLIC kalır: ThemeInjector (apps/web/src/main.tsx) uygulamanın
  // KÖKÜNDE mount edilir ve tema token'larını (giriş yapmamış vitrin ziyaretçisi dahil)
  // HERKESİN tarayıcısına uygulamak için bu endpoint'i okur — admin'e kilitlersek site
  // genelinde tema sessizce varsayılana döner. Token'lar zaten her ziyaretçiye render
  // edilen, gizli olmayan görsel değerler (renk/tipografi) — okumanın riski yok.
  // Güvenlik düzeltmesi asıl YAZMA'yı (PUT) hedefliyor: önceden o da tamamen public'ti.
  app.get<{ Params: { mode: string } }>('/theme/:mode', async (request, reply) => {
    const parseResult = modeSchema.safeParse(request.params.mode);
    if (!parseResult.success) throw new ValidationError("mode must be 'light' or 'dark'");

    const mode = parseResult.data;
    const tokens = await ensureThemeExists(mode);
    return reply.send({ mode, tokens });
  });

  app.put<{ Params: { mode: string }; Body: unknown }>(
    '/theme/:mode',
    { onRequest: [app.authenticate, app.authorizeAdmin] },
    async (request, reply) => {
      const parseResult = modeSchema.safeParse(request.params.mode);
      if (!parseResult.success) throw new ValidationError("mode must be 'light' or 'dark'");
      const mode = parseResult.data;

      // Güvenlik düzeltmesi: önceden 'as Record<string, unknown>' ile hiç doğrulamadan
      // DB'ye yazılıyordu — artık gerçek UIThemeTokens şemasına uymayan gövde 400 ile reddedilir.
      const tokens = themeTokensSchema.parse(request.body);

      await ensureThemeExists(mode);
      await db
        .update(themeConfigs)
        .set({ tokens })
        .where(eq(themeConfigs.mode, mode));

      return reply.send({ mode, tokens });
    },
  );
}
