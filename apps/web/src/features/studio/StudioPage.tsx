import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TopBar } from './topbar/TopBar';
import { ContextualBar } from './contextual/ContextualBar';
import { Canvas } from './canvas/Canvas';
import { Sidebar } from './sidebar/Sidebar';
import { TempPoolBar } from './temppool/TempPoolBar';
import { PriceCalculator } from './pricing/PriceCalculator';
import { useUIStore } from '@/stores/studio';
import NewStudioWizard from '../wizard/NewStudioWizard';

export default function StudioPage() {
  const isSetupModalOpen = useUIStore((s) => s.isSetupModalOpen);
  const setSetupModalOpen = useUIStore((s) => s.setSetupModalOpen);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-slate-300">
      <TopBar />

      <div className="flex-1 flex flex-row min-h-0">
        <div className="pt-4 pb-4 h-full shrink-0 flex relative z-1000">
          <div className="rounded-r-xl shadow-xl h-full flex flex-col relative overflow-hidden">
            <TempPoolBar />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative items-center">
          <div className="inline-flex justify-center bg-surface-panel shadow-drop-md rounded-b-lg border-b border-x border-border-default overflow-visible shrink-0 z-50 mb-2">
            <ContextualBar />
          </div>
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
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
