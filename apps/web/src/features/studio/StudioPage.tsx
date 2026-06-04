import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TopBar } from './topbar/TopBar';
import { ContextualBar } from './contextual/ContextualBar';
import { Canvas } from './canvas/Canvas';
import { Sidebar } from './sidebar/Sidebar';
import { IconSidebar } from './left-sidebar/IconSidebar';
import { FlyoutPanel } from './left-sidebar/FlyoutPanel';
import { PriceCalculator } from './pricing/PriceCalculator';
import { useCatalogStore, useUIStore, buildFormasForTemplate } from '@/stores/studio';
import { Template1 } from '@matbaapro/shared';
import NewStudioWizard from '../wizard/NewStudioWizard';

export default function StudioPage() {
  const isSetupModalOpen = useUIStore((s) => s.isSetupModalOpen);
  const setSetupModalOpen = useUIStore((s) => s.setSetupModalOpen);
  const selection = useUIStore((s) => s.selection);
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

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
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-slate-300">
      <TopBar />

      <div className="flex-1 flex flex-row min-h-0">
        <div 
          id="studio-left-sidebar" 
          className="pt-4 pb-4 h-full shrink-0 flex relative z-1000"
          style={{ width: '80px' }}
        >
          <div className="rounded-r-xl shadow-xl h-full w-full flex flex-col relative overflow-hidden bg-surface-panel z-20">
            <IconSidebar />
          </div>
          <FlyoutPanel />
        </div>

        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative items-center">
          {selection.type !== 'none' && (
            <div className="inline-flex justify-center bg-surface-panel shadow-drop-md rounded-b-lg border-b border-x border-border-default overflow-visible shrink-0 z-50 mb-2 transition-all duration-150 visible opacity-100">
              <ContextualBar />
            </div>
          )}
          <div className="flex-1 w-full relative min-h-0">
            <Canvas />
          </div>
        </div>

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
      </div>

      <PriceCalculator />

      {isSetupModalOpen && (
        <div className="fixed inset-0 z-9999 overflow-auto">
          <NewStudioWizard />
        </div>
      )}
    </main>
  );
}
