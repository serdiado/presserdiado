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
