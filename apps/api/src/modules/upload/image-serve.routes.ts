// GET /img/screen/<uploads-yolu>  → görselin ekran boyutundaki türevini servis eder.
//
// /api/v1 ÖN EKİ DIŞINDA kayıtlıdır (tıpkı /uploads/ gibi): bunlar <img src> ile çekilen
// statik varlıklar, JSON API uçları değil.
//
// TASARIM KURALI — BU UÇ ASLA 404 VERMEZ: türev yoksa üretilir; üretilemezse (bozuk dosya,
// desteklenmeyen biçim, sharp hatası) ORİJİNAL dosya stream edilir. Böylece düşük çözünürlük
// katmanı hiçbir koşulda "resim kayboldu"ya dönüşemez; en kötü ihtimalle bugünkü davranışa
// (tam boyut) düşülür.
import type { FastifyInstance } from 'fastify';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname } from 'node:path';
import { ekranTureviGetir, guvenliUploadYolu } from '../../lib/image-variants.js';

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

export async function imageServeRoutes(app: FastifyInstance) {
  app.get('/img/:tier/*', async (request, reply) => {
    const { tier } = request.params as { tier: string };
    const kalan = (request.params as Record<string, string>)['*'] ?? '';

    if (tier !== 'screen') {
      return reply.status(400).send({ error: 'Bilinmeyen görsel katmanı' });
    }

    // '/uploads/' ön eki ile birleştirip path-traversal denetiminden geçir.
    const imageKey = '/uploads/' + kalan;
    const orijinal = guvenliUploadYolu(imageKey);
    if (!orijinal) {
      return reply.status(400).send({ error: 'Geçersiz görsel yolu' });
    }

    try {
      await stat(orijinal);
    } catch {
      return reply.status(404).send({ error: 'Görsel bulunamadı' });
    }

    const turev = await ekranTureviGetir(orijinal);
    const servisEdilecek = turev ?? orijinal;
    const uzanti = extname(servisEdilecek).toLowerCase();

    reply.header('Content-Type', MIME[uzanti] ?? 'application/octet-stream');
    reply.header('X-Content-Type-Options', 'nosniff');
    // Dosya adları içerik-adresli (rastgele ön ek + özgün ad) ve üzerine yazılmıyor →
    // güvenle uzun süre önbelleklenebilir. Türev, orijinali değiştiğinde yeni bir ada sahip
    // olacağı için bayatlama riski yok.
    reply.header('Cache-Control', 'public, max-age=31536000, immutable');
    // Türev üretilemediyse istemci tam boyutlu dosya aldığını bilsin (teşhis kolaylığı).
    reply.header('X-Image-Tier', turev ? 'screen' : 'original-fallback');

    return reply.send(createReadStream(servisEdilecek));
  });
}
