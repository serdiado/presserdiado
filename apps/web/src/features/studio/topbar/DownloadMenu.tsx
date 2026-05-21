import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useCatalogStore, useLayerStore } from '@/stores/studio';

type Format = 'pdf' | 'png' | 'jpeg';

const FORMATS: { value: Format; label: string; hint: string }[] = [
  { value: 'pdf', label: 'PDF (tüm formalar)', hint: 'Yüksek kalite, vektörel' },
  { value: 'png', label: 'PNG (aktif forma)', hint: 'Şeffaf zemin, 300 DPI' },
  { value: 'jpeg', label: 'JPEG (aktif forma)', hint: 'Düşük dosya boyutu' },
];

export function DownloadMenu() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<Format | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const formas = useCatalogStore((s) => s.formas);
  const activeFormaId = useCatalogStore((s) => s.activeFormaId);
  const catalogState = useCatalogStore((s) => s);
  const layers = useLayerStore((s) => s.layers);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const download = async (format: Format) => {
    setBusy(format);
    try {
      const formaIds = format === 'pdf' ? formas.map((f) => f.id) : [activeFormaId];
      const persistShape = {
        activeTemplate: catalogState.activeTemplate,
        formas: catalogState.formas,
        activeFormaId: catalogState.activeFormaId,
        activeTab: catalogState.activeTab,
        productPool: catalogState.productPool,
        masterProductPool: catalogState.masterProductPool,
        tempProductPool: catalogState.tempProductPool,
        globalSettings: catalogState.globalSettings,
        copiedSlotSettings: catalogState.copiedSlotSettings,
      };

      const res = await api.post(
        '/export',
        {
          formaIds,
          format,
          catalogState: persistShape,
          layerState: { layers },
        },
        { responseType: 'blob', timeout: 120000 },
      );

      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'pdf' ? 'Katalog.pdf' : `katalog.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('İndirme başladı');
    } catch (err) {
      console.error(err);
      toast.error('Dışa aktarma hatası');
    } finally {
      setBusy(null);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={busy !== null}
        className="h-8 px-3.5 rounded-md text-xs font-semibold border border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {busy ? `Hazırlanıyor (${busy.toUpperCase()})…` : '⬇ İndir'}
      </button>
      {open && !busy && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-1 z-99999">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              onClick={() => download(f.value)}
              className="w-full text-left p-2 hover:bg-slate-50 rounded"
            >
              <div className="text-xs font-bold text-slate-700">{f.label}</div>
              <div className="text-[10px] text-slate-500">{f.hint}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
