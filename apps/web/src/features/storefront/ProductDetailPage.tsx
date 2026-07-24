// Vitrin ürün detay sayfası (/urun/:slug) — katalog + paket kuralları + canlı fiyat.
// İki seçim modu (ürünün configSchema.ui.presentation'ına göre):
//  - picker: turmatsan "hazır paket" ürünleri (kartvizit) → sade kart seçici (VariantPicker).
//  - klasik: düz kategori seçicileri (PrintOptionsSelector) — çok-kademeli/adet-bazlı upload'lar.
// (Sıralı sihirbaz — VariantWizard — broşür gibi gerçek matris ürünler için saklı; henüz bağlı değil.)
// Fiyat tek kaynaktan (POST /pricing/quote). Satış moduna göre CTA.

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { PrintOptionsSelector } from '@/features/print-order/PrintOptionsSelector';
import { VariantPicker, type PickerVariant } from '@/features/print-order/VariantPicker';
import { useCatalogOptions } from '@/features/print-order/hooks/useCatalogOptions';
import {
  useCatalogPackages,
  validQuantities,
} from '@/features/print-order/hooks/useCatalogPackages';
import { usePriceQuote } from '@/features/print-order/hooks/usePriceQuote';
import { CATEGORY_ORDER, CATEGORY_TO_OPTION_KEY } from '@/features/print-order/constants';
import { formatTRY, uiHintsOf, type PrintOptionsValue } from '@/features/print-order/types';
import { SiteHeader, SiteFooter } from './StorefrontPage';

