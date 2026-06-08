import html2canvas from 'html2canvas';
import { uploadImage } from './upload';
import api from './api';

export async function captureAndUploadThumbnail(
  canvasElement: HTMLElement,
  projectId: string,
): Promise<void> {
  try {
    const canvas = await html2canvas(canvasElement, {
      scale: 0.5,
      useCORS: true,
      logging: false,
    });

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.7);
    });

    if (!blob) {
      console.error('Thumbnail blob creation failed');
      return;
    }

    const file = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
    const uploadResult = await uploadImage(file);

    await api.patch(`/projects/${projectId}/thumbnail`, {
      thumbnailUrl: uploadResult.absoluteUrl,
    });
  } catch (error) {
    // Tüm fonksiyon try/catch içinde — herhangi bir hata sessizce yutulur, kullanıcıyı etkilemez
    console.error('Thumbnail capture or upload failed:', error);
  }
}
