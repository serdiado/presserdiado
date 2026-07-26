// File upload helper. POSTs to /api/v1/upload, returns absolute URL.

import api from './api';
import { apiOrigin } from './apiOrigin';

export interface UploadResult {
  url: string;
  absoluteUrl: string;
  size: number;
  mimeType: string;
}

// toAbsoluteUrl artık './apiOrigin' içinde: bu dosya `./api`yi (axios + interceptor'lar)
// import ettiği için, modül yükleme anında çalışan kodun (normalizeLegacyAppearance) buradan
// import etmesi dairesel bağımlılık → TDZ hatası üretiyordu. Mevcut çağrı yerleri bozulmasın
// diye buradan yeniden dışa aktarılıyor.
export { toAbsoluteUrl } from './apiOrigin';

export async function uploadImage(file: File): Promise<UploadResult> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await api.post<{ url: string; size: number; mimeType: string }>(
    '/upload',
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return { ...res.data, absoluteUrl: apiOrigin + res.data.url };
}
