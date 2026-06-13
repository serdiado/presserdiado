// Save/Load whole studio state (catalog + layers) as a portable JSON file.

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useCatalogStore, useHistoryStore, useLayerStore } from '@/stores/studio';
import { serializeProjectFile, deserializeProjectFile } from '../lib/projectSerializer';
import { exportPresetFromState } from '../presets/studioPresets';

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
    try {
      const data = serializeProjectFile();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.name || 'proje'}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Proje JSON olarak kaydedildi');
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Proje serialize edilirken hata oluştu');
    }
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

  const handleExportPreset = async () => {
    try {
      const preset = exportPresetFromState();
      const json = JSON.stringify(preset, null, 2);
      console.log('[Preset Export]\n' + json);
      await navigator.clipboard.writeText(json);
      toast.success('Preset JSON panoya kopyalandı (konsola da yazıldı)');
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Preset kopyalanamadı — konsoldan alabilirsiniz');
    }
  };

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(String(evt.target?.result));
        deserializeProjectFile(data);
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
        className="h-8 px-3 rounded-radius-md text-xs font-semibold border border-border-strong bg-surface-panel text-text-secondary hover:bg-surface-subtle"
      >
        💾 Proje
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-56 bg-surface-panel border border-border-default rounded-radius-lg shadow-xl p-1 z-99999">
          <button
            onClick={handleSave}
            className="w-full text-left px-3 py-2 hover:bg-surface-subtle rounded text-xs"
          >
            <div className="font-bold text-text-secondary">JSON Kaydet</div>
            <div className="text-[10px] text-text-muted">Tüm tasarımı .json olarak indir</div>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full text-left px-3 py-2 hover:bg-surface-subtle rounded text-xs"
          >
            <div className="font-bold text-text-secondary">JSON Yükle</div>
            <div className="text-[10px] text-text-muted">Daha önce kaydedilmiş projeyi aç</div>
          </button>
          <div className="my-1 border-t border-border-default" />
          <button
            onClick={handleDuplicate}
            className="w-full text-left px-3 py-2 hover:bg-surface-subtle rounded text-xs"
          >
            <div className="font-bold text-text-secondary">Çoğalt</div>
            <div className="text-[10px] text-text-muted">
              Mevcut tasarımı yeni projeye klonla (havuzu sıfırlar)
            </div>
          </button>
          {import.meta.env.DEV && (
            <>
              <div className="my-1 border-t border-border-default" />
              <button
                onClick={handleExportPreset}
                className="w-full text-left px-3 py-2 hover:bg-surface-subtle rounded text-xs"
              >
                <div className="font-bold text-text-secondary">Preset Kopyala (dev)</div>
                <div className="text-[10px] text-text-muted">
                  Mevcut tasarımı StudioPreset JSON olarak panoya kopyala
                </div>
              </button>
            </>
          )}
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