export default function ProductDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const isAuthed = useAuthStore((s) => !!s.accessToken);

  const { data: catalog, loading, error } = useCatalogOptions(slug);
  const { packages } = useCatalogPackages(slug);

  const saleMode = catalog?.productType.saleMode ?? 'upload';
  const ui = uiHintsOf(catalog?.productType);

  // Sade kart seçici (picker) modu: hazır paket ürünleri.
  const pickerVariants: PickerVariant[] = useMemo(() => {
    if (ui.presentation !== 'picker') return [];
    return (catalog?.options.paper_type ?? []).map((o) => {
      const [name, specs] = o.label.split(' — ');
      const group = (o.metadata as { group?: string } | null)?.group ?? 'Diğer';
      return { code: o.key, name: name ?? o.label, specs: specs ?? '', group };
    });
  }, [catalog, ui.presentation]);
  const isPicker = pickerVariants.length > 0;

  // Klasik mod seçim state'i.
  const [printOptions, setPrintOptions] = useState<PrintOptionsValue>({});
  // Picker modu seçili ürün kodu.
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(0);

  // SPA geçişinde scroll korunur; ürün değişince baştan.
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedCode(null);
    setPrintOptions({});
    setQuantity(0);
  }, [slug]);

  // Klasik mod: katalog gelince her kategoriyi ilk seçenekle tohumla.
  useEffect(() => {
    if (!catalog || isPicker) return;
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
  }, [catalog, isPicker]);

  const effectiveOptions: PrintOptionsValue = isPicker
    ? { paperType: selectedCode ?? undefined }
    : printOptions;
  const selectedVariant = isPicker ? pickerVariants.find((v) => v.code === selectedCode) ?? null : null;

  // Seçili komboya uyan geçerli adetler.
  const quantities = useMemo(
    () => validQuantities(packages, effectiveOptions),
    [packages, effectiveOptions],
  );
  useEffect(() => {
    if (quantities.length > 0 && !quantities.includes(quantity)) {
      setQuantity(quantities[0]);
    }
  }, [quantities, quantity]);

  const resolved = isPicker ? !!selectedCode : true;
  const ready = !!catalog && saleMode !== 'quote' && resolved && quantity > 0;
  const { quote, loading: quoteLoading, error: quoteError } = usePriceQuote(
    slug,
    ready ? quantity : 1,
    effectiveOptions,
  );

  const handleDesign = () => {
    const seed = { category: slug, printOptions: effectiveOptions, quantity };
    if (isAuthed) navigate('/new', { state: { wizardSeed: seed } });
    else navigate('/login?next=/new');
  };

  const unit = ui.quantityUnit ?? 'adet';

  const cta =
    saleMode === 'design' ? (
      <button
        type="button"
        onClick={handleDesign}
        className="w-full h-11 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
      >
        Online Tasarla
      </button>
    ) : (
      <button
        type="button"
        disabled
        className="w-full h-11 rounded-md bg-slate-100 border border-slate-200 text-slate-400 text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-2"
      >
        Dosya Yükleyerek Sipariş Ver
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white text-slate-500">Yakında</span>
      </button>
    );

  const ctaNote = (
    <p className="text-xs text-slate-500 leading-relaxed">
      {saleMode === 'design'
        ? 'Fiyat anlık hesaplanır, KDV dahildir. Tasarıma başlamak için giriş yapmanız gerekir.'
        : 'Fiyat anlık hesaplanır, KDV dahildir. Baskıya hazır PDF dosyanızla sipariş akışı çok yakında açılıyor; şimdilik fiyat alıp bize ulaşabilirsiniz.'}
    </p>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={15} /> Tüm ürünler
        </Link>

        {loading && !catalog ? (
          <div className="mt-6 space-y-3 animate-pulse">
            <div className="h-8 w-64 rounded bg-slate-200" />
            <div className="h-4 w-96 rounded bg-slate-200" />
            <div className="h-64 rounded-xl bg-slate-200 mt-6" />
          </div>
        ) : error || !catalog ? (
          <div className="mt-10 text-center">
            <p className="text-slate-600">Ürün bulunamadı veya yüklenemedi.</p>
            <Link to="/" className="text-blue-600 font-semibold text-sm mt-2 inline-block">
              Vitrine dön
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-4 mb-8">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {catalog.productType.name}
              </h1>
              {catalog.productType.description && (
                <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                  {catalog.productType.description}
                </p>
              )}
            </div>

            {saleMode === 'quote' ? (
              <QuotePanel productName={catalog.productType.name} />
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
                  {isPicker ? (
                    <VariantPicker
                      variants={pickerVariants}
                      packages={packages}
                      selectedCode={selectedCode}
                      onSelect={setSelectedCode}
                    />
                  ) : (
                    <PrintOptionsSelector
                      options={catalog}
                      value={printOptions}
                      onChange={setPrintOptions}
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                      quote={ready ? quote : null}
                      quoteLoading={quoteLoading}
                      quoteError={ready ? quoteError : null}
                      quantityChoices={quantities}
                      quantityUnit={ui.quantityUnit}
                      categoryLabels={ui.optionLabels}
                    />
                  )}
                </div>

                {/* Sağ panel — picker modunda seçim özeti + fiyat; klasik modda yalnız CTA. */}
                <aside className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4 h-fit lg:sticky lg:top-20">
                  {isPicker && (
                    <>
                      <div>
                        <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500 mb-2">
                          Ürününüz
                        </div>
                        {selectedVariant ? (
                          <div>
                            <div className="text-sm font-bold text-slate-900">{selectedVariant.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                              {selectedVariant.specs}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">Soldan bir ürün seçin.</p>
                        )}
                      </div>

                      {resolved && (
                        <div className="border-t border-slate-200 pt-4 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Adet</span>
                            <span className="font-medium text-slate-800">
                              {quantity.toLocaleString('tr-TR')} {unit}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Ara Toplam</span>
                            <span>{formatTRY(quote?.subtotal)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>KDV (%{quote ? Math.round(quote.taxRate) : 0})</span>
                            <span>{formatTRY(quote?.taxTotal)}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                            <span className="text-sm font-semibold text-slate-700">Toplam</span>
                            <span className="text-lg font-bold text-slate-900">
                              {quoteLoading && !quote ? '…' : formatTRY(quote?.grandTotal)}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className={isPicker ? '' : 'flex flex-col gap-3'}>
                    {!isPicker && (
                      <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500">
                        Nasıl sipariş vereceksiniz?
                      </div>
                    )}
                    {cta}
                    {ctaNote}
                  </div>
                </aside>
              </div>
            )}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

// Teklif-usulü ürünler: fiyat tablosu yok; kısa bilgilendirme + iletişim yönlendirmesi.
function QuotePanel({ productName }: { productName: string }) {
  return (
    <div className="max-w-2xl bg-white border border-slate-200 rounded-xl p-8">
      <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500 mb-2">
        Teklif Usulü Ürün
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">
        {productName} siparişleri ölçü, malzeme ve adete göre özel fiyatlandırılır.
        Online teklif formumuz çok yakında burada olacak; o zamana kadar ihtiyacınızı
        iletişim kanallarımızdan iletirseniz aynı gün fiyat çalışıp dönüş yaparız.
      </p>
      <button
        type="button"
        disabled
        className="mt-5 h-11 px-5 rounded-md bg-slate-100 border border-slate-200 text-slate-400 text-sm font-semibold cursor-not-allowed inline-flex items-center gap-2"
      >
        Teklif Al
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white text-slate-500">Yakında</span>
      </button>
    </div>
  );
}
