// Yerel uploads diskinden dosya silme — path-traversal güvenli.
// Güvenlik taraması bulgusu: eski implementasyon yalnız imageKey.startsWith('/uploads/')
// kontrolü yapıyordu; bu salt string ön-eki kontrolüdür, path.join'in '..' segmentlerini
// normalize etmesini ENGELLEMEZ. path.resolve ile gerçek yolu çözüp uploads kökü altında
// kaldığını doğruluyoruz — aksi halde no-op (silme yapılmaz).
import { unlink } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

const UPLOADS_ROOT = resolve(process.cwd(), 'uploads');

export async function deleteUploadFile(imageKey: string | null | undefined): Promise<void> {
  if (!imageKey || !imageKey.startsWith('/uploads/')) return;
  const resolved = resolve(process.cwd(), '.' + imageKey);
  if (resolved !== UPLOADS_ROOT && !resolved.startsWith(UPLOADS_ROOT + sep)) return;
  try {
    await unlink(resolved);
  } catch {
    // ENOENT vb. — sessiz geç.
  }
}
