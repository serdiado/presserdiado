// Save/Load whole studio state (catalog + layers) as a portable JSON file.

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useCatalogStore, useHistoryStore, useLayerStore } from '@/stores/studio';

interface ProjectFile {
  version: 1;
  catalog: {
    activeTemplate: ReturnType<typeof useCatalogStore.getState>['activeTemplate'];
    formas: ReturnType<typeof useCatalogStore.getState>['formas'];
    activeFormaId: number;
    activeTab: 'outer' | 'inner';
    productPool: ReturnType<typeof useCatalogStore.getState>['productPool'];
    masterProductPool: ReturnType<typeof useCatalogStore.getState>['masterProductPool'];
    tempProductPool: ReturnType<typeof useCatalogStore.getState>['tempProductPool'];
    globalSettings: ReturnType<typeof useCatalogStore.getState>['globalSettings'];
  };
  layers: ReturnType<typeof useLayerStore.getState>['layers'];
  exportedAt: string;
}

export function ProjectMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSave = () => {
    const c = useCatalogStore.getState();
    const l = useLayerStore.getState();
    const data: ProjectFile = {
      version: 1,
      catalog: {
        activeTemplate: c.activeTemplate,
        formas: c.formas,
        activeFormaId: c.activeFormaId,
        activeTab: c.activeTab,
        productPool: c.productPool,
        masterProductPool: c.masterProductPool,
        tempProductPool: c.tempProductPool,
        globalSettings: c.globalSettings,
      },
      layers: l.layers,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matbaapro-proje-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Proje JSON olarak kaydedildi');
    setOpen(false);
  };

  const handleDuplicate = () => {
    // Mevcut state'i clone, tempPool & history sıfırla, productPool boşalt
    const c = useCatalogStore.getState();
    const cloned = JSON.parse(JSON.stringify(c.formas));
    useCatalogStore.setState({
      formas: cloned,
      tempProductPool: [],
      productPool: [],
      copiedSlotSettings: null,
    });
    useHistoryStore.getState().clearHistory();
    toast.success('Katalog çoğaltıldı (yeni proje)');
    setOpen(false);
  };

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(String(evt.target?.result)) as ProjectFile;
        if (!data.catalog?.formas) throw new Error('Geçersiz proje');

        // Reset image edit fields to safe defaults (legacy normalize).
        const gs = data.catalog.globalSettings ?? ({} as never);
        useCatalogStore.setState({
          activeTemplate: data.catalog.activeTemplate,
          formas: data.catalog.formas,
          activeFormaId: data.catalog.activeFormaId ?? 1,
          activeTab: data.catalog.activeTab ?? 'outer',
          productPool: data.catalog.productPool ?? [],
          masterProductPool: data.catalog.masterProductPool ?? [],
          tempProductPool: data.catalog.tempProductPool ?? [],
          globalSettings: {
            ...gs,
            imageScale: 100,
            imagePosX: 0,
            imagePosY: 0,
            imageEditMode: false,
          },
          copiedSlotSettings: null,
        });
        useLayerStore.setState({ layers: data.layers ?? [], selectedPageIds: [] });
        useHistoryStore.getState().clearHistory();
        toast.success('Proje yüklendi');
      } catch (err) {
        console.error(err);
        toast.error('Geçersiz veya bozuk proje dosyası');
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-8 px-3 rounded-md text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      >
        💾 Proje
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-xl p-1 z-[99999]">
          <button
            onClick={handleSave}
            className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-xs"
          >
            <div className="font-bold text-slate-700">JSON Kaydet</div>
            <div className="text-[10px] text-slate-500">Tüm tasarımı .json olarak indir</div>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-xs"
          >
            <div className="font-bold text-slate-700">JSON Yükle</div>
            <div className="text-[10px] text-slate-500">Daha önce kaydedilmiş projeyi aç</div>
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button
            onClick={handleDuplicate}
            className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-xs"
          >
            <div className="font-bold text-blue-700">Çoğalt</div>
            <div className="text-[10px] text-slate-500">
              Mevcut tasarımı yeni projeye klonla (havuzu sıfırlar)
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleLoadFile}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
