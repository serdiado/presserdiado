// Dosya adı → SKU eşleştirme ekranlarının (yükleme sihirbazı Adım 2 + RematchModal) ortak
// sunum/yardımcıları. Saf eşleştirme kuralları @matbaapro/shared'dadır.

import { CheckCircle, HelpCircle } from 'lucide-react';
import { normalizeSku } from '@matbaapro/shared';

export interface MatchRow {
  id: string;
  fileName: string;
  url: string;           // relative imageKey (/uploads/...)
  isTransparent: boolean;
  sku: string;           // seçili SKU ('' = atanmadı)
  isPng?: boolean;       // yükleme akışında PNG opaklık uyarısı için
}

export type RowState = 'matched' | 'none';

// Satırın anlık durumu: seçili SKU varsa eşleşti, yoksa eşleşmedi.
export function rowState(r: { sku: string }): RowState {
  return r.sku.trim() ? 'matched' : 'none';
}

// Her satır için sortOrder hesapla: o SKU'nun mevcut en yüksek sortOrder'ı baz alınır,
// üstüne bu oturumda aynı SKU'ya atanan resimler için artan sıra eklenir (base+1, base+2...).
// SKU'su olmayan satır 0 alır. existingMaxBySku anahtarları normalize edilmiştir.
export function computeSortOrders(
  rows: { id: string; sku: string }[],
  existingMaxBySku: Map<string, number>,
): Map<string, number> {
  const used = new Map<string, number>();
  const result = new Map<string, number>();
  for (const r of rows) {
    const sku = r.sku.trim();
    if (!sku) {
      result.set(r.id, 0);
      continue;
    }
    const key = normalizeSku(sku);
    const seen = used.get(key) ?? 0;
    const base = existingMaxBySku.get(key) ?? 0;
    result.set(r.id, base + seen + 1);
    used.set(key, seen + 1);
  }
  return result;
}

// Eşleşti / Eşleşmedi rozeti.
export function matchBadge(state: RowState) {
  return state === 'matched' ? (
    <span className="inline-flex items-center gap-1 text-body-xs text-success">
      <CheckCircle size={14} /> Eşleşti
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-body-xs text-danger">
      <HelpCircle size={14} /> Eşleşmedi
    </span>
  );
}
