// File upload — single image to local disk (MinIO/S3 ileride takılacak).
// Returns a public URL pointing at /uploads/<filename> served by @fastify/static.

import { writeFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';

const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);
const MAX_SIZE_MB = 20;

export async function uploadRoutes(app: FastifyInstance) {
  app.post(
    '/upload',
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const file = await req.file({ limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 } });
      if (!file) return reply.status(400).send({ error: 'No file uploaded' });

      const ext = extname(file.filename).toLowerCase();
      if (!ALLOWED_EXT.has(ext)) {
        return reply.status(415).send({
          error: `Unsupported extension. Allowed: ${[...ALLOWED_EXT].join(', ')}`,
        });
      }

      const buffer = await file.toBuffer();
      if (buffer.length === 0) {
        return reply.status(400).send({ error: 'Empty file' });
      }

      const userId = (req.user as { id?: string } | undefined)?.id ?? 'anon';
      const dir = join(process.cwd(), 'uploads', userId);
      await mkdir(dir, { recursive: true });

      const baseName = file.filename.slice(0, -ext.length) || 'urun';
      const charMap: Record<string, string> = {
        'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G',
        'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O',
        'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U'
      };
      const sanitizedSku = baseName
        .replace(/[çÇğĞıİöÖşŞüÜ]/g, (match) => charMap[match] || match)
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'urun';

      const id = randomBytes(5).toString('hex'); // 10 characters
      const filename = `${id}_${sanitizedSku}${ext}`;
      const filepath = join(dir, filename);
      await writeFile(filepath, buffer);

      const publicUrl = `/uploads/${userId}/${filename}`;
      return { url: publicUrl, size: buffer.length, mimeType: file.mimetype };
    },
  );
}
