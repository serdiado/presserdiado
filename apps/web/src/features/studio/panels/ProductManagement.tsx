// Excel import + master pool browser. Replaces the basic product list in
// Sidebar's "Ürün" tab.

import { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Settings2 } from 'lucide-react';
import type { ProductInfo } from '@matbaapro/shared';
import { useCatalogStore } from '@/stores/studio';
import { ProductInfoSettings } from './ProductInfoSettings';
import { Button } from '@/components/ui';

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
  const setProductPool = useCatalogStore((s) => s.setProductPool);
  const autoFillSlots = useCatalogStore((s) => s.autoFillSlots);
  const clearProducts = useCatalogStore((s) => s.clearProducts);
  const resetCatalog = useCatalogStore((s) => s.resetCatalog);

  const [layoutDrag, setLayoutDrag] = useState(false);
  const layoutRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const rows = XLSX.utils.sheet_to_json<ExcelRow>(wb.Sheets[wb.SheetNames[0]], {
        defval: '',
      });
      const products = rows.map((r, i) => rowToProduct(r, i));
      setProductPool(products);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleClearAll = () => {
    clearProducts();
    setProductPool([]);
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

  return (
    <div className="space-y-4 font-sans text-text-primary">

      {/* HEADER BÖLÜMÜ */}
      <div className="flex items-start justify-between">
        <p className="text-body-xs text-text-secondary leading-snug w-[65%]">
          Excel dosyanızı yükleyerek ürünleri otomatik yerleştirin veya havuzdan sürükleyin.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={downloadDemoExcel}
          leftIcon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
          className="shrink-0"
        >
          Örnek Excel indir
        </Button>
      </div>

      {/* 1. OTOMATİK DİZİLİM */}
      <div className="bg-surface-panel rounded-radius-lg border border-border-default p-4 shadow-drop-sm">
        <div className="mb-3">
          <h4 className="text-label-sm text-text-secondary">Excel ile otomatik yerleştir</h4>
          <p className="text-body-xs text-text-muted mt-0.5">POS / SIRA kolonu olan Excel, ürünleri numaralı hücrelere otomatik yerleştirir.</p>
        </div>

        <div className="mt-3">
          <DropZone
            dragging={layoutDrag}
            setDragging={setLayoutDrag}
            onFile={(f) => processFile(f)}
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
              if (f) processFile(f);
              if (layoutRef.current) layoutRef.current.value = '';
            }}
            className="hidden"
          />
        </div>

        <div className="flex items-center justify-between mt-3 text-[11px]">
           <div className="flex items-center gap-1.5 text-body-xs text-success">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <span>{productPool.length} ürün yüklendi</span>
           </div>
           <div className="flex items-center gap-2">
             <Button
               variant="ghost"
               className="p-2"
               onClick={handleClearAll}
             >
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
               </svg>
             </Button>
             <Button
               variant="ghost"
               className="p-2"
               onClick={() => {
                 if (confirm('Tüm katalog sıfırlansın mı?')) resetCatalog();
               }}
             >
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
               </svg>
             </Button>
           </div>
        </div>

        <div className="mt-4">
          <Button
            variant="primary"
            fullWidth
            disabled={productPool.length === 0}
            onClick={() => autoFillSlots()}
            leftIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
          >
            Yerleştir
          </Button>
        </div>
      </div>

      {/* GELİŞMİŞ AYARLAR (BİRLEŞTİRİLMİŞ AKORDİYON) */}
      <details className="bg-surface-panel rounded-radius-lg border border-border-default shadow-drop-sm overflow-hidden">
        <summary className="text-heading-md text-text-primary cursor-pointer p-3 flex items-center justify-between bg-surface-subtle/60 select-none">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-text-muted" />
            <span className="text-heading-md text-text-primary font-medium">Gelişmiş ayarlar</span>
          </div>
          <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="p-3 border-t border-border-default space-y-4">
          <div>
            <h5 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">Ürün Bilgisi</h5>
            <ProductInfoSettings />
          </div>
          <hr className="border-border-default" />
          <div>
            <h5 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">Excel Sütunları</h5>
            <div className="text-body-xs text-text-secondary space-y-1 p-2 bg-surface-subtle/30 rounded border border-border-default">
              <div><strong>POS</strong> / SIRA / INDEX → otomatik yerleştirme sırası</div>
              <div><strong>ARTNR</strong> / KOD / SKU → ürün kodu</div>
              <div><strong>BEZEICHNUNG</strong> / URUN_ADI / AD → ürün adı</div>
              <div><strong>VK_NETTO</strong> / FIYAT / PRICE → satış fiyatı</div>
              <div><strong>KATEGORI</strong> / ARTGRP → kategori (gruplama)</div>
              <div><strong>RESIM</strong> / IMAGE → görsel URL'si</div>
            </div>
          </div>
        </div>
      </details>

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
      className={`border border-dashed rounded-radius-lg p-3 cursor-pointer transition-all flex items-center justify-center gap-3 ${activeBorder} ${activeBg} hover:border-border-strong hover:bg-surface-subtle/30`}
    >
      <div className={`w-8 h-8 rounded-radius-lg bg-surface-panel shadow-drop-sm flex items-center justify-center shrink-0 ${iconColor}`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <div className="flex flex-col text-left">
        <div className="text-label-sm text-text-primary">
          {title}
        </div>
        <div className="text-body-xs text-text-muted">Excel sürükleyin veya tıklayıp seçin</div>
      </div>
    </div>
  );
}
