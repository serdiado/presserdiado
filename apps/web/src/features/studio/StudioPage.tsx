import { TopBar } from './topbar/TopBar';
import { ContextualBar } from './contextual/ContextualBar';
import { Canvas } from './canvas/Canvas';
import { Sidebar } from './sidebar/Sidebar';
import { TempPoolBar } from './temppool/TempPoolBar';
import { PriceCalculator } from './pricing/PriceCalculator';

export default function StudioPage() {
  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-slate-200">
      <TopBar />

      <div className="flex-1 flex flex-row min-h-0">
        <div className="pt-4 pl-4 pb-4 h-full shrink-0 flex relative z-[1000]">
          <div className="rounded-xl shadow-xl h-full flex flex-col relative overflow-hidden">
            <TempPoolBar />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative items-center">
          <div className="inline-flex justify-center bg-white shadow-md rounded-b-lg border-b border-x border-slate-200 overflow-hidden shrink-0 z-50 mb-2">
            <ContextualBar />
          </div>
          <div className="flex-1 w-full relative min-h-0">
            <Canvas />
          </div>
        </div>

        <div className="pt-4 pr-4 pb-4 h-full shrink-0 flex relative z-[1000]">
          <div className="rounded-xl shadow-xl h-full flex flex-col relative overflow-hidden">
            <Sidebar />
          </div>
        </div>
      </div>

      <PriceCalculator />
    </main>
  );
}
