import { toBlob } from 'html-to-image';
import { uploadImage } from './upload';
import api from './api';

export async function captureAndUploadThumbnail(
  canvasElement: HTMLElement,
  projectId: string,
): Promise<void> {
  try {
    const blob = await toBlob(canvasElement, {
      quality: 0.7,
      pixelRatio: 0.5,
      cacheBust: false,
    });
    if (!blob) return;
    const file = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
    const uploadResult = await uploadImage(file);
    await api.patch(`/projects/${projectId}/thumbnail`, {
      thumbnailUrl: uploadResult.absoluteUrl,
    });
  } catch (err) {
    console.error('Thumbnail capture or upload failed:', err);
  }
}
