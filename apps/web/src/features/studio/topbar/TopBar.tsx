import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalogStore, useHistoryStore, useUIStore } from '@/stores/studio';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { Undo2, Redo2, Home, Sparkles, Save, Copy, Trash2, RotateCcw, ChevronDown, Search } from 'lucide-react';
import { DownloadMenu } from './DownloadMenu';
import { PriceCalculator } from '../pricing/PriceCalculator';
import { ConfirmDialog } from '@/components/ui';
import { SyncStatus } from './SyncStatus';

export function TopBar() {
  const navigate = useNavigate();
  const formas = useCatalogStore((s) => s.formas);
  const activeFormaId = useCatalogStore((s) => s.activeFormaId);
  const setActiveFormaId = useCatalogStore((s) => s.setActiveFormaId);

  const userScale = useUIStore((s) => s.userScale);
  const resetZoom = useUIStore((s) => s.resetZoom);

  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);
  const past = useHistoryStore((s) => s.past);
  const future = useHistoryStore((s) => s.future);

  const clearProducts = useCatalogStore((s) => s.clearProducts);
  const resetCatalog = useCatalogStore((s) => s.resetCatalog);
  const setSetupModalOpen = useUIStore((s) => s.setSetupModalOpen);

  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const fileMenuRef = useRef<HTMLDivElement>(null);

  const [isClearOpen, setIsClearOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setFileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleNewDesign = () => {
    setSetupModalOpen(true);
    setFileMenuOpen(false);
  };

  const handleClearProducts = () => {
    clearProducts();
    setIsClearOpen(false);
  };

  const handleResetCatalog = () => {
    resetCatalog();
    setIsResetOpen(false);
  };

  return (
    <div className="h-14 bg-surface-panel border-b border-border-default flex items-center justify-between px-4 shrink-0 shadow-drop-sm relative z-1001">
      {/* Sol Grup */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          title="Kullanıcı Paneli"
          className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-border-strong rounded-radius-md transition-colors"
        >
          <Home size={16} />
        </button>

        {/* Dosya Dropdown Menüsü */}
        <div ref={fileMenuRef} className="relative">
          <button
            onClick={() => setFileMenuOpen(!fileMenuOpen)}
            title="Dosya İşlemleri"
            className={`h-8 px-3.5 flex items-center justify-center text-body-md font-medium rounded-radius-md transition-colors gap-1.5 border border-border-strong ${
              fileMenuOpen
                ? 'bg-surface-subtle text-text-primary'
                : 'text-text-secondary bg-surface-panel hover:text-text-primary hover:bg-surface-subtle'
            }`}
          >
            Dosya
            <ChevronDown size={14} className="opacity-60" />
          </button>

          {fileMenuOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-surface-panel border border-border-default rounded-radius-lg shadow-drop-lg p-1 z-99999 animate-in fade-in slide-in-from-top-2 duration-100">
              {/* Yeni Tasarım Başlat */}
              <button
                onClick={handleNewDesign}
                className="w-full text-left px-3 py-2.5 hover:bg-surface-subtle rounded-radius-md text-body-md font-medium text-text-secondary hover:text-text-primary transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <Sparkles size={16} className="text-warning shrink-0" />
                <span>Yeni Tasarım Başlat...</span>
              </button>

              {/* Değişiklikleri Kaydet */}
              <button
                disabled
                title="Tasarımı kaydetmek için bulut bağlantısı yakında eklenecektir."
                className="w-full text-left px-3 py-2.5 rounded-radius-md text-body-md font-medium text-text-muted opacity-35 cursor-not-allowed flex items-center justify-between gap-2.5 select-none"
              >
                <span className="flex items-center gap-2.5">
                  <Save size={16} className="shrink-0" />
                  <span>Değişiklikleri Kaydet</span>
                </span>
                <span className="text-body-xs font-medium bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded-radius-md">Yakında</span>
              </button>

              {/* Projeyi Çoğalt */}
              <button
                disabled
                title="Tasarımı çoğaltmak için proje yönetimi yakında eklenecektir."
                className="w-full text-left px-3 py-2.5 rounded-radius-md text-body-md font-medium text-text-muted opacity-35 cursor-not-allowed flex items-center justify-between gap-2.5 select-none"
              >
                <span className="flex items-center gap-2.5">
                  <Copy size={16} className="shrink-0" />
                  <span>Projeyi Çoğalt (Klonla)</span>
                </span>
                <span className="text-body-xs font-medium bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded-radius-md">Yakında</span>
              </button>

              <hr className="border-border-default my-1" />

              {/* Sadece Ürünleri Temizle */}
              <button
                onClick={() => {
                  setIsClearOpen(true);
                  setFileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 hover:bg-danger/10 rounded-radius-md text-body-md font-medium text-danger hover:text-danger transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <Trash2 size={16} className="text-danger shrink-0" />
                <span>Sadece Ürünleri Temizle</span>
              </button>

              {/* Tasarımı Sıfırla */}
              <button
                onClick={() => {
                  setIsResetOpen(true);
                  setFileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 hover:bg-danger/10 rounded-radius-md text-body-md font-medium text-danger hover:text-danger transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <RotateCcw size={16} className="text-danger shrink-0" />
                <span>Tasarımı Sıfırla</span>
              </button>
            </div>
          )}
        </div>

        {/* Özel Onay Modalları */}
        <ConfirmDialog
          isOpen={isClearOpen}
          title="Ürünleri Temizle"
          description="Katalog sayfalarındaki tüm yerleştirilmiş ürünler kaldırılacaktır. Sayfa tasarımlarınız, mizanpajınız ve arka plan ayarlarınız korunur. Devam etmek istiyor musunuz?"
          confirmLabel="Ürünleri Temizle"
          confirmVariant="primary"
          onConfirm={handleClearProducts}
          onCancel={() => setIsClearOpen(false)}
        />

        <ConfirmDialog
          isOpen={isResetOpen}
          title="Tüm Tasarımı Sıfırla"
          description="Tasarımınız ilk haline döndürülecektir. Yapılan tüm değişiklikler, eklenen katmanlar ve yerleştirilen ürünler geri alınamaz şekilde silinecektir. Emin misiniz?"
          confirmLabel="Tasarımı Sıfırla"
          confirmVariant="danger"
          onConfirm={handleResetCatalog}
          onCancel={() => setIsResetOpen(false)}
        />

        <div className="flex items-center gap-1 border-l pl-3 border-border-default">
          <button
            onClick={undo}
            disabled={past.length === 0}
            title="Geri Al (Ctrl+Z)"
            className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-radius-md disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            title="İleri Al (Ctrl+Shift+Z)"
            className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-radius-md disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Redo2 size={16} />
          </button>
          <SyncStatus />
        </div>
      </div>

      {/* Orta Grup */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <span className="text-heading-md font-medium text-text-primary">Katalog 2026 - Taslak</span>
      </div>

      {/* Sağ Grup */}
      <div className="flex items-center gap-3">
        <button
          onClick={resetZoom}
          title="Fit / Sıfırla (zoom %)"
          className={`h-8 px-3.5 rounded-radius-md text-body-md font-medium border transition-all min-w-20 flex items-center justify-center gap-1.5 ${
            userScale !== 1
              ? 'bg-surface-subtle border-border-strong text-text-primary hover:bg-surface-subtle'
              : 'bg-surface-panel border-border-strong text-text-secondary hover:bg-surface-subtle'
          }`}
        >
          <Search size={14} className="shrink-0" />
          <span>{Math.round(userScale * 100)}%</span>
        </button>

        <PriceCalculator />
        <DownloadMenu />
        <ThemeToggle compact />
      </div>
    </div>
  );
}
