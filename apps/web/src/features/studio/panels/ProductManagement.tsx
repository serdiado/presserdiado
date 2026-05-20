// Excel import + master pool browser. Replaces the basic product list in
// Sidebar's "Ürün" tab.

import { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import type { ProductInfo } from '@matbaapro/shared';
import { useCatalogStore } from '@/stores/studio';

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
  const [layoutDrag, setLayoutDrag] = useState(false);
  const [masterDrag, setMasterDrag] = useState(false);
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
    if (!searchTerm) return masterProductPool;
    const q = searchTerm.toLowerCase();
    return masterProductPool.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q),
    );
  }, [masterProductPool, searchTerm]);

  const groupedMaster = useMemo(() => {
    const acc: Record<string, ProductInfo[]> = {};
    for (const p of filteredMaster) {
      const cat = p.category ?? 'Diğer';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
    }
    return acc;
  }, [filteredMaster]);

  return (
    <div className="space-y-3">
      <button
        onClick={downloadDemoExcel}
        className="w-full px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold rounded border border-amber-200"
      >
        📥 Örnek Excel İndir (12 ürün, POS kolonu ile)
      </button>

      <details className="bg-slate-100 rounded p-2 border border-slate-200">
        <summary className="text-[10px] font-bold text-slate-600 cursor-pointer">
          Desteklenen Excel kolonları
        </summary>
        <div className="text-[9px] text-slate-500 pt-2 space-y-0.5">
          <div>
            <strong>POS</strong> / SIRA / INDEX → otomatik yerleştirme sırası
          </div>
          <div>
            <strong>ARTNR</strong> / KOD / SKU → ürün kodu
          </div>
          <div>
            <strong>BEZEICHNUNG</strong> / URUN_ADI / AD → ürün adı
          </div>
          <div>
            <strong>VK_NETTO</strong> / FIYAT / PRICE → satış fiyatı
          </div>
          <div>
            <strong>KATEGORI</strong> / ARTGRP → kategori (gruplama)
          </div>
          <div>
            <strong>RESIM</strong> / IMAGE → görsel URL'si
          </div>
        </div>
      </details>

      <div>
        <h4 className="text-[10px] font-black text-slate-500 mb-2">
          1. OTOMATİK DİZİLİM (POS)
        </h4>
        <DropZone
          dragging={layoutDrag}
          setDragging={setLayoutDrag}
          onFile={(f) => processFile(f, 'layout')}
          onClick={() => layoutRef.current?.click()}
          subtitle={`${productPool.length} ürün yüklü`}
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

        <div className="flex gap-1 mt-2">
          <button
            onClick={() => autoFillSlots()}
            disabled={productPool.length === 0}
            className="flex-1 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded text-[10px] font-bold hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Yerleştir
          </button>
          <button
            onClick={handleClearAll}
            className="flex-1 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-bold hover:bg-slate-200"
          >
            Temizle
          </button>
          <button
            onClick={() => {
              if (confirm('Tüm katalog sıfırlansın mı?')) resetCatalog();
            }}
            className="flex-1 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded text-[10px] font-bold hover:bg-red-100"
          >
            Sıfırla
          </button>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200">
        <h4 className="text-[10px] font-black text-slate-500 mb-2">
          2. ÜRÜN HAVUZU (Sürükle-Bırak)
        </h4>
        <DropZone
          dragging={masterDrag}
          setDragging={setMasterDrag}
          onFile={(f) => processFile(f, 'master')}
          onClick={() => masterRef.current?.click()}
          subtitle={`${masterProductPool.length} ürün havuzda`}
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

      <div className="pt-3 border-t border-slate-200">
        <input
          type="text"
          placeholder="Ara (isim/SKU)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 outline-none focus:border-blue-500"
        />
        <div className="mt-2 space-y-3 max-h-[60vh] overflow-y-auto">
          {masterProductPool.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center p-3">
              Havuz boş. Yukarıdaki alandan Excel yükleyin.
            </p>
          ) : (
            Object.entries(groupedMaster).map(([cat, products]) => (
              <div key={cat}>
                <div className="flex items-center justify-between px-2 py-1.5 bg-slate-200 rounded text-[10px] font-bold text-slate-700 mb-1">
                  <span>{cat}</span>
                  <span className="bg-white px-1.5 rounded">{products.length}</span>
                </div>
                <div className="flex flex-col gap-1">
                  {products.map((p, i) => {
                    const placed = activeSkus.has(p.sku ?? '');
                    return (
                      <div
                        key={`${p.id ?? p.sku}-${i}`}
                        draggable={!placed}
                        onDragStart={(e) => {
                          if (!placed)
                            e.dataTransfer.setData('newProductFromSidebar', JSON.stringify(p));
                        }}
                        className={`flex items-center gap-2 p-1.5 rounded-md border ${
                          placed
                            ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed grayscale'
                            : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm cursor-grab active:cursor-grabbing'
                        }`}
                      >
                        <div className="w-8 h-8 bg-slate-50 rounded border flex justify-center items-center overflow-hidden shrink-0">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name ?? ''}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <span className="text-[8px] text-slate-400 font-bold">Yok</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold text-slate-800 truncate">
                            {p.name}
                          </div>
                          <div className="flex justify-between mt-0.5">
                            <span className="text-[9px] text-slate-500">{p.sku}</span>
                            <span className="text-[9px] font-bold text-blue-600">
                              {p.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function DropZone({
  dragging,
  setDragging,
  onFile,
  onClick,
  subtitle,
}: {
  dragging: boolean;
  setDragging: (v: boolean) => void;
  onFile: (f: File) => void;
  onClick: () => void;
  subtitle: string;
}) {
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
      className={`border-2 border-dashed rounded-md p-3 text-center cursor-pointer transition-all ${
        dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-blue-300'
      }`}
    >
      <div className="text-[11px] font-bold text-slate-600 mb-0.5">
        Excel sürükleyin veya tıklayın
      </div>
      <div className="text-[9px] text-slate-400">.xlsx · .xls · .csv — {subtitle}</div>
    </div>
  );
}
