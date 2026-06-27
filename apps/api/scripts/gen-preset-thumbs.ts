// Tüm hazır şablonların (StudioPreset) önizleme JPG'lerini üretir.
// Puppeteer ile /preset-preview?id=<id> izole render'ına gidip screenshot alır ve
// apps/web/public/presets/<id>.jpg olarak yazar. export.service.ts ile aynı desen.
//
// ÖNKOŞUL: web uygulaması config.web.baseUrl'de (varsayılan http://localhost:5173)
// AYAKTA olmalı. Çalıştır:
//
//   pnpm --filter @matbaapro/api gen:preset-thumbs
//
// Preset değiştiğinde/eklendiğinde tekrar çalıştır (önizlemeler statiktir).

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import puppeteer from 'puppeteer';
import { config } from '../src/config.js';

const MM_TO_PX = 96 / 25.4;
// Template2 (tek kırım) Forma 1 = 2 sayfa × 210mm + bleed (2mm) × 2 yanaktan; yükseklik 297 + 2×2.
const SPREAD_WIDTH_MM = 210 * 2 + 2 * 2;
const SPREAD_HEIGHT_MM = 297 + 2 * 2;
const DEVICE_SCALE = 2; // net (retina) çıktı

const __dirname = dirname(fileURLToPath(import.meta.url));
// apps/api/scripts → apps/web/public/presets
const OUT_DIR = resolve(__dirname, '../../web/public/presets');

async function main(): Promise<void> {
  const baseUrl = config.web.baseUrl;
  const widthPx = Math.ceil(SPREAD_WIDTH_MM * MM_TO_PX);
  const heightPx = Math.ceil(SPREAD_HEIGHT_MM * MM_TO_PX);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });

  try {
    await mkdir(OUT_DIR, { recursive: true });

    // 1) Preset id listesini izole route'tan oku (tek kaynak: studioPresets.ts).
    const idxPage = await browser.newPage();
    await idxPage.goto(`${baseUrl}/preset-preview`, { waitUntil: 'networkidle0', timeout: 60000 });
    await idxPage.waitForSelector('#preset-preview-ready', { timeout: 60000 });
    const ids: string[] = await idxPage.evaluate(
      () => (window as unknown as { __PRESET_IDS__?: string[] }).__PRESET_IDS__ ?? [],
    );
    await idxPage.close();

    if (!ids.length) {
      throw new Error('Preset listesi boş (window.__PRESET_IDS__ okunamadı).');
    }

    // 2) Her preset için izole render → screenshot → JPG.
    for (const id of ids) {
      const page = await browser.newPage();
      await page.setViewport({ width: widthPx, height: heightPx, deviceScaleFactor: DEVICE_SCALE });
      await page.goto(`${baseUrl}/preset-preview?id=${encodeURIComponent(id)}`, {
        waitUntil: 'networkidle0',
        timeout: 60000,
      });
      await page.waitForSelector('#preset-preview-ready', { timeout: 60000 });

      const buf = (await page.screenshot({
        type: 'jpeg',
        quality: 85,
        clip: { x: 0, y: 0, width: widthPx, height: heightPx },
      })) as Buffer;
      await page.close();

      const outPath = resolve(OUT_DIR, `${id}.jpg`);
      await writeFile(outPath, buf);
      console.log(`✓ ${id}.jpg (${Math.round(buf.length / 1024)} KB)`);
    }

    console.log(`\n${ids.length} önizleme üretildi → ${OUT_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Önizleme üretimi başarısız:', err);
  process.exit(1);
});
