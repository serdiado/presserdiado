// Vitrin broşür konfigüratörü — KALICI fonksiyonel çekirdek.
// Mock fiyat YOK: seçenekler gerçek katalogtan (GET /catalog/.../options), fiyat tek
// kaynaktan (POST /pricing/quote). UI, S5/S6 ile ortak PrintOptionsSelector'dır.
// Token kuralı geçerli — hardcode hex yok; surface/text/border/primary token'ları.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { PrintOptionsSelector } from '@/features/print-order/PrintOptionsSelector';
import { useCatalogOptions } from '@/features/print-order/hooks/useCatalogOptions';
import { usePriceQuote } from '@/features/print-order/hooks/usePriceQuote';
import {
  BROCHURE_QUANTITY_CHOICES,
  CATEGORY_ORDER,
  CATEGORY_TO_OPTION_KEY,
  DEFAULT_OPTIONS,
} from '@/features/print-order/constants';
import type { PrintOptionsValue } from '@/features/print-order/types';

// Broşür katalog anahtarı — apps/api/src/db/seed.ts ile hizalı.
const BROCHURE_KEY = 'brochure';

export function BrochureConfigurator() {
  const navigate = useNavigate();
  const isAuthed = useAuthStore((s) => !!s.accessToken);

  const { data: catalog, loading, error } = useCatalogOptions(BROCHURE_KEY);
  const [printOptions, setPrintOptions] = useState<PrintOptionsValue>({ ...DEFAULT_OPTIONS });
  // 1000 adet: sabit adet listesindeki (500/1000/2000/5000/10000) en yaygın başlangıç noktası.
  const [quantity, setQuantity] = useState<number>(1000);

  // Katalog yüklenince eksik kategorileri (özellikle ebat/kırım — DEFAULT_OPTIONS'ta yok,
  // sihirbazda Adım 1'den gelirdi) ilk katalog seçeneğiyle seed et ki ilk quote geçerli olsun.
  useEffect(() => {
    if (!catalog) return;
    setPrintOptions((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const category of CATEGORY_ORDER) {
        const optionKey = CATEGORY_TO_OPTION_KEY[category];
        const list = catalog.options[category];
        if (list && list.length > 0 && !next[optionKey]) {
          next[optionKey] = list[0].key;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [catalog]);

  const { quote, loading: quoteLoading, error: quoteError } = usePriceQuote(
    BROCHURE_KEY,
    quantity,
    printOptions,
  );

  // "Online Tasarla": giriş varsa seçimi route state ile sihirbaza taşı (S6 sihirbazı
  // buildTemplateFromWizard + startFreshCatalog ile devam eder); yoksa login'e (A1: seçim
  // korunmaz). Aktarım efemer route state'tir — sihirbaz size/fold'u sel'den türetir.
  const handleDesign = () => {
    if (isAuthed) {
      navigate('/new', {
        state: { wizardSeed: { category: BROCHURE_KEY, printOptions, quantity } },
      });
    } else {
      navigate('/login?next=/new');
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-surface-panel border border-border-default rounded-radius-lg p-6">
        {loading && !catalog ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 rounded-radius-sm bg-surface-subtle" />
            ))}
          </div>
        ) : error ? (
          <p className="text-body-sm text-danger">
            Baskı seçenekleri yüklenemedi. Lütfen sayfayı yenileyin.
          </p>
        ) : catalog ? (
          <PrintOptionsSelector
            options={catalog}
            value={printOptions}
            onChange={setPrintOptions}
            quantity={quantity}
            onQuantityChange={setQuantity}
            quantityChoices={BROCHURE_QUANTITY_CHOICES}
            quote={quote}
            quoteLoading={quoteLoading}
            quoteError={quoteError}
          />
        ) : null}
      </div>

      {/* Aksiyon kutusu */}
      <aside className="bg-surface-panel border border-border-default rounded-radius-lg p-6 flex flex-col gap-3 h-fit lg:sticky lg:top-20">
        <div className="text-body-xs font-semibold tracking-[0.16em] uppercase text-text-muted">
          Nasıl tasarlayacaksınız?
        </div>

        <button
          type="button"
          onClick={handleDesign}
          className="w-full h-11 rounded-radius-md bg-primary hover:bg-primary-hover text-white text-body-sm font-semibold transition-colors"
        >
          Online Tasarla
        </button>

        {/* Yükleme ve şablon akışları henüz yok — pasif/"Yakında". */}
        <button
          type="button"
          disabled
          className="w-full h-11 rounded-radius-md bg-surface-subtle border border-border-default text-text-muted text-body-sm font-semibold cursor-not-allowed flex items-center justify-center gap-2"
        >
          Tasarım Yükle
          <span className="text-label-sm font-semibold px-1.5 py-0.5 rounded-radius-sm bg-surface-app text-text-muted">
            Yakında
          </span>
        </button>
        <button
          type="button"
          disabled
          className="w-full h-11 rounded-radius-md bg-surface-subtle border border-border-default text-text-muted text-body-sm font-semibold cursor-not-allowed flex items-center justify-center gap-2"
        >
          Hazır Şablon
          <span className="text-label-sm font-semibold px-1.5 py-0.5 rounded-radius-sm bg-surface-app text-text-muted">
            Yakında
          </span>
        </button>

        <p className="text-body-xs text-text-muted mt-1">
          Fiyat anlık hesaplanır. KDV dahildir. Tasarıma başlamak için giriş yapmanız gerekir.
        </p>
      </aside>
    </div>
  );
}
