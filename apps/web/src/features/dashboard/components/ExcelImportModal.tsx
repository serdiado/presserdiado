// Harici Excel import — dinamik kolon eşleştirmeli toplu ürün ekleme.
// 3 adımlı wizard: dosya yükle → kolon eşleştir → import & özet.
// Stüdyodaki ProductManagement.tsx sabit mapping'li parse'ı referans alır,
// burada mapping kullanıcı tarafından belirlenir.

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { X, Loader2, FileSpreadsheet, UploadCloud, CheckCircle2, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

type ExcelRow = Record<string, string | number | undefined>;
type Step = 1 | 2 | 3;

const MAPPING_TEMPLATE_KEY = 'matbaapro:excel-mapping-template';
const MAX_PRODUCTS = 1000;

const FIELDS = [
  { key: 'sku', label: 'SKU / Ürün Kodu', required: true },
  { key: 'name', label: 'Ürün Adı', required: true },
  { key: 'price', label: 'Fiyat', required: false },
  { key: 'category', label: 'Kategori', required: false },
  { key: 'unit', label: 'Birim', required: false },
  { key: 'description', label: 'Açıklama', required: false },
] as const;

type FieldKey = (typeof FIELDS)[number]['key'];

// Sistem alanı → olası Excel başlıkları (otomatik tahmin için).
const FIELD_SYNONYMS: Record<FieldKey, string[]> = {
  sku: ['sku', 'artnr', 'kod', 'stok', 'stokkodu', 'urunkodu', 'barkod', 'code'],
  name: ['name', 'ad', 'isim', 'urunadi', 'bezeichnung', 'baslik', 'title', 'aciklama1'],
  price: ['price', 'fiyat', 'vknetto', 'satisfiyati', 'tutar', 'birimfiyat'],
  category: ['category', 'kategori', 'artgrp', 'grup', 'tur'],
  unit: ['unit', 'birim', 'olcu', 'me'],
  description: ['description', 'aciklama', 'detay', 'note', 'not'],
};

// TR karakterleri sadeleştirip normalize et (büyük/küçük ve boşluk farklarını yok say).
function normalizeHeader(h: string): string {
  return h
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

// Header listesinden her alan için en olası kolonu tahmin et.
function guessMapping(headers: string[]): Record<FieldKey, string> {
  const normalized = headers.map((h) => ({ raw: h, norm: normalizeHeader(h) }));
  const result = {} as Record<FieldKey, string>;
  for (const field of FIELDS) {
    const syns = FIELD_SYNONYMS[field.key];
    const match =
      normalized.find((h) => syns.includes(h.norm)) ??
      normalized.find((h) => syns.some((s) => h.norm.includes(s)));
    result[field.key] = match ? match.raw : '';
  }
  return result;
}

// Türkçe biçimli fiyatı sayıya çevir: "1.250,90" → 1250.90. Çevrilemezse undefined.
function normalizePrice(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  const cleaned = String(value).trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : undefined;
}

interface BulkResult {
  inserted: number;
  skipped: number;
  skippedSkus: string[];
}

export function ExcelImportModal({ isOpen, onClose, onImported }: ExcelImportModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ExcelRow[]>([]);
  const [mapping, setMapping] = useState<Record<FieldKey, string>>(
    () => ({}) as Record<FieldKey, string>,
  );
  const [dragging, setDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [localSkipped, setLocalSkipped] = useState<string[]>([]);
  const [showSkipped, setShowSkipped] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const reset = () => {
    setStep(1);
    setFileName('');
    setHeaders([]);
    setRows([]);
    setMapping({} as Record<FieldKey, string>);
    setResult(null);
    setLocalSkipped([]);
    setShowSkipped(false);
    setIsLoading(false);
    setDragging(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: '' });
        if (parsed.length === 0) {
          toast.error('Excel dosyasında satır bulunamadı');
          return;
        }
        const cols = Object.keys(parsed[0]);
        setHeaders(cols);
        setRows(parsed);
        setMapping(resolveInitialMapping(cols));
        setStep(2);
      } catch (err) {
        console.error('Excel parse error', err);
        toast.error('Dosya okunamadı. Geçerli bir Excel/CSV mi?');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Kayıtlı şablon dosyanın kolonlarıyla uyumluysa onu, değilse otomatik tahmini uygula.
  const resolveInitialMapping = (cols: string[]): Record<FieldKey, string> => {
    const guessed = guessMapping(cols);
    try {
      const saved = localStorage.getItem(MAPPING_TEMPLATE_KEY);
      if (saved) {
        const tpl = JSON.parse(saved) as Partial<Record<FieldKey, string>>;
        const merged = { ...guessed };
        let usable = false;
        for (const field of FIELDS) {
          const col = tpl[field.key];
          if (col && cols.includes(col)) {
            merged[field.key] = col;
            usable = true;
          }
        }
        if (usable) return merged;
      }
    } catch {
      // bozuk şablon — yok say
    }
    return guessed;
  };

  const saveTemplate = () => {
    try {
      localStorage.setItem(MAPPING_TEMPLATE_KEY, JSON.stringify(mapping));
      toast.success('Eşleştirme şablonu kaydedildi');
    } catch {
      toast.error('Şablon kaydedilemedi');
    }
  };

  const canContinue = Boolean(mapping.sku) && Boolean(mapping.name);

  const buildPayload = () => {
    const seen = new Set<string>();
    const skipped: string[] = [];
    const products: Array<Record<string, unknown>> = [];

    for (const row of rows) {
      const sku = String(row[mapping.sku] ?? '').trim();
      const name = String(row[mapping.name] ?? '').trim();
      if (!sku || !name) {
        if (sku) skipped.push(sku);
        continue;
      }
      if (seen.has(sku)) {
        skipped.push(sku);
        continue;
      }
      seen.add(sku);

      const item: Record<string, unknown> = { sku, name };
      const price = mapping.price ? normalizePrice(row[mapping.price]) : undefined;
      if (price !== undefined) item.price = price;
      if (mapping.category) {
        const v = String(row[mapping.category] ?? '').trim();
        if (v) item.category = v;
      }
      if (mapping.unit) {
        const v = String(row[mapping.unit] ?? '').trim();
        if (v) item.unit = v;
      }
      if (mapping.description) {
        const v = String(row[mapping.description] ?? '').trim();
        if (v) item.description = v;
      }
      products.push(item);
    }

    return { products, skipped };
  };

  const handleImport = async () => {
    const { products, skipped } = buildPayload();
    if (products.length === 0) {
      toast.error('İçe aktarılacak geçerli ürün yok');
      return;
    }
    if (products.length > MAX_PRODUCTS) {
      toast.error(`Tek seferde en fazla ${MAX_PRODUCTS} ürün aktarılabilir`);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post<BulkResult>('/products/bulk', { products });
      setResult(res.data);
      setLocalSkipped(skipped);
      setStep(3);
    } catch (err) {
      console.error('Bulk import error', err);
      toast.error('İçe aktarma başarısız oldu');
    } finally {
      setIsLoading(false);
    }
  };

  // Önizleme: eşleşen alanların ilk 5 satırdaki değerleri.
  const previewRows = rows.slice(0, 5);
  const previewFields = FIELDS.filter((f) => mapping[f.key]);

  const totalSkipped = (result?.skipped ?? 0) + localSkipped.length;
  const allSkippedSkus = [...(result?.skippedSkus ?? []), ...localSkipped];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-99999 animate-fade-in">
      <div className="bg-surface-panel border border-border-default rounded-radius-xl w-full max-w-2xl shadow-drop-lg animate-in fade-in zoom-in-95 duration-150 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-subtle text-primary flex items-center justify-center">
              <FileSpreadsheet size={16} />
            </div>
            <div>
              <h2 className="text-heading-xl text-text-primary">Excel'den İçe Aktar</h2>
              <p className="text-body-xs text-text-muted mt-0.5">
                {step === 1 && 'Adım 1 / 3 — Dosya yükle'}
                {step === 2 && 'Adım 2 / 3 — Kolonları eşleştir'}
                {step === 3 && 'Adım 3 / 3 — Özet'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* ADIM 1 — Dosya yükleme */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-body-sm text-text-secondary">
                Herhangi formattaki Excel veya CSV dosyanızı yükleyin. Sonraki adımda
                kolonları sistem alanlarıyla eşleştireceksiniz.
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
                  const f = e.dataTransfer.files?.[0];
                  if (f) processFile(f);
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
                    Excel sürükleyin veya tıklayıp seçin
                  </div>
                  <div className="text-body-xs text-text-muted mt-0.5">
                    .xlsx, .xls veya .csv
                  </div>
                </div>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) processFile(f);
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="hidden"
              />
            </div>
          )}

          {/* ADIM 2 — Kolon eşleştirme */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-body-xs text-text-secondary">
                <FileSpreadsheet size={14} className="text-text-muted" />
                <span>
                  {fileName} — {rows.length} satır, {headers.length} kolon bulundu
                </span>
              </div>

              <div className="space-y-3">
                {FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center gap-4">
                    <label className="w-40 shrink-0 text-label-md text-text-primary">
                      {field.label}
                      {field.required && <span className="text-danger"> *</span>}
                    </label>
                    <select
                      value={mapping[field.key] ?? ''}
                      onChange={(e) =>
                        setMapping((m) => ({ ...m, [field.key]: e.target.value }))
                      }
                      className="flex-1 h-9 px-3 border border-border-default hover:border-border-strong rounded-radius-md text-body-md text-text-primary bg-surface-panel focus:outline-none focus:ring-2 focus:ring-border-strong"
                    >
                      <option value="">Bu kolonu seç…</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Önizleme */}
              {canContinue ? (
                <div>
                  <h3 className="text-label-md text-text-primary mb-2">
                    Önizleme — ilk {previewRows.length} satır
                  </h3>
                  <div className="border border-border-default rounded-radius-md overflow-x-auto">
                    <table className="w-full text-body-xs">
                      <thead>
                        <tr className="bg-surface-subtle/60 text-text-secondary">
                          {previewFields.map((f) => (
                            <th key={f.key} className="text-left px-3 py-2">
                              {f.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, i) => (
                          <tr key={i} className="border-t border-border-default text-text-primary">
                            {previewFields.map((f) => {
                              const raw = row[mapping[f.key]];
                              const display =
                                f.key === 'price'
                                  ? (normalizePrice(raw)?.toLocaleString('tr-TR', {
                                      minimumFractionDigits: 2,
                                    }) ?? '-')
                                  : String(raw ?? '');
                              return (
                                <td key={f.key} className="px-3 py-2 truncate max-w-40">
                                  {display || '-'}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-body-xs text-text-muted">
                  Önizleme için en az SKU ve Ürün Adı kolonlarını eşleştirin.
                </p>
              )}
            </div>
          )}

          {/* ADIM 3 — Özet */}
          {step === 3 && result && (
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-14 h-14 rounded-full bg-surface-subtle text-success flex items-center justify-center mb-3">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-heading-md text-text-primary">İçe aktarma tamamlandı</h3>
                <p className="text-body-md text-text-secondary mt-1">
                  {result.inserted} ürün eklendi
                  {totalSkipped > 0 && `, ${totalSkipped} atlandı (zaten mevcut veya geçersiz)`}
                </p>
              </div>

              {totalSkipped > 0 && (
                <div className="border border-border-default rounded-radius-md">
                  <button
                    onClick={() => setShowSkipped((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-label-md text-text-primary hover:bg-surface-subtle/60 transition-colors"
                  >
                    <span>Atlanan {totalSkipped} kayıt</span>
                    <ChevronDown
                      size={16}
                      className={`text-text-muted transition-transform ${
                        showSkipped ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {showSkipped && (
                    <div className="px-4 py-3 border-t border-border-default max-h-48 overflow-y-auto">
                      <div className="flex flex-wrap gap-1.5">
                        {allSkippedSkus.map((sku, i) => (
                          <span
                            key={`${sku}-${i}`}
                            className="font-mono text-body-xs text-text-secondary bg-surface-subtle px-2 py-0.5 rounded border border-border-default"
                          >
                            {sku}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-default flex justify-between items-center gap-3 shrink-0">
          <div>
            {step === 2 && (
              <Button variant="ghost" size="md" onClick={saveTemplate} disabled={!canContinue}>
                Bu eşleştirmeyi kaydet
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {step === 1 && (
              <Button variant="secondary" size="md" onClick={handleClose}>
                İptal
              </Button>
            )}
            {step === 2 && (
              <>
                <Button variant="secondary" size="md" onClick={() => setStep(1)} disabled={isLoading}>
                  Geri
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleImport}
                  disabled={!canContinue || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>İçe aktarılıyor…</span>
                    </>
                  ) : (
                    <span>İçe aktar</span>
                  )}
                </Button>
              </>
            )}
            {step === 3 && (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  onImported();
                  handleClose();
                }}
              >
                Kapat
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
