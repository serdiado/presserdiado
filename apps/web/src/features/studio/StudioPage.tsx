import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
import { TopBar } from './topbar/TopBar';
import { ContextualBar } from './contextual/ContextualBar';
import { Canvas } from './canvas/Canvas';
import { Sidebar } from './sidebar/Sidebar';
import { IconSidebar } from './left-sidebar/IconSidebar';
import { FlyoutPanel } from './left-sidebar/FlyoutPanel';
import { FormasFlyoutPanel } from './left-sidebar/FormasFlyoutPanel';
import { PlaceholderFlyout } from './left-sidebar/PlaceholderFlyout';
import { useCatalogStore, useUIStore, buildFormasForTemplate } from '@/stores/studio';
import { Template1 } from '@matbaapro/shared';
import NewStudioWizard from '../wizard/NewStudioWizard';

export default function StudioPage() {
  const isPreviewMode = useUIStore((s) => s.isPreviewMode);
  const setPreviewMode = useUIStore((s) => s.setPreviewMode);
  const isSetupModalOpen = useUIStore((s) => s.isSetupModalOpen);
  const setSetupModalOpen = useUIStore((s) => s.setSetupModalOpen);
  const selection = useUIStore((s) => s.selection);
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  const formas = useCatalogStore((s) => s.formas);
  const activeFormaId = useCatalogStore((s) => s.activeFormaId);
  const setActiveFormaId = useCatalogStore((s) => s.setActiveFormaId);

  const [isDownloading, setIsDownloading] = useState(false);

  const activeIndex = formas.findIndex((f) => f.id === activeFormaId);

  const handlePrevForma = () => {
    if (formas.length <= 1) return;
    const nextIndex = (activeIndex - 1 + formas.length) % formas.length;
    setActiveFormaId(formas[nextIndex].id);
  };

  const handleNextForma = () => {
    if (formas.length <= 1) return;
    const nextIndex = (activeIndex + 1) % formas.length;
    setActiveFormaId(formas[nextIndex].id);
  };

  const handleDownloadJPG = async () => {
    const element = document.getElementById('canvas');
    if (!element) return;

    try {
      setIsDownloading(true);
      const html2canvas = (await import('html2canvas')).default;

      const activeForma = formas.find((f) => f.id === activeFormaId);
      const formaName = activeForma?.name || `Forma-${activeFormaId}`;
      const projectName = useCatalogStore.getState().projectName || 'Tasarim';
      
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDocument) => {
          const clonedCanvas = clonedDocument.getElementById('canvas');
          if (clonedCanvas) {
            clonedCanvas.style.transform = 'none';
            clonedCanvas.style.left = '0';
            clonedCanvas.style.top = '0';
            clonedCanvas.style.position = 'relative';
            clonedCanvas.style.margin = '0';
            clonedDocument.body.innerHTML = '';
            clonedDocument.body.appendChild(clonedCanvas);
          }
        }
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.download = `${projectName}-${formaName}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('JPG indirme hatası:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Esc and Arrow keys listener for preview mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewMode(false);
      }
      if (isPreviewMode) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrevForma();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNextForma();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewMode, setPreviewMode, activeIndex, formas]);

  useEffect(() => {
    // Guard: activeFormaId veya formas geçersiz/boşsa kurtaralım
    const state = useCatalogStore.getState();
    let currentFormas = state.formas;
    
    if (!currentFormas || currentFormas.length === 0) {
      const defaultFormas = buildFormasForTemplate(Template1);
      useCatalogStore.setState({
        formas: defaultFormas,
        activeFormaId: 1,
      });
      currentFormas = defaultFormas;
    }
    
    const activeFormaId = useCatalogStore.getState().activeFormaId;
    const hasActiveForma = currentFormas.some((f) => f.id === activeFormaId);
    if (!hasActiveForma && currentFormas.length > 0) {
      useCatalogStore.setState({ activeFormaId: currentFormas[0].id });
    }

    // Sayfa ilk açıldığında ve hiçbir şey seçilmemişse varsayılan olarak kanvasın 1 numaralı ürün hücresini seçelim
    const activePages = useCatalogStore.getState().getActivePages();
    if (activePages.length > 0) {
      const firstPage = activePages[0];
      const firstSlot = firstPage.slots[0];
      if (firstSlot) {
        useUIStore.getState().toggleSlotSelection(firstSlot.id, false);
      }
    }
  }, []);

  return (
    <main className={`flex flex-col h-screen w-screen overflow-hidden bg-slate-300 ${isPreviewMode ? 'relative' : ''}`}>
      {!isPreviewMode && <TopBar />}

      <div className="flex-1 flex flex-row min-h-0">
        {!isPreviewMode && (
          <div 
            id="studio-left-sidebar" 
            className="h-full shrink-0 flex relative z-1000"
            style={{ width: '80px' }}
          >
            <div className="rounded-r-xl shadow-xl w-full flex flex-col relative overflow-hidden bg-surface-panel z-20 my-4">
              <IconSidebar />
            </div>
            <FlyoutPanel />
            <PlaceholderFlyout flyoutId="projeler" title="Projeler" description="Projelerinizi buradan yönetebileceksiniz." />
            <PlaceholderFlyout flyoutId="temalar" title="Temalar" description="Hazır ve kayıtlı tasarım temalarınız burada görünecek." />
            <PlaceholderFlyout flyoutId="medya" title="Medya" description="Yüklediğiniz görseller ve logolar burada listelenecek." />
            <PlaceholderFlyout flyoutId="moduller" title="Modüller" description="Hazır içerik bloklarını buradan sürükleyip bırakabileceksiniz." />
            <FormasFlyoutPanel />
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative items-center">
          {!isPreviewMode && selection.type !== 'none' && (
            <div className="inline-flex justify-center bg-surface-panel shadow-drop-md rounded-b-lg border-b border-x border-border-default overflow-visible shrink-0 z-50 mb-2 transition-all duration-150 visible opacity-100">
              <ContextualBar />
            </div>
          )}
          <div className="flex-1 w-full relative min-h-0">
            <Canvas />
          </div>

          {/* ← Düzenlemeye Dön butonu */}
          {isPreviewMode && (
            <button
              onClick={() => setPreviewMode(false)}
              className="absolute top-4 left-4 z-[9999] h-8 px-3 rounded-radius-md text-xs font-semibold bg-surface-panel border border-border-strong text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>←</span>
              <span>Düzenlemeye Dön</span>
            </button>
          )}

          {/* Önizleme Gezinme ve İndirme Barı */}
          {isPreviewMode && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-4 bg-surface-panel/90 backdrop-blur-md border border-border-strong rounded-radius-full shadow-drop-lg px-4 py-2 animate-in slide-in-from-bottom-4 duration-200">
              <button
                onClick={handlePrevForma}
                disabled={formas.length <= 1}
                className="h-8 w-8 flex items-center justify-center rounded-radius-full text-text-secondary hover:text-text-primary hover:bg-surface-subtle disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Önceki Forma (Sol Ok)"
              >
                <ChevronLeft size={18} />
              </button>
              
              <span className="text-body-sm font-semibold text-text-primary min-w-[100px] text-center select-none">
                {formas[activeIndex]?.name || `Forma ${activeIndex + 1}`} ({activeIndex + 1} / {formas.length})
              </span>

              <button
                onClick={handleNextForma}
                disabled={formas.length <= 1}
                className="h-8 w-8 flex items-center justify-center rounded-radius-full text-text-secondary hover:text-text-primary hover:bg-surface-subtle disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Sonraki Forma (Sağ Ok)"
              >
                <ChevronRight size={18} />
              </button>

              <div className="w-[1px] h-4 bg-border-strong mx-1" />

              <button
                onClick={handleDownloadJPG}
                disabled={isDownloading}
                className="h-8 px-4 flex items-center justify-center gap-1.5 rounded-radius-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDownloading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                <span>JPG İndir</span>
              </button>
            </div>
          )}
        </div>

        {!isPreviewMode && (
          <div 
            id="studio-sidebar" 
            className="pt-4 pb-4 h-full shrink-0 flex relative z-1000 transition-all duration-300 ease-in-out"
            style={{ 
              width: isSidebarOpen ? '384px' : '10px'
            }}
          >
            <div 
              className="rounded-l-xl shadow-xl h-full flex flex-col relative overflow-hidden bg-surface-panel shrink-0 transition-transform duration-300 ease-in-out"
              style={{ 
                width: '384px',
                transform: isSidebarOpen ? 'translateX(0)' : 'translateX(374px)'
              }}
            >
              <Sidebar />
            </div>
            
            {/* Açma / Kapatma Butonu */}
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-12 bg-surface-panel border border-border-default rounded-full hover:bg-surface-subtle shadow-md flex items-center justify-center text-text-secondary hover:text-text-primary z-50 cursor-pointer transition-colors"
              title={isSidebarOpen ? "Paneli Kapat" : "Paneli Aç"}
            >
              {isSidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        )}
      </div>

      {!isPreviewMode && isSetupModalOpen && (
        <div className="fixed inset-0 z-9999 overflow-auto">
          <NewStudioWizard />
        </div>
      )}
    </main>
  );
}
