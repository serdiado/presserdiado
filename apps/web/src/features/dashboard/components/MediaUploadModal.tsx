import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ImagePlus,
  Loader2,
  UploadCloud,
  X,
} from 'lucide-react';
import api from '@/lib/api';
import { toAbsoluteUrl } from '@/lib/upload';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import type { MediaAssetType } from '../types';

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

type Step = 1 | 2 | 3;
type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

interface UploadItem {
  id: string;
  file: File;
  type: MediaAssetType;
  status: UploadStatus;
  progress: number;
  imageKey?: string;
  mimeType?: string;
  size?: number;
}

interface SaveResult {
  saved: number;
  failed: number;
}

const MAX_CONCURRENT = 5;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/svg+xml';
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);

const TYPE_OPTIONS: { value: MediaAssetType; label: string }[] = [
  { value: 'logo', label: 'Logo' },
  { value: 'background', label: 'Arka Plan' },
  { value: 'shape', label: 'Şekil' },
  { value: 'other', label: 'Diğer' },
];

function typeLabel(type: MediaAssetType) {
  return TYPE_OPTIONS.find((option) => option.value === type)?.label ?? 'Diğer';
}

export function MediaUploadModal({ isOpen, onClose, onSaved }: MediaUploadModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const reset = () => {
    setStep(1);
    setItems([]);
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
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const uploadOne = async (item: UploadItem) => {
    patchItem(item.id, { status: 'uploading', progress: 0 });
    try {
      const formData = new FormData();
      formData.append('file', item.file);

      const response = await api.post<{ url: string; size?: number; mimeType?: string }>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          const progress = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
          patchItem(item.id, { progress });
        },
      });

      patchItem(item.id, {
        status: 'done',
        progress: 100,
        imageKey: response.data.url,
        mimeType: response.data.mimeType ?? item.file.type,
        size: response.data.size ?? item.file.size,
      });
    } catch (err) {
      console.error('Medya yükleme hatası', item.file.name, err);
      patchItem(item.id, { status: 'error', progress: 100 });
    }
  };

  const runUploads = async (queue: UploadItem[]) => {
    setIsUploading(true);
    let cursor = 0;
    const worker = async () => {
      while (cursor < queue.length) {
        const current = queue[cursor++];
        await uploadOne(current);
      }
    };
    await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENT, queue.length) }, () => worker()));
    setIsUploading(false);
  };

  const addFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((file) => ACCEPTED_TYPES.has(file.type));
    if (files.length === 0) {
      toast.error('Sadece JPEG, PNG, WebP veya SVG dosyaları yüklenebilir');
      return;
    }

    const newItems: UploadItem[] = files.map((file) => ({
      id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
      file,
      type: 'other',
      status: 'pending',
      progress: 0,
    }));

    setItems((prev) => [...prev, ...newItems]);
    void runUploads(newItems);
  };

  const updateType = (id: string, type: MediaAssetType) => {
    patchItem(id, { type });
  };

  const doneItems = items.filter((item) => item.status === 'done' && item.imageKey);
  const doneCount = doneItems.length;
  const errorCount = items.filter((item) => item.status === 'error').length;
  const allSettled = items.length > 0 && items.every((item) => item.status === 'done' || item.status === 'error');

  const handleSave = async () => {
    if (doneItems.length === 0) {
      toast.error('Kaydedilecek medya yok');
      return;
    }

    setIsSaving(true);
    let saved = 0;
    let failed = 0;
    try {
      for (const item of doneItems) {
        try {
          await api.post('/media-assets', {
            imageKey: item.imageKey,
            fileName: item.file.name,
            mimeType: item.mimeType ?? item.file.type,
            size: item.size ?? item.file.size,
            type: item.type,
          });
          saved++;
        } catch (err) {
          failed++;
          console.error('Medya kaydı başarısız', item.file.name, err);
        }
      }
      setResult({ saved, failed });
      setStep(3);
      if (saved > 0) toast.success(`${saved} medya kaydedildi`);
      if (failed > 0) toast.error(`${failed} medya kaydedilemedi`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-99999 animate-fade-in">
      <div className="bg-surface-panel border border-border-default rounded-radius-xl w-full max-w-3xl shadow-drop-lg animate-in fade-in zoom-in-95 duration-150 relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-subtle text-primary flex items-center justify-center">
              <ImagePlus size={16} />
            </div>
            <div>
              <h2 className="text-heading-xl text-text-primary">Medya Yükle</h2>
              <p className="text-body-xs text-text-muted mt-0.5">
                {step === 1 && 'Adım 1 / 2 — Dosyaları yükle'}
                {step === 2 && 'Adım 2 / 2 — Kaydet'}
                {step === 3 && 'Özet'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading || isSaving}
            className="text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-body-sm text-text-secondary">
                Logo, arka plan ve şekil dosyalarınızı yükleyin. Her dosya için medya türünü seçebilirsiniz.
              </p>
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files);
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
                  <div className="text-label-md text-text-primary">Medyaları sürükleyin veya tıklayıp seçin</div>
                  <div className="text-body-xs text-text-muted mt-0.5">JPEG, PNG, WebP veya SVG</div>
                </div>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                multiple
                onChange={(event) => {
                  if (event.target.files?.length) addFiles(event.target.files);
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
                  </div>
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-3 py-2 border border-border-default rounded-radius-md"
                      >
                        <div className="w-10 h-10 rounded-radius-md bg-surface-subtle flex items-center justify-center overflow-hidden shrink-0">
                          {item.imageKey ? (
                            <img
                              src={toAbsoluteUrl(item.imageKey)}
                              alt={item.file.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <ImagePlus size={16} className="text-text-muted" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-body-xs text-text-primary truncate">{item.file.name}</span>
                            {item.status === 'uploading' && <Loader2 size={14} className="animate-spin text-text-muted shrink-0" />}
                            {item.status === 'done' && <CheckCircle size={14} className="text-success shrink-0" />}
                            {item.status === 'error' && <AlertTriangle size={14} className="text-danger shrink-0" />}
                          </div>
                          <div className="mt-1 h-1 rounded-full bg-surface-subtle overflow-hidden">
                            <div
                              className={`h-full transition-all ${item.status === 'error' ? 'bg-danger' : 'bg-primary'}`}
                              style={{ width: `${item.status === 'error' ? 100 : item.progress}%` }}
                            />
                          </div>
                        </div>
                        <label className="relative shrink-0">
                          <span className="sr-only">Medya türü</span>
                          <select
                            value={item.type}
                            onChange={(event) => updateType(item.id, event.target.value as MediaAssetType)}
                            disabled={isUploading && item.status === 'uploading'}
                            className="appearance-none h-9 pl-3 pr-8 rounded-radius-md border border-border-default bg-surface-panel text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-strong disabled:opacity-40"
                          >
                            {TYPE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-radius-lg border border-border-default bg-surface-subtle/40 p-4">
                <h3 className="text-heading-md text-text-primary">Kaydetmeye hazır</h3>
                <p className="text-body-sm text-text-secondary mt-1">
                  {doneCount} dosya yüklendi. Kaydettiğinizde medya kütüphanenize eklenecek.
                </p>
              </div>
              <div className="border border-border-default rounded-radius-md overflow-hidden">
                <div className="max-h-[50vh] overflow-y-auto">
                  <table className="w-full text-body-sm">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-surface-subtle/80 text-text-secondary text-body-xs">
                        <th className="text-left font-medium px-3 py-2">Dosya</th>
                        <th className="text-left font-medium px-3 py-2 w-32">Tür</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doneItems.map((item) => (
                        <tr key={item.id} className="border-t border-border-default">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={toAbsoluteUrl(item.imageKey ?? '')}
                                alt={item.file.name}
                                className="w-10 h-10 rounded-radius-md object-contain bg-surface-subtle shrink-0"
                              />
                              <span className="text-body-xs text-text-primary truncate">{item.file.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-radius-md border border-border-default bg-surface-subtle text-body-xs text-text-secondary">
                              {typeLabel(item.type)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {step === 3 && result && (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-14 h-14 rounded-full bg-surface-subtle text-success flex items-center justify-center mb-3">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-heading-md text-text-primary">Medya kaydedildi</h3>
              <p className="text-body-md text-text-secondary mt-1">
                {result.saved} medya kaydedildi{result.failed > 0 ? `, ${result.failed} kayıt başarısız oldu` : ''}.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border-default flex justify-end items-center gap-3 shrink-0">
          {step === 1 && (
            <>
              <Button variant="secondary" size="md" onClick={handleClose} disabled={isUploading}>
                İptal
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep(2)}
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
              <Button variant="primary" size="md" onClick={handleSave} disabled={isSaving || doneCount === 0}>
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Kaydediliyor…</span>
                  </>
                ) : (
                  <span>Kaydet</span>
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
  );
}