// Toplu ürün resmi yükleme + akıllı SKU eşleştirme — 3 adımlı wizard.
// Modal kabuğu ExcelImportModal.tsx paternini referans alır.
// Adım 1: paralel toplu yükleme (max 5) + PNG şeffaflık analizi
// Adım 2: dosya adından SKU tam eşleştirme + elle düzeltme (sortOrder otomatik)
// Adım 3: özet

import React, { useMemo, useRef, useState } from 'react';
import {
  X, Loader2, ImagePlus, UploadCloud, CheckCircle2,
  AlertTriangle, CheckCircle, Download, RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import { normalizeSku, guessSkuFromFileName, matchSku } from '@matbaapro/shared';
import api from '@/lib/api';
import { toAbsoluteUrl } from '@/lib/upload';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { SkuCombobox, type SkuOption } from './SkuCombobox';
import { type MatchRow, rowState, computeSortOrders, matchBadge } from './imageSkuMatch';

interface ProductImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

type Step = 1 | 2 | 3;
const MAX_CONCURRENT = 5;
const ACCEPT = 'image/jpeg,image/png,image/webp';

type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

interface UploadItem {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  url?: string;          // relative imageKey (/uploads/...)
  error?: string;        // hata nedeni (status === 'error' iken)
  isPng: boolean;
  isTransparent: boolean;
}

interface SaveResult {
  matched: number;  // SKU atanmış kaydedilen
  noSku: number;    // SKU atanmadan kaydedilen
  replaced: number; // aynı dosya adıyla üzerine yazılan
}

// Dosya adı → SKU eşleştirme yardımcıları artık @matbaapro/shared'da (normalizeSku,
// guessSkuFromFileName, matchSku) — web ve api aynı kuralı kullanır.

// PNG'nin 4 köşe pikselini canvas ile analiz et — herhangi biri yarı saydamsa şeffaf.
function analyzeTransparency(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) {
          resolve(false);
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(false);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const corners = [
          [0, 0],
          [w - 1, 0],
          [0, h - 1],
          [w - 1, h - 1],
        ];
        const transparent = corners.some(([x, y]) => ctx.getImageData(x, y, 1, 1).data[3] < 255);
        resolve(transparent);
      } catch {
        resolve(false);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    img.src = url;
  });
}

// Yükleme hatasından kullanıcı dostu Türkçe neden türet. Sunucu /upload hata gövdesinde
// `error` anahtarını kullanır (bkz. upload.routes.ts).
function uploadErrorReason(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'Sunucuya ulaşılamadı (ağ hatası)';
    const status = err.response.status;
    if (status === 400) return 'Boş veya bozuk dosya';
    if (status === 413) return 'Dosya çok büyük (max 20 MB)';
    if (status === 415) return 'Desteklenmeyen dosya türü';
    const serverMsg = (err.response.data as { error?: string } | undefined)?.error;
    return serverMsg || `Sunucu hatası (${status})`;
  }
  return 'Beklenmeyen hata';
}

