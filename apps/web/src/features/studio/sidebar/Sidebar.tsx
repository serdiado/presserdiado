import { useState } from 'react';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { GlobalGridSettings } from '../panels/GlobalGridSettings';
import { GlobalCellSettings } from '../panels/GlobalCellSettings';
import { GlobalPriceSettings } from '../panels/GlobalPriceSettings';
import { TemplateSettingsPanel } from '../panels/TemplateSettingsPanel';
import { ProductInfoSettings } from '../panels/ProductInfoSettings';
import { ProductManagement } from '../panels/ProductManagement';
import { BannerSettingsPanel, PizzaSettingsPanel } from '../modules';
import {
  USER_MODULES_EVENT,
  deleteUserModule,
  listUserModules,
  saveUserModule,
  type UserModule,
} from '../modules/userModules';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import type { AnyModuleData } from '../modules';

type Panel = 'products' | 'modules' | 'grid' | 'cell' | 'price' | 'product-info' | 'template';

const TABS: { key: Panel; label: string }[] = [
  { key: 'products', label: 'Ürün' },
  { key: 'modules', label: 'Modül' },
  { key: 'grid', label: 'Izgara' },
  { key: 'cell', label: 'Hücre' },
  { key: 'price', label: 'Fiyat' },
  { key: 'product-info', label: 'Seçili' },
  { key: 'template', label: 'Şablon' },
];

export function Sidebar() {
  const [active, setActive] = useState<Panel>('products');

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full">
      <div className="grid grid-cols-4 border-b border-slate-200 shrink-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`py-2 text-[10px] font-bold uppercase tracking-wider ${
              active === t.key
                ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-3 bg-slate-50">
        {active === 'products' && <ProductManagement />}
        {active === 'modules' && <ModulesPanel />}
        {active === 'grid' && <GlobalGridSettings />}
        {active === 'cell' && <GlobalCellSettings />}
        {active === 'price' && <GlobalPriceSettings />}
        {active === 'product-info' && <ProductInfoSettings />}
        {active === 'template' && <TemplateSettingsPanel />}
      </div>
    </div>
  );
}

function ModulesPanel() {
  const selectedSlotIds = useUIStore((s) => s.selectedSlotIds);
  const getActivePages = useCatalogStore((s) => s.getActivePages);

  const slot =
    selectedSlotIds.length > 0
      ? getActivePages()
          .flatMap((p) => p.slots)
          .find((s) => s.id === selectedSlotIds[0])
      : null;
  const moduleType = (slot?.moduleData as { type?: string } | null)?.type;

  const onDragStart = (e: React.DragEvent, type: 'banner' | 'pizza') => {
    e.dataTransfer.setData('newModuleType', type);
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-slate-500 font-bold">
        Modülü serbest alana sürükleyin (boş hücreyi otomatik serbest alana çevirir).
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div
          draggable
          onDragStart={(e) => onDragStart(e, 'banner')}
          className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded p-3 cursor-grab active:cursor-grabbing flex flex-col items-center"
        >
          <span className="text-2xl mb-1">📢</span>
          <span className="text-[10px] font-bold text-purple-700">Banner</span>
          <span className="text-[8px] text-slate-500">8×4 grid</span>
        </div>
        <div
          draggable
          onDragStart={(e) => onDragStart(e, 'pizza')}
          className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded p-3 cursor-grab active:cursor-grabbing flex flex-col items-center"
        >
          <span className="text-2xl mb-1">🍕</span>
          <span className="text-[10px] font-bold text-orange-700">Pizza</span>
          <span className="text-[8px] text-slate-500">menü tablosu</span>
        </div>
      </div>

      {moduleType === 'banner' && (
        <div className="pt-3 border-t border-slate-200">
          <h4 className="text-[10px] font-black text-slate-500 mb-2">
            BANNER AYARLARI (Seçili)
          </h4>
          <BannerSettingsPanel />
        </div>
      )}
      {moduleType === 'pizza' && (
        <div className="pt-3 border-t border-slate-200">
          <h4 className="text-[10px] font-black text-slate-500 mb-2">
            PIZZA AYARLARI (Seçili)
          </h4>
          <PizzaSettingsPanel />
        </div>
      )}

      {!!slot?.moduleData && (moduleType === 'banner' || moduleType === 'pizza') && (
        <SaveCurrentModule slotData={slot.moduleData as AnyModuleData} />
      )}

      <UserModulesList />
    </div>
  );
}

function SaveCurrentModule({ slotData }: { slotData: AnyModuleData }) {
  const handleSave = () => {
    const name = window.prompt('Modülü adlandır:', `${slotData.type} ${new Date().toLocaleDateString('tr-TR')}`);
    if (!name?.trim()) return;
    const saved = saveUserModule(name, slotData);
    toast.success(`"${saved.name}" kaydedildi`);
  };
  return (
    <div className="pt-3 border-t border-slate-200">
      <button
        onClick={handleSave}
        className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded border border-emerald-200"
      >
        💾 Bu Modülü Kaydet (Şablon Yap)
      </button>
    </div>
  );
}

function UserModulesList() {
  const [modules, setModules] = useState<UserModule[]>(listUserModules());

  useEffect(() => {
    const refresh = () => setModules(listUserModules());
    window.addEventListener(USER_MODULES_EVENT, refresh);
    return () => window.removeEventListener(USER_MODULES_EVENT, refresh);
  }, []);

  if (modules.length === 0) {
    return (
      <div className="pt-3 border-t border-slate-200">
        <h4 className="text-[10px] font-black text-slate-500 mb-2">
          KULLANICI MODÜLLERİ
        </h4>
        <p className="text-[10px] text-slate-400 italic">
          Henüz kayıtlı modül yok. Bir banner/pizza yerleştirip "Bu Modülü Kaydet" ile şablon yapabilirsin.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-3 border-t border-slate-200">
      <h4 className="text-[10px] font-black text-slate-500 mb-2">
        KULLANICI MODÜLLERİ ({modules.length})
      </h4>
      <div className="space-y-1.5">
        {modules.map((m) => (
          <div
            key={m.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('newUserModuleData', JSON.stringify(m.data));
            }}
            className="group flex items-center gap-2 px-2 py-1.5 bg-white hover:bg-slate-50 rounded border border-slate-200 cursor-grab active:cursor-grabbing"
          >
            <span className="text-base">{m.type === 'banner' ? '📢' : '🍕'}</span>
            <span className="flex-1 text-[10px] font-semibold text-slate-700 truncate">
              {m.name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`"${m.name}" silinecek.`)) deleteUserModule(m.id);
              }}
              className="text-[10px] text-rose-500 opacity-0 group-hover:opacity-100"
              title="Sil"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

