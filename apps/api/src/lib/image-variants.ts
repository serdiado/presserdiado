// Ekran katmanı türevleri: yüklenen görselin küçük bir kopyasını üretir ve önbellekler.
//
// NEDEN: Stüdyo kanvası ürün görsellerini birkaç santimetrelik hücrelerde gösteriyor ama
// dosyalar tipik olarak 1500x1500 (~1,4 MB). Bir broşür formasında 40+ ürün olduğunda tek
// açılışta ~60 MB indiriliyor (canlıda ölçüldü: bir forma ~30 saniyede yükleniyordu).
// 512 px WebP türev aynı görüntüyü ~28 KB'a indiriyor (ölçülen ortalama, ~45 kat).
//
// KURALLAR:
// - Türev SAF ORANTILI küçültmedir: fit:'inside' + withoutEnlargement → aynı kırpma, aynı
//   en-boy oranı, aynı yön. Kanvasta çizim kutusu konteynerden geldiği için (Slot.tsx
//   w-full/h-full) ekran ile PDF arasında geometri farkı oluşmaz.
// - Orijinal dosyaya ASLA dokunulmaz. Türev her zaman silinebilir/yeniden üretilebilir bir
//   yan dosyadır; baskı yolu (Puppeteer) ve ileride kurulacak baskı-öncesi denetim sistemi
//   her zaman orijinali okur.
// - Alfa kanalı korunur (alphaQuality 100): ürün görselleri şeffaf kesimli PNG'ler ve renkli
//   zemin üzerine biniyorlar.
import { createHash } from 'node:crypto';
import { access, rename, unlink } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import sharp from 'sharp';

export const SCREEN_TIER = { maxEdge: 512, quality: 78 } as const;

const UPLOADS_ROOT = resolve(process.cwd(), 'uploads');

/** Aynı dosya için eşzamanlı üretimleri tek işe indirger (ilk açılışta 40+ istek gelebilir). */
const uretimde = new Map<string, Promise<string | null>>();

/** '/uploads/x/y.png' → diskteki mutlak yol. Uploads kökü dışına çıkarsa null. */
export function guvenliUploadYolu(imageKey: string): string | null {
  if (!imageKey.startsWith('/uploads/')) return null;
  const cozulmus = resolve(process.cwd(), '.' + imageKey);
  if (cozulmus !== UPLOADS_ROOT && !cozulmus.startsWith(UPLOADS_ROOT + sep)) return null;
  return cozulmus;
}

/** Orijinalin yanında duran türev dosyasının yolu: foto.png → foto.png.screen.webp */
export function turevYolu(orijinalMutlakYol: string): string {
  return `${orijinalMutlakYol}.screen.webp`;
}

/**
 * Türev yoksa üretir, varsa doğrudan yolunu döndürür.
 * Üretilemeyen her durumda (bozuk dosya, desteklenmeyen biçim, sharp hatası) null döner —
 * çağıran taraf orijinali servis etmelidir. Görsel HİÇBİR ZAMAN 404 olmamalı.
 */
export async function ekranTureviGetir(orijinalMutlakYol: string): Promise<string | null> {
  // SVG vektörel: küçültmenin anlamı yok, rasterleştirmek kaliteyi düşürür.
  if (extname(orijinalMutlakYol).toLowerCase() === '.svg') return null;

  const hedef = turevYolu(orijinalMutlakYol);
  try {
    await access(hedef);
    return hedef; // zaten üretilmiş
  } catch {
    // yok — üretilecek
  }

  const mevcutIs = uretimde.get(hedef);
  if (mevcutIs) return mevcutIs;

  const is = (async (): Promise<string | null> => {
    // Atomik yazım: aynı dizine geçici ad, sonra rename. Yarım yazılmış dosya servis edilmez.
    const gecici = `${hedef}.${createHash('sha1').update(hedef).digest('hex').slice(0, 8)}.tmp`;
    try {
      await sharp(orijinalMutlakYol)
        // EXIF Orientation'ı PİKSELLERE uygula — WYSIWYG için ZORUNLU, kaldırmayın.
        //
        // NEDEN: sharp varsayılan olarak ne otomatik döndürür ne de EXIF'i çıktıya kopyalar.
        // Tarayıcı ise `image-orientation: from-image` başlangıç değeriyle ORİJİNAL JPEG'i
        // EXIF'e göre döndürerek çizer. Ekran türevi (bu dosya) ile baskı (orijinal, /print-view)
        // farklı katman çektiği için sonuç şu olurdu: telefonla çekilmiş bir ürün fotoğrafı
        // stüdyoda YAN YATIK, üretim PDF'inde DİK. Kullanıcı yatık hâle göre kadraj/ölçek
        // düzeltmesi yapar, o düzeltme dik görselin üstüne biner ve hata ancak matbaada
        // fark edilir (dondurma idempotent olduğu için kendiliğinden de düzelmez).
        //
        // Ölçüldü: 400x300 saklanmış + Orientation=6 bir JPEG için
        //   orijinal (tarayıcıda) → 300x400 DİK
        //   türev (.rotate YOKken) → 400x300 YATAY   ← uyumsuz
        //   türev (.rotate varken) → 300x400 DİK     ← uyumlu
        // resize'dan ÖNCE gelmeli: yön düzeldikten sonra 'inside' kutusu doğru kenara oturur.
        .rotate()
        .resize({
          width: SCREEN_TIER.maxEdge,
          height: SCREEN_TIER.maxEdge,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: SCREEN_TIER.quality, alphaQuality: 100 })
        .toFile(gecici);
      await rename(gecici, hedef);
      return hedef;
    } catch {
      await unlink(gecici).catch(() => undefined);
      return null;
    } finally {
      uretimde.delete(hedef);
    }
  })();

  uretimde.set(hedef, is);
  return is;
}

/** Orijinal silinirken türevi de sil (yetim dosya bırakma). */
export async function turevleriSil(orijinalMutlakYol: string): Promise<void> {
  await unlink(turevYolu(orijinalMutlakYol)).catch(() => undefined);
}

/** Bir dosyanın kendisi türev mi? (backfill ve listelemelerde atlanmalı) */
export function turevMi(dosyaYolu: string): boolean {
  return dosyaYolu.endsWith('.screen.webp');
}