export function ProductImageUploadModal({ isOpen, onClose, onSaved }: ProductImageUploadModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [rows, setRows] = useState<MatchRow[]>([]);
  const [productOptions, setProductOptions] = useState<SkuOption[]>([]);
  // SKU (normalize) → DB'de mevcut en yüksek sortOrder. Yeni resimlerin sırası bunun üstüne eklenir.
  const [existingMaxBySku, setExistingMaxBySku] = useState<Map<string, number>>(new Map());
  // Kütüphanede zaten var olan dosya adları (küçük harf) — üzerine yazma uyarısı için.
  const [existingFileNames, setExistingFileNames] = useState<Set<string>>(new Set());
  // Üzerine yazma onayı: çakışan satırlar (null = onay kapalı).
  const [collisions, setCollisions] = useState<MatchRow[] | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Salt okunur sortOrder: rows + DB max'tan türetilir, kayıtta da bu değerler kullanılır.
  const sortOrders = useMemo(
    () => computeSortOrders(rows, existingMaxBySku),
    [rows, existingMaxBySku],
  );

  if (!isOpen) return null;

  const reset = () => {
    setStep(1);
    setItems([]);
    setRows([]);
    setProductOptions([]);
    setExistingMaxBySku(new Map());
    setExistingFileNames(new Set());
    setCollisions(null);
    setDragging(false);
    setIsUploading(false);
    setIsSaving(false);
    setResult(null);
  };

  const handleClose = () => {
    if (isUploading || isSaving) return;
    reset();
    onClose();
  };

  const patchItem = (id: string, patch: Partial<UploadItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  // Tek dosya yükle — axios onUploadProgress ile ilerleme.
  const uploadOne = async (item: UploadItem) => {
    patchItem(item.id, { status: 'uploading', progress: 0 });
    try {
      const isTransparent = item.isPng ? await analyzeTransparency(item.file) : false;
      const fd = new FormData();
      fd.append('file', item.file);
      const res = await api.post<{ url: string }>('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
          patchItem(item.id, { progress: pct });
        },
      });
      patchItem(item.id, { status: 'done', progress: 100, url: res.data.url, isTransparent });
    } catch (err) {
      console.error('Upload error', item.file.name, err);
      patchItem(item.id, { status: 'error', error: uploadErrorReason(err) });
    }
  };

  // Paralel kuyruk — aynı anda en fazla MAX_CONCURRENT yükleme.
  const runUploads = async (queue: UploadItem[]) => {
    setIsUploading(true);
    let cursor = 0;
    const worker = async () => {
      while (cursor < queue.length) {
        const current = queue[cursor++];
        await uploadOne(current);
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(MAX_CONCURRENT, queue.length) }, () => worker()),
    );
    setIsUploading(false);
  };

  const addFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => /^image\/(jpeg|png|webp)$/.test(f.type));
    if (files.length === 0) {
      toast.error('Sadece JPEG, PNG veya WebP dosyaları yüklenebilir');
      return;
    }
    const newItems: UploadItem[] = files.map((file) => ({
      id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
      file,
      status: 'pending',
      progress: 0,
      isPng: file.type === 'image/png',
      isTransparent: false,
    }));
    setItems((prev) => [...prev, ...newItems]);
    void runUploads(newItems);
  };

  const doneCount = items.filter((i) => i.status === 'done').length;
  const errorCount = items.filter((i) => i.status === 'error').length;
  const allSettled = items.length > 0 && items.every((i) => i.status === 'done' || i.status === 'error');

  // Adım 2'ye geçiş: ürün SKU'larını ve mevcut resim sortOrder'larını çek, eşleştirmeyi hesapla.
  const goToMatching = async () => {
    let options: SkuOption[] = [];
    const maxBySku = new Map<string, number>();
    const fileNames = new Set<string>();
    try {
      const [prodRes, imgRes] = await Promise.all([
        api.get<{ sku: string; name: string }[]>('/products/skus'),
        api.get<{ sku: string | null; sortOrder: number; fileName: string | null }[]>('/product-images'),
      ]);
      options = (prodRes.data ?? []).filter((p) => p.sku).map((p) => ({ sku: p.sku, name: p.name }));
      for (const img of imgRes.data ?? []) {
        if (img.fileName) fileNames.add(img.fileName.toLowerCase()); // üzerine yazma tespiti
        if (!img.sku) continue; // SKU'suz resimler max hesabına girmez (null.trim() patlamasın)
        const key = normalizeSku(img.sku);
        maxBySku.set(key, Math.max(maxBySku.get(key) ?? 0, img.sortOrder ?? 0));
      }
    } catch (err) {
      console.error('Ürün/resim listesi alınamadı', err);
      toast.error('Ürün listesi alınamadı, eşleştirme sınırlı olabilir');
    }
    setProductOptions(options);
    setExistingMaxBySku(maxBySku);
    setExistingFileNames(fileNames);
    const normMap = new Map<string, string>();
    for (const o of options) normMap.set(normalizeSku(o.sku), o.sku);

    const uploaded = items.filter((i) => i.status === 'done' && i.url);
    const matchRows: MatchRow[] = uploaded.map((it) => ({
      id: it.id,
      fileName: it.file.name,
      url: it.url!,
      isPng: it.isPng,
      isTransparent: it.isTransparent,
      // Yalnızca tam eşleşme dropdown'a yazılır; aksi halde kullanıcı manuel seçer.
      sku: matchSku(guessSkuFromFileName(it.file.name), normMap),
    }));
    setRows(matchRows);
    setStep(2);
  };

  const updateRow = (id: string, patch: Partial<MatchRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const matchedCount = rows.filter((r) => rowState(r) === 'matched').length;
  const noneCount = rows.filter((r) => rowState(r) === 'none').length;

  // Bir resmin kütüphanede aynı dosya adıyla zaten var olup olmadığı (üzerine yazılacak).
  const willOverwrite = (r: MatchRow) => existingFileNames.has(r.fileName.toLowerCase());

  // Verilen satırları sıralı kaydet. Aynı dosya adı sunucuda upsert'lenir (üzerine yazılır).
  const saveRows = async (rowsToSave: MatchRow[]) => {
    setIsSaving(true);
    let matched = 0;
    let noSku = 0;
    let replaced = 0;
    const limitSkus = new Set<string>();
    try {
      for (const r of rowsToSave) {
        const sku = r.sku.trim();
        try {
          const { data } = await api.post<{ replaced?: boolean }>('/product-images', {
            imageKey: r.url,
            fileName: r.fileName,
            ...(sku ? { sku } : {}),
            sortOrder: sortOrders.get(r.id) || 1,
            isTransparent: r.isTransparent,
          });
          if (data?.replaced) replaced++;
          if (sku) matched++;
          else noSku++;
        } catch (err) {
          // Per-SKU resim limiti (409) — kullanıcıya bildir.
          if (axios.isAxiosError(err) && err.response?.status === 409 && sku) {
            limitSkus.add(sku);
          }
          console.error('Resim kaydı başarısız', r.fileName, err);
        }
      }
      if (limitSkus.size > 0) {
        toast.error(
          `Bazı resimler kaydedilemedi — SKU başına en fazla 10 resim: ${[...limitSkus].join(', ')}`,
        );
      }
      setResult({ matched, noSku, replaced });
      setStep(3);
    } finally {
      setIsSaving(false);
    }
  };

  // "Hepsini Kaydet": aynı isimli (üzerine yazılacak) dosya varsa önce onay iste.
  const handleSaveAll = () => {
    if (rows.length === 0) {
      toast.error('Kaydedilecek resim yok');
      return;
    }
    const colliding = rows.filter(willOverwrite);
    if (colliding.length === 0) {
      void saveRows(rows);
    } else {
      setCollisions(colliding);
    }
  };

  // Onay aksiyonları: tümünü üzerine yaz / çakışanları atla / iptal.
  const confirmOverwriteAll = () => {
    setCollisions(null);
    void saveRows(rows);
  };
  const skipDuplicates = () => {
    const kept = rows.filter((r) => !willOverwrite(r));
    setCollisions(null);
    if (kept.length === 0) {
      toast('Tüm dosyalar zaten mevcut — yeni kayıt yok');
      return;
    }
    void saveRows(kept);
  };

  // Başarısız yüklemeleri CSV rapor olarak indir (Dosya Adı; Hata Nedeni).
  // ; ayraç + UTF-8 BOM → Türkçe Excel uyumu.
  const downloadFailReport = () => {
    const failed = items.filter((i) => i.status === 'error');
    if (failed.length === 0) return;
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const lines = [
      'Dosya Adı;Hata Nedeni',
      ...failed.map((i) => `${esc(i.file.name)};${esc(i.error || 'Bilinmeyen hata')}`),
    ];
    const blob = new Blob(['﻿' + lines.join('\r\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yuklenemeyen-resimler.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <>
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-99999 animate-fade-in">
      <div className="bg-surface-panel border border-border-default rounded-radius-xl w-full max-w-3xl shadow-drop-lg animate-in fade-in zoom-in-95 duration-150 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-subtle text-primary flex items-center justify-center">
              <ImagePlus size={16} />
            </div>
            <div>
              <h2 className="text-heading-xl text-text-primary">Ürün Resmi Yükle</h2>
              <p className="text-body-xs text-text-muted mt-0.5">
                {step === 1 && 'Adım 1 / 3 — Dosyaları yükle'}
                {step === 2 && 'Adım 2 / 3 — SKU eşleştir'}
                {step === 3 && 'Adım 3 / 3 — Özet'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading || isSaving}
            className="text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* ADIM 1 — Yükleme */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-body-sm text-text-secondary">
                Birden fazla ürün resmini aynı anda sürükleyin. Sonraki adımda dosya adlarından
                SKU eşleştirmesi yapılacak.
              </p>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
                }}
                onClick={() => inputRef.current?.click()}
                className={`border border-dashed rounded-radius-lg p-8 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  dragging
                    ? 'border-border-strong bg-surface-subtle'
                    : 'border-border-default bg-surface-subtle/30 hover:border-border-strong hover:bg-surface-subtle/60'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-surface-panel shadow-drop-sm flex items-center justify-center text-text-secondary">
                  <UploadCloud size={22} />
                </div>
                <div className="text-center">
                  <div className="text-label-md text-text-primary">
                    Resimleri sürükleyin veya tıklayıp seçin
                  </div>
                  <div className="text-body-xs text-text-muted mt-0.5">JPEG, PNG veya WebP</div>
                </div>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                multiple
                onChange={(e) => {
                  if (e.target.files?.length) addFiles(e.target.files);
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="hidden"
              />

              {items.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-body-xs text-text-secondary">
                    <span>
                      {doneCount} / {items.length} yüklendi
                      {errorCount > 0 && ` · ${errorCount} hata`}
                    </span>
                    {errorCount > 0 && (
                      <button
                        type="button"
                        onClick={downloadFailReport}
                        className="inline-flex items-center gap-1 text-danger hover:underline shrink-0"
                      >
                        <Download size={13} />
                        Raporu indir
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center gap-3 px-3 py-2 border border-border-default rounded-radius-md"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-body-xs text-text-primary truncate">{it.file.name}</span>
                            {it.status === 'uploading' && (
                              <Loader2 size={14} className="animate-spin text-text-muted shrink-0" />
                            )}
                            {it.status === 'done' && (
                              <CheckCircle size={14} className="text-success shrink-0" />
                            )}
                            {it.status === 'error' && (
                              <AlertTriangle size={14} className="text-danger shrink-0" />
                            )}
                          </div>
                          <div className="mt-1 h-1 rounded-full bg-surface-subtle overflow-hidden">
                            <div
                              className={`h-full transition-all ${it.status === 'error' ? 'bg-danger' : 'bg-primary'}`}
                              style={{ width: `${it.status === 'error' ? 100 : it.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADIM 2 — Eşleştirme */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-xs">
                <span className="text-success">{matchedCount} otomatik eşleşti</span>
                <span className="text-danger">{noneCount} eşleşmedi (SKU'suz kaydedilir)</span>
              </div>

              <div className="border border-border-default rounded-radius-md overflow-hidden">
                <div className="max-h-[55vh] overflow-y-auto">
                  <table className="w-full text-body-sm">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-surface-subtle/80 text-text-secondary text-body-xs">
                        <th className="text-left font-medium px-3 py-2">Dosya</th>
                        <th className="text-left font-medium px-3 py-2 w-44">SKU</th>
                        <th className="text-left font-medium px-3 py-2 w-16">Sıra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => {
                        const state = rowState(r);
                        return (
                          <tr key={r.id} className="border-t border-border-default align-middle">
                            {/* Dosya: resim + ad + durum etiketi */}
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={toAbsoluteUrl(r.url)}
                                  alt={r.fileName}
                                  className="w-10 h-10 rounded-radius-md object-contain bg-surface-subtle shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-body-xs text-text-primary truncate max-w-44">
                                      {r.fileName}
                                    </span>
                                    {r.isPng && !r.isTransparent && (
                                      <span
                                        title="Bu PNG'nin köşeleri opak — şeffaf arka plan istiyorsanız kontrol edin"
                                        className="text-warning shrink-0"
                                      >
                                        <AlertTriangle size={14} />
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-0.5 flex items-center gap-2">
                                    {matchBadge(state)}
                                    {willOverwrite(r) && (
                                      <span
                                        title="Aynı adlı resim kütüphanede var — kaydedince üzerine yazılır"
                                        className="inline-flex items-center gap-1 text-body-xs text-warning"
                                      >
                                        <RefreshCw size={12} /> Üzerine yazılacak
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* SKU — arama destekli combobox */}
                            <td className="px-3 py-2">
                              <SkuCombobox
                                value={r.sku}
                                options={productOptions}
                                onChange={(sku) => updateRow(r.id, { sku })}
                                className="w-40"
                              />
                            </td>

                            {/* Sıra — salt okunur, otomatik hesaplanır */}
                            <td className="px-3 py-2">
                              <span className="text-body-sm text-text-secondary tabular-nums">
                                {state === 'matched' ? sortOrders.get(r.id) : '—'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ADIM 3 — Özet */}
          {step === 3 && result && (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-14 h-14 rounded-full bg-surface-subtle text-success flex items-center justify-center mb-3">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-heading-md text-text-primary">Yükleme tamamlandı</h3>
              <p className="text-body-md text-text-secondary mt-1">
                {result.matched + result.noSku} resim kaydedildi ({result.matched} eşleşti,{' '}
                {result.noSku} SKU atanmadı)
              </p>
              {result.replaced > 0 && (
                <p className="text-body-sm text-text-muted mt-1">
                  {result.replaced} tanesi mevcut resmin üzerine yazıldı
                </p>
              )}
              {errorCount > 0 && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <p className="inline-flex items-center gap-1.5 text-body-sm text-danger">
                    <AlertTriangle size={16} />
                    {errorCount} dosya yüklenemedi
                  </p>
                  <Button variant="secondary" size="sm" onClick={downloadFailReport}>
                    <Download size={15} />
                    <span>Raporu indir</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-default flex justify-end items-center gap-3 shrink-0">
          {step === 1 && (
            <>
              <Button variant="secondary" size="md" onClick={handleClose} disabled={isUploading}>
                İptal
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={goToMatching}
                disabled={isUploading || !allSettled || doneCount === 0}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Yükleniyor…</span>
                  </>
                ) : (
                  <span>Devam ({doneCount})</span>
                )}
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="secondary" size="md" onClick={() => setStep(1)} disabled={isSaving}>
                Geri
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveAll}
                disabled={isSaving || rows.length === 0}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Kaydediliyor…</span>
                  </>
                ) : (
                  <span>Hepsini Kaydet</span>
                )}
              </Button>
            </>
          )}
          {step === 3 && (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onSaved();
                handleClose();
              }}
            >
              Kapat
            </Button>
          )}
        </div>
      </div>
    </div>

    {/* Üzerine yazma onayı — aynı isimli dosyalar */}
    {collisions && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-100000 animate-fade-in">
        <div className="bg-surface-panel border border-border-default rounded-radius-xl w-full max-w-md shadow-drop-lg p-6 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-warning/10 text-warning">
              <RefreshCw size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-text-primary mb-1">Üzerine yazılacak dosyalar</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Şu {collisions.length} dosya kütüphanede zaten var. Üzerine yazarsanız mevcut
                resmin görseli güncellenir (SKU ve sıra korunur).
              </p>
            </div>
          </div>
          <div className="mt-3 max-h-48 overflow-y-auto rounded-radius-md border border-border-default bg-surface-subtle/40 divide-y divide-border-default">
            {collisions.map((r) => (
              <div key={r.id} className="px-3 py-1.5 text-body-xs text-text-primary truncate">
                {r.fileName}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-5 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => setCollisions(null)}>
              İptal
            </Button>
            <Button variant="secondary" size="sm" onClick={skipDuplicates}>
              Yenileri Atla
            </Button>
            <Button variant="primary" size="sm" onClick={confirmOverwriteAll}>
              Üzerine Yaz
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
