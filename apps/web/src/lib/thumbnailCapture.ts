import html2canvas from 'html2canvas-pro';
import { uploadImage } from './upload';
import api from './api';

/**
 * DOM üzerindeki canvas elemanından hızlıca resim (Blob) yakalar.
 *
 * html2canvas-pro kullanıyoruz çünkü:
 *  - oklch/lab/color() destekler (Tailwind v4 design token'ları oklch),
 *  - SVG foreignObject yerine doğrudan rasterize ettiği için çok sayfalı flex satır
 *    düzeni yatay korunur (dikey şerit sorunu çözülür),
 *  - useCORS ile cross-origin ürün görselleri (/uploads) eksiksiz çizilir.
 *
 * Bu işlem DOM'un ayakta olmasını gerektirir; ancak kaydetme akışını bloklamamak için
 * navigate sonrası arka planda (fire-and-forget) çağrılmalıdır — DOM unmount olmadığından
 * (navigate replace sonrası canvas yeniden render edilmez) yakalama güvenle tamamlanır.
 */
/**
 * `text-transform`u klonda DÜZLEŞTİRİR (metni dönüştürüp text-transform:none yapar).
 *
 * NEDEN: html2canvas-pro metni ölçerken dönüşmüş (uppercase) hâlinin uzunluğunu ORİJİNAL
 * metin düğümüne `Range.setEnd` ile uyguluyor. Çoğu dilde uppercase uzunluğu değiştirmediği
 * için bu fark edilmez — ama Almanca `ß` büyük harfte `SS` olur ve metin bir karakter uzar.
 *
 * GERÇEK OLAY (canlıda ölçüldü): bir broşürün dipnotundaki tek bir kelime — "ausschließlich"
 * (14 karakter) → "AUSSCHLIESSLICH" (15 karakter) — şu hatayı fırlatıyordu:
 *   IndexSizeError: Failed to execute 'setEnd' on 'Range': The offset 15 is larger than
 *   the node's length (14).
 * Bu hata yakalamanın TAMAMINI çökertiyordu, yani tek bir Almanca kelime yüzünden projenin
 * hiç önizlemesi oluşmuyordu (kullanıcı panelinde boş kart). Almanca ürün broşürü bu ürünün
 * ana senaryosu olduğu için bu nadir değil, tipik bir durum.
 *
 * YÖNTEM: computed style ORİJİNAL belgeden okunur (klon iframe'inde stiller henüz
 * güvenilir şekilde uygulanmamış olabilir), değişiklik KLONA yazılır. İki ağaç birebir kopya
 * olduğu için metin düğümleri aynı sırada gezilir.
 *
 * İKİ GEÇİŞ ŞART — tek geçiş sessizce yanlış çıktı üretiyordu: `text-transform` KALITSALDIR
 * ve dokunduğumuz eleman çoğu zaman tek bir metnin değil, tüm hücre içeriğinin kabıdır
 * (zengin metin, stilsiz run'ları çıplak metin düğümü + stilli run'ları <span> olarak AYNI
 * kabın altına koyar). Kaba 'none' yazıp kardeşleri "uzunlukları değişmiyor" diye atlayınca
 * o kardeşler büyük harfini KAYBEDİYORDU: ekranda "WEISSBIER PREMIUM", önizlemede
 * "WEISSBIER Premium". Bu yüzden önce hangi elemanların düzleştirileceğini topluyor,
 * sonra o elemanların ALT AĞACINDAKİ metinlerin TAMAMINI — uzunluğu değişmeyenler dahil —
 * dönüştürüyoruz. Hiç dokunulmayan dallar tarayıcının kendi dönüşümünü kullanmaya devam eder.
 */
export function duzlestirTextTransform(orijinalKok: HTMLElement, klonKok: HTMLElement): void {
  const orjYurutec = orijinalKok.ownerDocument.createTreeWalker(orijinalKok, NodeFilter.SHOW_TEXT);
  const klonYurutec = klonKok.ownerDocument.createTreeWalker(klonKok, NodeFilter.SHOW_TEXT);

  interface Aday {
    klon: Node;
    ebeveyn: HTMLElement;
    donusmus: string;
    uzunlukDegisti: boolean;
  }
  const adaylar: Aday[] = [];
  const kirliKoklar = new Set<HTMLElement>();

  let orj: Node | null;
  let klon: Node | null;
  while ((orj = orjYurutec.nextNode()) && (klon = klonYurutec.nextNode())) {
    const ham = orj.nodeValue;
    const ebeveyn = orj.parentElement;
    if (!ham || !ham.trim() || !ebeveyn) continue;

    const tt = getComputedStyle(ebeveyn).textTransform;
    if (tt !== 'uppercase' && tt !== 'lowercase') continue;

    const donusmus = tt === 'uppercase' ? ham.toUpperCase() : ham.toLowerCase();
    const uzunlukDegisti = donusmus.length !== ham.length;
    adaylar.push({ klon, ebeveyn, donusmus, uzunlukDegisti });
    if (uzunlukDegisti) kirliKoklar.add(ebeveyn);
  }

  if (kirliKoklar.size === 0) return;

  // Bir metin, kirli elemanlardan herhangi birinin altındaysa dönüştürülmeli: 'none'ı o
  // elemana yazacağımız için miras zinciri boyunca aşağıdaki HER metin etkilenir.
  const kirliAltindaMi = (el: HTMLElement): boolean => {
    for (let p: HTMLElement | null = el; p; p = p.parentElement) {
      if (kirliKoklar.has(p)) return true;
    }
    return false;
  };

  for (const aday of adaylar) {
    if (!aday.uzunlukDegisti && !kirliAltindaMi(aday.ebeveyn)) continue;
    aday.klon.nodeValue = aday.donusmus;
    (aday.klon.parentElement as HTMLElement | null)?.style.setProperty('text-transform', 'none');
  }
}

