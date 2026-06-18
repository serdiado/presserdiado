import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Columns2, X } from 'lucide-react';
import { useCatalogStore } from '@/stores/studio';

/**
 * Forma adını gösterim parçalarına ayırır.
 * "Forma 1 (Kapaklar)" -> { ordinal: "Forma 1", tag: "Kapaklar" }
 * Parantez yoksa (kullanıcı yeniden adlandırmışsa) tag = tam ad (geri-uyum).
 */
function parseFormaLabel(name: string, index: number) {
  const m = name.match(/\(([^)]+)\)/);
  return { ordinal: `Forma ${index + 1}`, tag: (m ? m[1] : name).trim() };
}

/**
 * Aktif formayı her zaman gösteren ve tek tıkla geçiş sağlayan gösterge.
 *
 * Mount: StudioPage'in kanvas sütununa (pan/zoom yemeyen chrome) absolute, alt-orta.
 * Kanvasa bağlı/scale DEĞİL — kaydırma/zoom'dan etkilenmez, hep aynı yerde ve okunur kalır.
 * Yalnız !isPreviewMode'da render edilir (koşullu mount StudioPage'te).
 *
 * Yapı: pill (ikon + "Aktif Forma" / "Forma {sıra} · {etiket}" + chevron). Tıklama →
 * formaların listesi chip'e çapalı dropdown (portal) olarak açılır; forma seçilince
 * setActiveFormaId çağrılır (sol flyout ile birebir aynı mekanizma) ve dropdown kapanır.
 *
 * Klavye: PageUp = önceki, PageDown = sonraki forma (wrap YOK — sınırda durur).
 * Metin girişi (input/textarea/contentEditable) odaktayken devre dışı.
 */
export function FormaIndicatorChip() {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ left: number; bottom: number } | null>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const formas = useCatalogStore((s) => s.formas);
  const activeFormaId = useCatalogStore((s) => s.activeFormaId);
  const setActiveFormaId = useCatalogStore((s) => s.setActiveFormaId);

  const activeIndex = formas.findIndex((f) => f.id === activeFormaId);
  const activeForma = formas[activeIndex] ?? formas[0];

  // Overlay açıkken Escape ile kapat
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Dış-tık ile kapat: chip ve overlay dışındaki mousedown kapatır. Chip hariç tutulur ki
  // chip'e tıklama toggle olarak çalışsın (mousedown kapatmaz → onClick handleToggle kapatır).
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (overlayRef.current?.contains(target)) return;
      if (chipRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  // PageUp/PageDown ile forma geçişi (wrap yok; metin girişi odaktayken pasif).
  // Çakışma kontrolü: kod tabanında başka PageUp/PageDown bağlaması yok ve kanvas/main
  // overflow-hidden (native scroll yok) → bu tuşları forma navigasyonuna güvenle ayırıyoruz.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'PageUp' && e.key !== 'PageDown') return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      e.preventDefault();
      const { formas: fs, activeFormaId: aid, setActiveFormaId: setId } = useCatalogStore.getState();
      const idx = fs.findIndex((f) => f.id === aid);
      if (idx === -1) return;
      if (e.key === 'PageUp') {
        if (idx > 0) setId(fs[idx - 1].id);
      } else {
        if (idx < fs.length - 1) setId(fs[idx + 1].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Overlay'i chip'e çapalı aç/kapat: chip'in screen-space konumunu okuyup portal'ı
  // chip'in hemen üstüne (yatayda ortalı) yerleştir.
  const handleToggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = chipRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({
        left: rect.left + rect.width / 2,
        bottom: window.innerHeight - rect.top + 12, // 12px boşluk, chip'in üstünde
      });
    }
    setOpen(true);
  };

  if (!activeForma) return null;

  const active = parseFormaLabel(activeForma.name, activeIndex);

  return (
    <>
      {/* Alt-orta sabit chrome — kanvas sütununa absolute (pan/zoom'dan bağımsız). */}
      <div ref={chipRef} className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2">
        <button
          type="button"
          onClick={handleToggle}
          title="Forma değiştir (PageUp / PageDown)"
          className="flex cursor-pointer items-center gap-2.5 rounded-full border border-border-default bg-surface-panel py-2 pl-2 pr-3.5 shadow-drop-md transition-colors hover:border-border-strong"
        >
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-blue-50">
            <Columns2 size={16} className="text-blue-600" />
          </span>
          <span className="text-body-sm font-semibold text-text-primary">
            {active.ordinal} · {active.tag}
          </span>
          <ChevronDown
            size={16}
            className={`flex-none text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {open &&
        coords &&
        createPortal(
          <div
            ref={overlayRef}
            style={{ left: coords.left, bottom: coords.bottom }}
            className="fixed z-100000 max-h-[50vh] w-72 -translate-x-1/2 animate-in overflow-y-auto rounded-2xl border border-border-default bg-surface-panel shadow-2xl duration-150 fade-in zoom-in-95 slide-in-from-bottom-1"
          >
            <div className="flex items-center gap-2 border-b border-border-default px-4 py-3">
              <span className="text-heading-md text-text-primary">Formalar</span>
              <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-body-xs font-semibold text-text-secondary">
                {formas.length} forma
              </span>
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Kapat"
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-2">
              {formas.map((f, i) => {
                const isActive = f.id === activeFormaId;
                const { ordinal, tag } = parseFormaLabel(f.name, i);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setActiveFormaId(f.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors ${
                      i > 0 ? 'mt-0.5' : ''
                    } ${isActive ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset' : 'hover:bg-surface-subtle'}`}
                  >
                    <span className="flex h-13 w-13 flex-none items-center justify-center rounded-[10px] border border-blue-500/15 bg-blue-50">
                      <Columns2 size={26} className="text-blue-600" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body-sm font-semibold text-text-primary">{ordinal}</span>
                      <span className="mt-0.5 block text-body-xs text-text-secondary">
                        {tag} - {f.pages.length} Sayfa
                      </span>
                    </span>
                    {isActive && (
                      <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-blue-600">
                        <Check size={13} className="text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
