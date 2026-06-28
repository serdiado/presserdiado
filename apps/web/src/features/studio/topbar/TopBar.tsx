import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCatalogStore, useHistoryStore, useUIStore } from '@/stores/studio';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { Undo2, Redo2, Home, Sparkles, Save, Copy, Trash2, RotateCcw, ChevronDown, Cloud, Eye } from 'lucide-react';
import { DownloadMenu } from './DownloadMenu';
import { StudioOrderButton } from '../../print-order/StudioOrderButton';
import { ConfirmDialog, ConfirmModal } from '@/components/ui';
import { ZoomWidget } from './ZoomWidget';
import { useProjectSave } from '../hooks/useProjectSave';
import { exportPresetFromState } from '../presets/studioPresets';
import { exportModuleFromState } from '../modules/exportStudioModule';
import { discardStudioSession } from '../lib/projectSerializer';

function EditableTitle() {
  const projectName = useCatalogStore((s) => s.projectName);
  const setProjectName = useCatalogStore((s) => s.setProjectName);

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(projectName);

  useEffect(() => {
    setValue(projectName);
  }, [projectName]);

  const handleSave = () => {
    setIsEditing(false);
    const trimmed = value.trim();
    if (trimmed && trimmed !== projectName) {
      setProjectName(trimmed);
    } else {
      setValue(projectName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setValue(projectName);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        autoFocus
        className="bg-surface-subtle text-text-primary text-sm font-medium px-2 py-1 rounded border border-primary focus:outline-none focus:ring-1 focus:ring-primary w-64 text-center h-8"
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className="text-sm font-medium text-text-primary hover:bg-surface-subtle px-2 py-1 rounded cursor-pointer transition-colors max-w-xs truncate block"
      title="Proje adını düzenlemek için tıklayın"
    >
      {projectName || 'İsimsiz Proje'}
    </span>
  );
}

export function TopBar() {
  const navigate = useNavigate();
  const activeFormaId = useCatalogStore((s) => s.activeFormaId);
  const projectName = useCatalogStore((s) => s.projectName);
  const isDirty = useCatalogStore((s) => s.isDirty);
  const { saveProject, isSaving } = useProjectSave();

  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);
  const past = useHistoryStore((s) => s.past);
  const future = useHistoryStore((s) => s.future);

  const clearProducts = useCatalogStore((s) => s.clearProducts);
  const resetCatalog = useCatalogStore((s) => s.resetCatalog);
  const setPreviewMode = useUIStore((s) => s.setPreviewMode);

  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const fileMenuRef = useRef<HTMLDivElement>(null);

  const [isClearOpen, setIsClearOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingNavigatePath, setPendingNavigatePath] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const hist = useHistoryStore.getState();
      const iso = hist.isoSession;

      // İzolasyonda Esc → çıkış (commit).
      if (iso && e.key === 'Escape') {
        e.preventDefault();
        useUIStore.getState().exitIsolation();
        return;
      }

      // Del → seçili banner hücre(ler)inde içeriği temizle (yapı/boyut/stil durur).
      // Guard: metin/giriş düzenlenirken native karakter-silmeye dokunma (undo'daki emsalin aynısı).
      if (e.key === 'Delete') {
        const el = document.activeElement as HTMLElement | null;
        if (el && (el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
          return;
        }
        const sel = useUIStore.getState().selection;
        if (sel.type !== 'bannerCell' || sel.ids.length === 0) return;
        e.preventDefault();
        useCatalogStore.getState().clearBannerCells(sel.parentId ?? '', sel.ids);
        return;
      }

      const isUndoKey = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z';
      const isRedoKey = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y';

      // İzolasyonda Ctrl+Z/Ctrl+Shift+Z/Ctrl+Y TAMAMEN bizim. Undo'dan ÖNCE bekleyen contentEditable
      // metnini flush et (blur→onBlur→updateCell→snapshot), sonra yerel yığında geri al →
      // deterministik bütün-hücre undo'su. (Empirik: native blur, odaklanılamayan <div>'e tıkta
      // ateşlenmez; sorun native-vs-local değil, commit'in hiç koşmamasıydı.)
      if (iso && (isUndoKey || isRedoKey)) {
        const el = document.activeElement as HTMLElement | null;
        if (el && el.isContentEditable) el.blur();
        e.preventDefault();
        if (isRedoKey || (isUndoKey && e.shiftKey)) hist.isolationRedo();
        else hist.isolationUndo();
        return;
      }

      if (isUndoKey) {
        // İzolasyon DIŞI: metin alanı odaktayken native text-undo'ya izin ver (mevcut davranış).
        const el = document.activeElement as HTMLElement | null;
        if (el && (el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
          return;
        }
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
    if (isDirty) {
      setPendingNavigatePath('/new');
      setConfirmModalOpen(true);
    } else {
      navigate('/new');
      setFileMenuOpen(false);
    }
  };

  const handleHomeClick = () => {
    if (isDirty) {
      setPendingNavigatePath('/dashboard');
      setConfirmModalOpen(true);
    } else {
      navigate('/dashboard');
    }
  };

  const handleConfirmSaveAndNavigate = async () => {
    try {
      // Panele çıkmadan önce thumbnail'i bekle ki panel eski görüntü yerine yenisini çeksin.
      await saveProject({ awaitThumbnail: true });
      if (pendingNavigatePath) {
        navigate(pendingNavigatePath);
      }
      setConfirmModalOpen(false);
      setPendingNavigatePath(null);
    } catch (error) {
      console.error('Modal kaydet ve yönlendir hatası:', error);
    }
  };

  const handleCancelModal = () => {
    setConfirmModalOpen(false);
    setPendingNavigatePath(null);
  };

  const handleDismissModal = () => {
    // Kaydetmeden Çık: bellek içi oturumu sıfırla + kalıcı taslağı (localStorage) sil ki
    // proje tekrar açıldığında sunucudaki kayıtlı sürüm yüklensin.
    discardStudioSession();
    if (pendingNavigatePath) {
      navigate(pendingNavigatePath);
    }
    setConfirmModalOpen(false);
    setPendingNavigatePath(null);
  };

  const handleClearProducts = () => {
    clearProducts();
    setIsClearOpen(false);
  };

  const handleResetCatalog = () => {
    resetCatalog();
    setIsResetOpen(false);
  };

  const handlePreview = () => {
    useUIStore.getState().clearSelection();
    setPreviewMode(true);
  };

  const handleExportPreset = async () => {
    try {
      const preset = exportPresetFromState();
      const json = JSON.stringify(preset, null, 2);
      console.log('[Preset Export]\n' + json);
      await navigator.clipboard.writeText(json);
      toast.success('Preset JSON panoya kopyalandı (konsola da yazıldı)');
      setFileMenuOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Preset kopyalanamadı — konsoldan alabilirsiniz');
    }
  };

  const handleExportModule = async () => {
    try {
      const module = exportModuleFromState();
      if (!module) {
        toast.error('Geçersiz seçim — banner (serbest) ya da özel-ayarlı ürün slotu seçin');
        return;
      }
      const json = JSON.stringify(module, null, 2);
      console.log('[Module Export]\n' + json);
      await navigator.clipboard.writeText(json);
      toast.success('Modül JSON panoya kopyalandı (konsola da yazıldı)');
      setFileMenuOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Modül kopyalanamadı — konsoldan alabilirsiniz');
    }
  };

  return (
    <div className="h-14 bg-surface-panel border-b border-border-default flex items-center justify-between px-4 shrink-0 shadow-drop-sm relative z-1001">
      {/* Sol Grup */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleHomeClick}
          title="Kullanıcı Paneli"
          className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-border-strong rounded-radius-md transition-colors shrink-0"
        >
          <Home size={16} />
        </button>

        {/* Dosya Dropdown Menüsü */}
        <div ref={fileMenuRef} className="relative shrink-0">
          <button
            onClick={() => setFileMenuOpen(!fileMenuOpen)}
            title="Dosya İşlemleri"
            className={`h-8 px-3 flex items-center justify-center text-body-md font-medium rounded-radius-md transition-colors gap-1.5 border border-border-strong ${
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

              {/* Kaydet */}
              <button
                onClick={() => {
                  if (isDirty) {
                    void saveProject();
                    setFileMenuOpen(false);
                  }
                }}
                disabled={!isDirty || isSaving}
                className="w-full text-left px-3 py-2.5 hover:bg-surface-subtle rounded-radius-md text-body-md font-medium text-text-secondary hover:text-text-primary transition-all flex items-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed select-none"
              >
                <span className="flex items-center gap-2.5">
                  <Save size={16} className="shrink-0" />
                  <span>Kaydet</span>
                </span>
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

              {import.meta.env.DEV && (
                <>
                  <hr className="border-border-default my-1" />

                  <button
                    onClick={() => void handleExportPreset()}
                    className="w-full text-left px-3 py-2.5 hover:bg-surface-subtle rounded-radius-md text-body-md font-medium text-text-secondary hover:text-text-primary transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <Copy size={16} className="shrink-0" />
                    <span>Preset Kopyala (dev)</span>
                  </button>

                  <button
                    onClick={() => void handleExportModule()}
                    className="w-full text-left px-3 py-2.5 hover:bg-surface-subtle rounded-radius-md text-body-md font-medium text-text-secondary hover:text-text-primary transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <Copy size={16} className="shrink-0" />
                    <span>Modül Kopyala (dev)</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Geri / İleri Al butonu */}
        <button
          onClick={undo}
          disabled={past.length === 0}
          title="Geri Al (Ctrl+Z)"
          className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-border-strong rounded-radius-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors shrink-0"
        >
          <Undo2 size={16} />
        </button>

        <button
          onClick={redo}
          disabled={future.length === 0}
          title="İleri Al (Ctrl+Shift+Z)"
          className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-border-strong rounded-radius-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors shrink-0"
        >
          <Redo2 size={16} />
        </button>

        {/* Cloud Kaydet Butonu */}
        <button
          onClick={() => void saveProject()}
          disabled={!isDirty || isSaving}
          title="Kaydet"
          className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-border-strong rounded-radius-md transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Cloud size={16} />
        </button>

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

        <ConfirmModal
          isOpen={confirmModalOpen}
          title="Kaydedilmemiş Değişiklikler"
          description="Tasarımda yaptığınız değişiklikler kaydedilmemiş. Sayfadan ayrılmadan önce değişiklikleri kaydetmek istiyor musunuz?"
          confirmLabel="Kaydet"
          dismissLabel="Kaydetmeden Çık"
          onConfirm={handleConfirmSaveAndNavigate}
          onCancel={handleCancelModal}
          onDismiss={handleDismissModal}
        />
      </div>

      {/* Orta Grup - Absolute Center */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-10">
        <EditableTitle />
      </div>

      {/* Sağ Grup */}
      <div className="flex items-center gap-3">
        <ZoomWidget />

        {/* Ayraç */}
        <div className="h-4 border-l border-border-default shrink-0" />

        {/* Önizle Butonu */}
        <button
          onClick={handlePreview}
          title="Önizle"
          className="h-8 px-3 rounded-radius-md text-xs font-medium bg-surface-panel border border-border-strong text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors flex items-center justify-center gap-1.5 shrink-0"
        >
          <Eye size={16} />
          <span>Önizle</span>
        </button>

        <StudioOrderButton />
        <DownloadMenu />
        <ThemeToggle compact />
      </div>
    </div>
  );
}