export async function captureThumbnailBlob(
  canvasElement: HTMLElement,
): Promise<Blob | null> {
  try {
    // Formanın tüm sayfalarını içeren kapsayıcıyı (#canvas) buluyoruz, bulamazsak fallback canvasElement.
    const targetElement = (canvasElement.querySelector('#canvas') as HTMLElement) || canvasElement;

    // Çıktının ~600px genişliğini geçmemesi için dinamik scale. offsetWidth CSS transform'dan
    // (fit-to-screen scale) etkilenmeyen gerçek layout genişliğidir; bu yüzden onu baz alıyoruz.
    const targetWidth = 600;
    const baseWidth = targetElement.offsetWidth || targetElement.getBoundingClientRect().width;
    const scale = baseWidth ? Math.min(1, targetWidth / baseWidth) : 0.5;

    const canvas = await html2canvas(targetElement, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      onclone: (clonedDocument) => {
        const clonedCanvas = clonedDocument.getElementById('canvas');
        if (clonedCanvas) {
          // Ekrandaki pan/zoom transform'unu sıfırlayıp klonu izole bir gövdeye taşıyoruz.
          clonedCanvas.style.transform = 'none';
          clonedCanvas.style.left = '0';
          clonedCanvas.style.top = '0';
          clonedCanvas.style.position = 'relative';
          clonedCanvas.style.margin = '0';
          clonedDocument.body.innerHTML = '';
          clonedDocument.body.appendChild(clonedCanvas);

          // ß→SS gibi uzunluk değiştiren uppercase dönüşümleri html2canvas-pro'yu çökertiyor
          // (bkz. duzlestirTextTransform). Klonu gezmeden ÖNCE düzleştir.
          duzlestirTextTransform(targetElement, clonedCanvas);
        }

        // Rehber çizgileri ve düzenleme yardımcıları (kırmızı/yeşil/mavi kesikli kılavuzlar,
        // hücre numaraları vb.) export'a sızmasın — bunları tüketen CSS olmadığından elle eliyoruz.
        clonedDocument
          .querySelectorAll('[data-hide-on-export]')
          .forEach((el) => el.remove());
        // Sayfa ayraç kenarlığı node'un kendisi sayfa olduğu için silmiyoruz; sadece kenarlığı kaldırıyoruz.
        clonedDocument
          .querySelectorAll('[data-hide-border-on-export]')
          .forEach((el) => {
            (el as HTMLElement).style.border = 'none';
          });
      },
    });

    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.7),
    );
  } catch (err) {
    console.error('Thumbnail capture failed:', err);
    return null;
  }
}

/**
 * Yakalanmış olan Blob verisini sunucuya yükler ve ilgili projenin thumbnail alanı ile ilişkilendirir.
 */
export async function uploadThumbnailBlob(
  blob: Blob,
  projectId: string,
): Promise<void> {
  try {
    const file = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
    const uploadResult = await uploadImage(file);
    await api.patch(`/projects/${projectId}/thumbnail`, {
      thumbnailUrl: uploadResult.absoluteUrl,
    });
  } catch (err) {
    console.error('Thumbnail upload failed:', err);
  }
}

/**
 * Yakalama + yükleme işlemini birlikte yürütür. Kaydetme akışını bloklamamak için
 * `void captureAndUploadThumbnail(...)` şeklinde arka planda çağrılmalıdır.
 * Blob üretilemezse (örn. ilk render kırılganlığı) sessizce geçer; kullanıcı bir sonraki
 * kayıtta yeniden dener.
 */
export async function captureAndUploadThumbnail(
  canvasElement: HTMLElement,
  projectId: string,
): Promise<void> {
  const blob = await captureThumbnailBlob(canvasElement);
  if (!blob) {
    console.warn('Thumbnail yakalanamadı (blob null); yükleme atlandı.');
    return;
  }
  await uploadThumbnailBlob(blob, projectId);
}
