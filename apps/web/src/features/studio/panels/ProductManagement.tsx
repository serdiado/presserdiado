// Excel import + master pool browser. Replaces the basic product list in
// Sidebar's "Ürün" tab.

import { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import type { ProductInfo } from '@matbaapro/shared';
import { useCatalogStore } from '@/stores/studio';
import { uploadImage } from '@/lib/upload';
import { ProductInfoSettings } from './ProductInfoSettings';

type ExcelRow = Record<string, string | number | undefined>;

function rowToProduct(row: ExcelRow, i: number): ProductInfo {
  const sku =
    String(row.ARTNR ?? row.KOD ?? row.SKU ?? '').trim() || `u-${i}`;
  return {
    id: sku,
    sku,
    name: String(row.BEZEICHNUNG ?? row.URUN_ADI ?? row.AD ?? row.NAME ?? 'İsimsiz').trim(),
    price: String(row.VK_NETTO ?? row.FIYAT ?? row.PRICE ?? '0').trim(),
    category: String(row.KATEGORI ?? row.ARTGRP ?? row.CATEGORY ?? 'Yüklenen').trim(),
    image: String(row.RESIM ?? row.IMAGE ?? `/images/products/${sku}.png`).trim(),
    raw: row,
  };
}

export function ProductManagement() {
  const productPool = useCatalogStore((s) => s.productPool);
  const masterProductPool = useCatalogStore((s) => s.masterProductPool);
  const formas = useCatalogStore((s) => s.formas);
  const setProductPool = useCatalogStore((s) => s.setProductPool);
  const setMasterProductPool = useCatalogStore((s) => s.setMasterProductPool);
  const autoFillSlots = useCatalogStore((s) => s.autoFillSlots);
  const clearProducts = useCatalogStore((s) => s.clearProducts);
  const resetCatalog = useCatalogStore((s) => s.resetCatalog);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'used' | 'unused'>('all');
  const [layoutDrag, setLayoutDrag] = useState(false);
  const [masterDrag, setMasterDrag] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const layoutRef = useRef<HTMLInputElement>(null);
  const masterRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File, target: 'layout' | 'master') => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const rows = XLSX.utils.sheet_to_json<ExcelRow>(wb.Sheets[wb.SheetNames[0]], {
        defval: '',
      });
      const products = rows.map((r, i) => rowToProduct(r, i));
      if (target === 'layout') setProductPool(products);
      else setMasterProductPool(products);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleClearAll = () => {
    clearProducts();
    setProductPool([]);
    setMasterProductPool([]);
    setSearchTerm('');
  };

  const downloadDemoExcel = () => {
    const rows = [
      { POS: 1, ARTNR: 'SKU-1001', BEZEICHNUNG: 'Domates 1 Kg', VK_NETTO: '12,90', KATEGORI: 'Sebze', RESIM: '' },
      { POS: 2, ARTNR: 'SKU-1002', BEZEICHNUNG: 'Salatalık 1 Kg', VK_NETTO: '8,50', KATEGORI: 'Sebze', RESIM: '' },
      { POS: 3, ARTNR: 'SKU-1003', BEZEICHNUNG: 'Süt 1 L', VK_NETTO: '15,75', KATEGORI: 'Süt Ürünleri', RESIM: '' },
      { POS: 4, ARTNR: 'SKU-1004', BEZEICHNUNG: 'Yoğurt 1 Kg', VK_NETTO: '22,40', KATEGORI: 'Süt Ürünleri', RESIM: '' },
      { POS: 5, ARTNR: 'SKU-1005', BEZEICHNUNG: 'Ekmek', VK_NETTO: '5,00', KATEGORI: 'Fırın', RESIM: '' },
      { POS: 6, ARTNR: 'SKU-1006', BEZEICHNUNG: 'Yumurta 30lu', VK_NETTO: '49,90', KATEGORI: 'Kahvaltı', RESIM: '' },
      { POS: 7, ARTNR: 'SKU-1007', BEZEICHNUNG: 'Peynir 250 g', VK_NETTO: '89,00', KATEGORI: 'Süt Ürünleri', RESIM: '' },
      { POS: 8, ARTNR: 'SKU-1008', BEZEICHNUNG: 'Zeytin 500 g', VK_NETTO: '64,50', KATEGORI: 'Kahvaltı', RESIM: '' },
      { POS: 9, ARTNR: 'SKU-1009', BEZEICHNUNG: 'Çay 500 g', VK_NETTO: '110,00', KATEGORI: 'İçecek', RESIM: '' },
      { POS: 10, ARTNR: 'SKU-1010', BEZEICHNUNG: 'Kahve 250 g', VK_NETTO: '145,90', KATEGORI: 'İçecek', RESIM: '' },
      { POS: 11, ARTNR: 'SKU-1011', BEZEICHNUNG: 'Şeker 1 Kg', VK_NETTO: '32,00', KATEGORI: 'Bakliyat', RESIM: '' },
      { POS: 12, ARTNR: 'SKU-1012', BEZEICHNUNG: 'Un 5 Kg', VK_NETTO: '78,50', KATEGORI: 'Bakliyat', RESIM: '' },
    ];
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Urunler');
    XLSX.writeFile(wb, 'matbaapro-ornek.xlsx');
  };

  const activeSkus = useMemo(() => {
    const skus = new Set<string>();
    formas.forEach((f) =>
      f.pages.forEach((p) =>
        p.slots.forEach((s) => {
          if (s.product?.sku) skus.add(s.product.sku);
        }),
      ),
    );
    return skus;
  }, [formas]);

  const filteredMaster = useMemo(() => {
    let result = masterProductPool;

    if (filterType === 'used') {
      result = result.filter(p => activeSkus.has(p.sku ?? ''));
    } else if (filterType === 'unused') {
      result = result.filter(p => !activeSkus.has(p.sku ?? ''));
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [masterProductPool, searchTerm, filterType, activeSkus]);

  const groupedMaster = useMemo(() => {
    const acc: Record<string, ProductInfo[]> = {};
    for (const p of filteredMaster) {
      const cat = p.category ?? 'Diğer';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
    }
    return acc;
  }, [filteredMaster]);

  const usedCount = masterProductPool.filter(p => activeSkus.has(p.sku ?? '')).length;
  const unusedCount = masterProductPool.length - usedCount;

  return (
    <div className="space-y-4 font-sans text-text-primary">

      {/* HEADER BÖLÜMÜ */}
      <div className="flex items-start justify-between">
        <p className="text-[11px] text-text-secondary leading-snug w-[65%]">
          Excel dosyanızı yükleyerek ürünleri otomatik yerleştirin veya havuzdan sürükleyin.
        </p>
        <button
          onClick={downloadDemoExcel}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-panel text-text-secondary border border-border-strong rounded-radius-sm text-[11px] font-medium hover:bg-surface-subtle transition-colors shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Örnek Excel İndir
        </button>
      </div>

      <details open className="bg-surface-panel rounded-radius-lg border border-border-default shadow-drop-sm overflow-hidden">
        <summary className="text-[12px] font-bold text-text-primary cursor-pointer p-3 flex items-center justify-between bg-surface-subtle/60">
          <span>Ürün Bilgileri</span>
          <span className="text-[10px] font-medium text-text-muted">Seçili ürün verisini düzenle</span>
        </summary>
        <div className="p-3 border-t border-border-default">
          <ProductInfoSettings />
        </div>
      </details>

      <details className="bg-surface-panel rounded-radius-md border border-border-default">
        <summary className="text-[12px] font-medium text-text-primary cursor-pointer p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Excel Kolonları</span>
            <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="text-[10px] text-text-secondary p-2.5 pt-0 border-t border-border-default mt-1 space-y-1">
          <div><strong>POS</strong> / SIRA / INDEX → otomatik yerleştirme sırası</div>
          <div><strong>ARTNR</strong> / KOD / SKU → ürün kodu</div>
          <div><strong>BEZEICHNUNG</strong> / URUN_ADI / AD → ürün adı</div>
          <div><strong>VK_NETTO</strong> / FIYAT / PRICE → satış fiyatı</div>
          <div><strong>KATEGORI</strong> / ARTGRP → kategori (gruplama)</div>
          <div><strong>RESIM</strong> / IMAGE → görsel URL'si</div>
        </div>
      </details>

      {/* 1. OTOMATİK DİZİLİM */}
      <div className="bg-surface-panel rounded-radius-lg border border-border-default p-4 shadow-drop-sm">
        <div className="mb-3">
          <h4 className="text-[13px] font-bold text-text-primary">Excel ile Otomatik Yerleştir</h4>
          <p className="text-[10px] text-text-muted mt-0.5">POS / SIRA kolonu olan Excel, ürünleri numaralı hücrelere otomatik yerleştirir.</p>
        </div>

        <div className="mt-3">
          <DropZone
            dragging={layoutDrag}
            setDragging={setLayoutDrag}
            onFile={(f) => processFile(f, 'layout')}
            onClick={() => layoutRef.current?.click()}
            title="Sıralı broşür Excel'i yükle"
            iconColor="text-text-secondary"
            borderColor={layoutDrag ? 'border-border-strong' : 'border-border-default'}
            bgColor={layoutDrag ? 'bg-surface-subtle' : 'bg-surface-subtle/30'}
          />
          <input
            ref={layoutRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) processFile(f, 'layout');
              if (layoutRef.current) layoutRef.current.value = '';
            }}
            className="hidden"
          />
        </div>

        <div className="flex items-center justify-between mt-3 text-[11px]">
           <div className="flex items-center gap-1.5 text-emerald-600">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <span>{productPool.length} ürün yüklendi</span>
           </div>
           <div className="flex items-center gap-2">
             <button
               onClick={handleClearAll}
               title="Ürünleri Temizle"
               className="w-7 h-7 flex items-center justify-center bg-surface-subtle text-text-muted hover:bg-border-default hover:text-text-secondary rounded-radius-md transition-colors"
             >
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
               </svg>
             </button>
             <button
               onClick={() => {
                 if (confirm('Tüm katalog sıfırlansın mı?')) resetCatalog();
               }}
               title="Tümünü Sıfırla"
               className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 rounded-radius-md transition-colors"
             >
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
               </svg>
             </button>
           </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => autoFillSlots()}
            disabled={productPool.length === 0}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-radius-lg shadow-drop-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Yerleştir
          </button>
        </div>
      </div>

      {/* 2. ÜRÜN HAVUZU */}
      <div className="bg-surface-panel rounded-radius-lg border border-border-default p-4 shadow-drop-sm">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="text-[13px] font-bold text-text-primary">Ürün Havuzu</h4>
            <p className="text-[10px] text-text-muted mt-0.5">Genel ürün listenizi yükleyin, arayın ve boş hücrelere sürükleyin.</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-panel text-text-secondary border border-border-strong rounded-radius-lg text-[11px] font-medium hover:bg-surface-subtle transition-colors shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Ürün Ekle
          </button>
        </div>

        <div className="mt-3">
          <DropZone
            dragging={masterDrag}
            setDragging={setMasterDrag}
            onFile={(f) => processFile(f, 'master')}
            onClick={() => masterRef.current?.click()}
            title="Ürün havuzu Excel'i yükle"
            iconColor="text-text-secondary"
            borderColor={masterDrag ? 'border-border-strong' : 'border-border-default'}
            bgColor={masterDrag ? 'bg-surface-subtle' : 'bg-surface-subtle/30'}
          />
          <input
            ref={masterRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) processFile(f, 'master');
              if (masterRef.current) masterRef.current.value = '';
            }}
            className="hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 mt-3 text-[11px] text-emerald-600">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           <span>{masterProductPool.length} ürün havuzda</span>
        </div>

        <div className="flex gap-2 mt-4">
           <button
             onClick={() => masterRef.current?.click()}
             className="flex-1 border border-border-default bg-surface-panel hover:bg-surface-subtle text-text-secondary text-xs py-1.5 px-3 rounded-radius-md flex items-center justify-center gap-1.5 transition-colors"
           >
             <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
             Dosya Değiştir
           </button>
           <button
             onClick={() => setMasterProductPool([])}
             className="flex-1 border border-border-default bg-surface-panel hover:bg-surface-subtle text-text-secondary text-xs py-1.5 px-3 rounded-radius-md flex items-center justify-center gap-1.5 transition-colors"
           >
             <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
             </svg>
             Havuzu Temizle
           </button>
        </div>
      </div>

      {/* 3. ÜRÜN ARA VE SÜRÜKLE */}
      <div className="bg-surface-panel rounded-radius-lg border border-border-default p-4 shadow-drop-sm pb-2">
        <div className="mb-4">
          <h4 className="text-[13px] font-bold text-text-primary">Ürün Ara ve Sürükle</h4>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <div className="relative w-full">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Ürün adı veya kod ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-[13px] border rounded-radius-full border-border-default pl-10 pr-3 py-2 outline-none focus:border-border-strong placeholder:text-text-muted"
            />
          </div>

          {/* Sekmeler: Segmented Pill Control */}
          <div className="bg-surface-subtle p-1 rounded-radius-lg grid grid-cols-3 text-xs text-text-secondary">
            <button
              onClick={() => setFilterType('all')}
              className={`py-1.5 text-center transition-all ${filterType === 'all' ? 'bg-surface-panel text-text-primary shadow-drop-sm rounded-radius-md font-medium' : 'hover:text-text-primary'}`}
            >
              Tümü ({masterProductPool.length})
            </button>
            <button
              onClick={() => setFilterType('used')}
              className={`py-1.5 text-center transition-all ${filterType === 'used' ? 'bg-surface-panel text-text-primary shadow-drop-sm rounded-radius-md font-medium' : 'hover:text-text-primary'}`}
            >
              Kullanılan ({usedCount})
            </button>
            <button
              onClick={() => setFilterType('unused')}
              className={`py-1.5 text-center transition-all ${filterType === 'unused' ? 'bg-surface-panel text-text-primary shadow-drop-sm rounded-radius-md font-medium' : 'hover:text-text-primary'}`}
            >
              Kalan ({unusedCount})
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-3 pb-3">
          {masterProductPool.length === 0 ? (
            <div className="py-8 text-center text-text-muted flex flex-col items-center">
              <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-[12px]">Havuz boş. Yukarıdaki alandan Excel yükleyin.</p>
            </div>
          ) : filteredMaster.length === 0 ? (
            <div className="py-6 text-center text-text-muted">
               <p className="text-[12px]">Sonuç bulunamadı.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredMaster.map((p, i) => {
                const placed = activeSkus.has(p.sku ?? '');
                return (
                  <div
                    key={`${p.id ?? p.sku}-${i}`}
                    draggable={!placed}
                    onDragStart={(e) => {
                      if (!placed)
                        e.dataTransfer.setData('newProductFromSidebar', JSON.stringify(p));
                    }}
                    className={`flex items-center gap-3 bg-surface-panel border border-border-default rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-border-strong hover:shadow-drop-sm transition-all duration-200 group ${
                      placed ? 'cursor-not-allowed opacity-60' : 'cursor-grab active:cursor-grabbing'
                    }`}
                  >
                    <div className="w-10 h-10 bg-surface-panel rounded-radius-md border border-border-default flex justify-center items-center overflow-hidden shrink-0">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name ?? ''}
                          className={`max-w-full max-h-full object-contain ${placed ? 'opacity-50 grayscale' : ''}`}
                        />
                      ) : (
                        <span className="text-[9px] text-text-muted font-bold">Yok</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className={`text-[12px] font-semibold truncate ${placed ? 'text-text-muted' : 'text-text-primary'}`}>
                        {p.name}
                      </div>
                      <div className="text-[10px] text-text-muted mt-0.5">{p.sku}</div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className={`text-[12px] font-bold ${placed ? 'text-text-muted' : 'text-text-primary'}`}>
                        {p.price} €
                      </div>

                      {placed ? (
                         <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-medium border border-emerald-100">
                           Tasarımda var
                         </div>
                      ) : (
                         <div className="w-21"></div>
                      )}

                      <div className={`text-text-muted ${placed ? 'opacity-30' : 'group-hover:text-text-secondary'}`}>
                        <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
                           <circle cx="4" cy="4" r="1.5"/>
                           <circle cx="4" cy="10" r="1.5"/>
                           <circle cx="4" cy="16" r="1.5"/>
                           <circle cx="8" cy="4" r="1.5"/>
                           <circle cx="8" cy="10" r="1.5"/>
                           <circle cx="8" cy="16" r="1.5"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {masterProductPool.length > 0 && (
          <div className="pt-3 border-t border-border-default text-center">
            <button className="text-[12px] font-medium text-text-secondary hover:text-text-primary flex items-center justify-center w-full gap-1">
              Tümünü Gör ({filteredMaster.length} ürün)
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(product) => setMasterProductPool([product, ...masterProductPool])}
      />
    </div>
  );
}

function AddProductModal({
  isOpen,
  onClose,
  onAdd
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: ProductInfo) => void;
}) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const cleanupAndClose = () => {
    setName('');
    setSku('');
    setImageFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPurchasePrice('');
    setPrice('');
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalImageUrl = '';
      const newSku = sku.trim() || `SKU-${Date.now()}`;

      if (imageFile) {
        const ext = imageFile.name.substring(imageFile.name.lastIndexOf('.')) || '.png';
        const renamedFile = new File([imageFile], `${newSku}${ext}`, { type: imageFile.type });
        const uploadResult = await uploadImage(renamedFile);
        finalImageUrl = uploadResult.absoluteUrl;
      }
      const newProduct: ProductInfo = {
        id: newSku,
        sku: newSku,
        name: name.trim() || 'İsimsiz Ürün',
        price: price.trim() || '0',
        category: 'Manuel Eklenen',
        image: finalImageUrl || `/images/products/${newSku}.png`,
        raw: {
          AD: name,
          KOD: newSku,
          FIYAT: price,
          ALIS_FIYAT: purchasePrice
        },
      };

      onAdd(newProduct);
      cleanupAndClose();
    } catch (error) {
      console.error('Ürün eklenirken hata oluştu:', error);
      alert('Ürün yüklenirken bir hata oluştu, lütfen tekrar deneyin.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-surface-panel rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border-default flex items-center justify-between bg-surface-subtle/50">
          <h3 className="text-heading-xl text-text-primary">Yeni Ürün Ekle</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors p-1 rounded-radius-md hover:bg-surface-subtle">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-4">
            {/* Sol Taraf: Görsel Alanı (Kare) */}
            <div className="w-28 shrink-0">
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">Ürün Resmi</label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith('image/')) {
                    handleFile(file);
                  }
                }}
                className={`relative w-full aspect-square border-2 border-dashed rounded-xl overflow-hidden shadow-drop-sm group transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                  isDragging
                    ? 'border-border-strong bg-surface-subtle/50'
                    : previewUrl
                      ? 'border-transparent bg-surface-subtle'
                      : 'border-border-default hover:border-border-strong hover:bg-surface-subtle'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Önizleme" className="w-full h-full object-contain p-1" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="text-white text-[10px] font-medium flex flex-col items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Değiştir
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-text-muted p-2 pointer-events-none">
                    <svg className="w-6 h-6 text-text-muted group-hover:text-text-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] leading-tight">Sürükle veya<br/>Seç</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sağ Taraf: İsim ve SKU */}
            <div className="flex-1 space-y-4 flex flex-col justify-center">
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">Ürün Adı</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Domates 1 Kg"
                  className="w-full text-[13px] border border-border-default rounded-radius-lg px-3 py-2 outline-none focus:border-border-strong focus:ring-1 focus:ring-border-strong transition-all placeholder:text-text-muted shadow-drop-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">SKU / Ürün Kodu</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Örn: SKU-1001"
                  className="w-full text-[13px] border border-border-default rounded-radius-lg px-3 py-2 outline-none focus:border-border-strong focus:ring-1 focus:ring-border-strong transition-all placeholder:text-text-muted shadow-drop-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">Alış Fiyatı</label>
              <input
                type="text"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="Örn: 10,00"
                className="w-full text-[13px] border border-border-default rounded-radius-lg px-3 py-2 outline-none focus:border-border-strong focus:ring-1 focus:ring-border-strong transition-all placeholder:text-text-muted shadow-drop-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-primary mb-1.5">Satış Fiyatı (Fiyat)</label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Örn: 15,00"
                className="w-full text-[13px] border border-border-default rounded-radius-lg px-3 py-2 outline-none focus:border-border-strong focus:ring-1 focus:ring-border-strong transition-all placeholder:text-text-muted bg-surface-panel shadow-drop-sm font-medium"
              />
            </div>
          </div>

          <div className="pt-4 mt-2 flex gap-3">
            <button
              type="button"
              onClick={cleanupAndClose}
              disabled={isLoading}
              className="px-4 py-2.5 bg-surface-panel border border-border-default hover:bg-surface-subtle text-text-secondary font-semibold rounded-xl transition-all shadow-drop-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Yükleniyor...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ürünü Havuza Ekle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DropZone({
  dragging,
  setDragging,
  onFile,
  onClick,
  title,
  iconColor,
  borderColor,
  bgColor
}: {
  dragging: boolean;
  setDragging: (v: boolean) => void;
  onFile: (f: File) => void;
  onClick: () => void;
  title: string;
  iconColor: string;
  borderColor: string;
  bgColor: string;
}) {
  const activeBorder = dragging ? 'border-border-strong' : 'border-border-default';
  const activeBg = dragging ? 'bg-surface-subtle/60' : 'bg-surface-subtle/60';

  return (
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
        if (f) onFile(f);
      }}
      onClick={onClick}
      className={`border border-dashed rounded-xl p-3 cursor-pointer transition-all flex items-center justify-center gap-3 ${activeBorder} ${activeBg} hover:border-border-strong hover:bg-surface-subtle/30`}
    >
      <div className={`w-8 h-8 rounded-radius-lg bg-surface-panel shadow-drop-sm flex items-center justify-center shrink-0 ${iconColor}`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <div className="flex flex-col text-left">
        <div className="text-[12px] font-semibold text-text-primary">
          {title}
        </div>
        <div className="text-[10px] text-text-muted">Excel sürükleyin veya tıklayıp seçin</div>
      </div>
    </div>
  );
}
