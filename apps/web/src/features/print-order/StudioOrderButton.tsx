// Stüdyo "Sipariş Ver" entegrasyonu — eski PriceCalculator'ın TopBar'daki yerini alır.
// Backend-driven (tek kaynak): katalog + canlı quote + sipariş API. Ebat/kırım canvas'tan kilitli.
// Ortak PrintOptionsSelector'ı kullanır; sipariş/fatura mantığını burada (stüdyoya özel) tutar.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { useBillingStore } from '@/stores/billing.store';
import { useProjectSave } from '../studio/hooks/useProjectSave';
import { PrintOptionsSelector } from './PrintOptionsSelector';
import { useCatalogOptions } from './hooks/useCatalogOptions';
import { usePriceQuote } from './hooks/usePriceQuote';
import { DEFAULT_OPTIONS, STUDIO_LOCKED_CATEGORIES } from './constants';
import { formatTRY, type PrintOptionsValue } from './types';

const PRODUCT_TYPE_KEY = 'brochure';

interface CreatedOrder {
  orderNumber: string;
}

export function StudioOrderButton() {
  const isPreviewMode = useUIStore((s) => s.isPreviewMode);
  const template = useCatalogStore((s) => s.activeTemplate);
  const { saveProject } = useProjectSave();
  const navigate = useNavigate();

  const profiles = useBillingStore((s) => s.profiles);
  const fetchProfiles = useBillingStore((s) => s.fetchProfiles);

  // Adet store'dan (tek kaynak): web/sihirbazdan taşınır, değişimde store'a geri yazılır → round-trip.
  const quantity = useCatalogStore((s) => s.quantity);
  const setStoreQuantity = useCatalogStore((s) => s.setQuantity);
  // Baskı özellikleri sihirbazdan store'a taşınır; popover bunları seed alır (DEFAULT_OPTIONS fallback).
  const storedOptions = useCatalogStore((s) => s.printOptions);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Ebat/kırım aktif şablondan türetilir (katalog anahtarlarıyla birebir hizalı).
  const lockedSize = template.wizardSelection?.paperSize;
  const lockedFold = template.wizardSelection?.foldType;

  const [value, setValue] = useState<PrintOptionsValue>(() => ({
    ...DEFAULT_OPTIONS,
    ...storedOptions,
    size: lockedSize,
    fold: lockedFold,
  }));

  // Store özellikleri (sihirbaz/round-trip) veya şablon değişince seed'i senkronla.
  // Ebat/kırım her zaman template'ten (canvas gerçeği) — kilitli.
  useEffect(() => {
    setValue((prev) => ({ ...prev, ...storedOptions, size: lockedSize, fold: lockedFold }));
  }, [storedOptions, lockedSize, lockedFold]);

  const { data: catalog, loading: catalogLoading, error: catalogError } =
    useCatalogOptions(PRODUCT_TYPE_KEY);
  const { quote, loading: quoteLoading, error: quoteError } = usePriceQuote(
    PRODUCT_TYPE_KEY,
    quantity,
    value,
  );

  // Fatura profillerini bir kez çek; varsayılanı (store isDefault'u öne sıralar) seç.
  useEffect(() => {
    void fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    if (!selectedProfileId && profiles.length > 0) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles, selectedProfileId]);

  // Click-outside.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const lockedCategories = useMemo(() => STUDIO_LOCKED_CATEGORIES, []);

  if (isPreviewMode) return null;

  const handleSubmit = async () => {
    if (!quote) return;
    if (!selectedProfileId) {
      toast.error('Önce bir fatura profili ekleyin');
      return;
    }
    setSubmitting(true);
    try {
      // studio_design siparişi projectId zorunlu. KOŞULSUZ kaydet: projectId zaten varsa bile
      // canvas'taki son (kaydedilmemiş) değişiklikler dondurulacak PDF'e girsin — aksi halde
      // müşteri "Sipariş Ver"e basmadan önce kaydetmezse üretime yanlış/eski tasarım gider.
      const pid = await saveProject();

      const res = await api.post('/orders', {
        productTypeKey: PRODUCT_TYPE_KEY,
        quantity,
        options: value,
        itemType: 'studio_design',
        projectId: pid,
        billingProfileId: selectedProfileId,
        clientGrandTotal: quote.grandTotal,
      });
      setCreatedOrder({ orderNumber: res.data.orderNumber });
      toast.success(`Sipariş oluşturuldu: ${res.data.orderNumber}`);

      // Üretim PDF'i artık ARKA PLANDA hazırlanıyor (sunucuda sıraya alınır), bu yüzden
      // yanıttaki productionPdfKey normalde null'dur. Eskiden burada bunu "PDF hazırlanamadı"
      // hatası sanıp her siparişte yanlış alarm veren bir toast vardı; kaldırıldı — gerçek
      // başarısızlık sunucuda loglanır ve admin panelindeki yeniden dondurma ucu ile çözülür.
      toast('Baskı dosyanız hazırlanıyor; siparişiniz sıraya alındı.', {
        icon: '🖨️',
        duration: 5000,
      });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Sipariş oluşturulamadı';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const noProfiles = profiles.length === 0;

  return (
    <div ref={containerRef} className="relative">
      {/* TopBar tetikleyici */}
      <button
        onClick={() => setOpen((p) => !p)}
        title="Sipariş ve Fiyat"
        className={`h-8 px-3 rounded-radius-md text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
          open
            ? 'bg-surface-subtle border-border-strong text-text-primary'
            : 'bg-surface-panel border-border-strong text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
        }`}
      >
        <span>💰</span>
        <span>{quote ? formatTRY(quote.grandTotal) : quoteLoading ? '…' : 'Sipariş Ver'}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute right-0 top-9 z-1100 w-80 bg-surface-panel rounded-xl shadow-2xl border border-border-default flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-default bg-surface-subtle rounded-t-xl">
            <h3 className="text-xs font-semibold text-text-primary">Sipariş Ver</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-text-muted hover:text-text-secondary text-lg leading-none cursor-pointer"
            >
              ×
            </button>
          </div>

          <div className="px-4 py-3 overflow-auto max-h-[calc(100vh-140px)]">
            {createdOrder ? (
              <div className="text-center py-6 space-y-3">
                <div className="text-2xl">✅</div>
                <p className="text-sm font-semibold text-text-primary">Siparişiniz alındı</p>
                <p className="text-xs text-text-secondary">
                  Sipariş No: <span className="font-semibold">{createdOrder.orderNumber}</span>
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => {
                      setCreatedOrder(null);
                      setOpen(false);
                      navigate('/dashboard/siparisler');
                    }}
                    className="w-full h-9 border border-border-strong text-text-secondary hover:bg-surface-subtle rounded-radius-md text-body-md font-medium transition-colors cursor-pointer"
                  >
                    Siparişlerime Git
                  </button>
                  <button
                    onClick={() => setCreatedOrder(null)}
                    className="w-full h-9 border border-border-strong text-text-secondary hover:bg-surface-subtle rounded-radius-md text-body-md font-medium transition-colors cursor-pointer"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            ) : catalogLoading ? (
              <p className="text-xs text-text-muted py-6 text-center">Seçenekler yükleniyor…</p>
            ) : catalogError || !catalog ? (
              <p className="text-xs text-danger py-6 text-center">
                {catalogError ?? 'Baskı seçenekleri yüklenemedi'}
              </p>
            ) : (
              <div className="space-y-3">
                <div className="bg-surface-subtle rounded p-2 text-[10px] text-text-secondary leading-snug">
                  <strong className="text-text-primary">{catalog.productType.name}</strong>
                  <br />
                  {template.name}
                </div>

                <PrintOptionsSelector
                  options={catalog}
                  value={value}
                  onChange={setValue}
                  quantity={quantity}
                  onQuantityChange={setStoreQuantity}
                  lockedCategories={lockedCategories}
                  quote={quote}
                  quoteLoading={quoteLoading}
                  quoteError={quoteError}
                />

                {/* Fatura profili */}
                <label className="block">
                  <span className="text-xs font-semibold text-text-secondary">Fatura Profili</span>
                  {noProfiles ? (
                    <button
                      onClick={() => {
                        setOpen(false);
                        navigate('/dashboard/fatura');
                      }}
                      className="w-full mt-1 text-xs border border-border-strong rounded px-2 py-1.5 text-text-secondary hover:bg-surface-subtle text-left cursor-pointer"
                    >
                      Fatura profili ekleyin →
                    </button>
                  ) : (
                    <select
                      value={selectedProfileId}
                      onChange={(e) => setSelectedProfileId(e.target.value)}
                      className="w-full mt-1 text-xs border border-border-strong rounded px-2 py-1.5 bg-surface-panel outline-none focus:border-border-strong"
                    >
                      {profiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                          {p.isDefault ? ' (varsayılan)' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </label>

                {/* CTA */}
                <button
                  onClick={() => void handleSubmit()}
                  disabled={submitting || !quote || !!quoteError || noProfiles}
                  className="w-full mt-1 h-9 bg-primary hover:bg-primary-hover text-white rounded-radius-md text-body-md font-medium transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Gönderiliyor…' : 'Sipariş Ver'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
