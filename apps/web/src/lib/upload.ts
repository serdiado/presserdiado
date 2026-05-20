// File upload helper. POSTs to /api/v1/upload, returns absolute URL.

import api from './api';

export interface UploadResult {
  url: string;
  absoluteUrl: string;
  size: number;
  mimeType: string;
}

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1')
  .replace(/\/api\/v\d+\/?$/, '');

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
