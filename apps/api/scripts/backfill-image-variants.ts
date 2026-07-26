// Mevcut yüklenmiş görseller için ekran türevlerini toplu üretir.
//
// NEDEN ZORUNLU: /img/screen/* uç noktası türev yoksa onu ANINDA üretir; bu güvenlik ağı
// olmadan uygulama bozulurdu ama ilk açılışta onlarca görselin aynı anda üretilmesi ilk
// deneyimi BUGÜNKÜNDEN YAVAŞ yapar. Deploy'dan hemen sonra bir kez çalıştırılmalı.
//
// Özellikler: idempotent (mevcut türevi atlar), kesilirse kaldığı yerden devam eder,
// sınırlı eşzamanlılık (sunucuyu boğmaz), tek tek hataları yutar (bozuk bir dosya tüm
// işi durdurmaz).
//
//   çalıştırma: npx tsx scripts/backfill-image-variants.ts [eszamanlilik]
import { readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { ekranTureviGetir, turevMi } from '../src/lib/image-variants.js';

const UPLOADS_ROOT = resolve(process.cwd(), 'uploads');
const ESZAMANLILIK = Math.max(1, Number(process.argv[2]) || 4);
const ISLENEBILIR = /\.(png|jpe?g|webp|gif)$/i;

async function* dosyalariGez(dizin: string): AsyncGenerator<string> {
  let girisler;
  try {
    girisler = await readdir(dizin, { withFileTypes: true });
  } catch {
    return;
  }
  for (const giris of girisler) {
    const tamYol = join(dizin, giris.name);
    if (giris.isDirectory()) {
      yield* dosyalariGez(tamYol);
    } else if (giris.isFile() && ISLENEBILIR.test(giris.name) && !turevMi(giris.name)) {
      yield tamYol;
    }
  }
}

async function main() {
  try {
    await stat(UPLOADS_ROOT);
  } catch {
    console.error(`uploads klasörü bulunamadı: ${UPLOADS_ROOT}`);
    process.exit(1);
  }

  const dosyalar: string[] = [];
  for await (const d of dosyalariGez(UPLOADS_ROOT)) dosyalar.push(d);

  console.log(`${dosyalar.length} görsel bulundu. Eşzamanlılık: ${ESZAMANLILIK}`);
  const baslangic = Date.now();
  let uretildi = 0;
  let atlandi = 0;
  let basarisiz = 0;
  let sirada = 0;

  async function isci() {
    while (sirada < dosyalar.length) {
      const dosya = dosyalar[sirada++];
      const oncekiVarlik = await stat(dosya + '.screen.webp').then(
        () => true,
        () => false,
      );
      const sonuc = await ekranTureviGetir(dosya);
      if (sonuc === null) basarisiz++;
      else if (oncekiVarlik) atlandi++;
      else uretildi++;

      const islenen = uretildi + atlandi + basarisiz;
      if (islenen % 250 === 0) {
        console.log(`  ${islenen}/${dosyalar.length} …`);
      }
    }
  }

  await Promise.all(Array.from({ length: ESZAMANLILIK }, isci));

  const sn = ((Date.now() - baslangic) / 1000).toFixed(1);
  console.log(
    `Tamamlandı (${sn} sn): ${uretildi} üretildi, ${atlandi} zaten vardı, ${basarisiz} üretilemedi.`,
  );
  if (basarisiz > 0) {
    console.log('Not: üretilemeyenler /img/screen/* isteğinde orijinaline düşer — kayıp yok.');
  }
}

main().catch((err) => {
  console.error('Backfill hatası:', err);
  process.exit(1);
});
