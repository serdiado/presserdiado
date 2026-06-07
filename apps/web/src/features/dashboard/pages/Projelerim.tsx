// Tasarım Projelerim — proje ızgarası, arama, filtreler
// apps/web/src/features/dashboard/pages/Projelerim.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { ProjectCard } from '../components/ProjectCard';
import { useDashboardContext } from '../DashboardLayout';
import type { ProjectStatus } from '../types';

const SORT_OPTIONS = [
  { value: 'updated', label: 'Son düzenlenen' },
  { value: 'name',    label: 'Ad (A-Z)'       },
  { value: 'created', label: 'Oluşturulma tarihi' },
] as const;

export function Projelerim() {
  const navigate = useNavigate();
  const { projects, loading } = useDashboardContext();
  const [query, setQuery]   = useState('');
  const [sort, setSort]     = useState<string>('updated');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  // Filtreleme
  const filtered = projects.filter((p) => {
    const matchQ = !query || p.name.toLowerCase().includes(query.toLowerCase());
    const matchS = statusFilter === 'all' || p.status === statusFilter;
    return matchQ && matchS;
  });

  // Sıralama
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'name') {
      return a.name.localeCompare(b.name, 'tr');
    }
    // Varsayılan olarak updated (veya oluşturulma tarihi) tarihsel sıralama
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Başlık + eylemler */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tasarım Projelerim
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {projects.length} proje
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/new')}
            className="h-9 px-3 rounded-md bg-white border border-slate-300 text-slate-700
                       text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Şablondan Yeni
          </button>
          {/* BİRİNCİL CTA — sayfada tek mavi buton */}
          <button
            onClick={() => navigate('/new')}
            className="h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm
                       font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} /> Yeni Tasarım
          </button>
        </div>
      </div>

      {/* Filtre çubuğu */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 mb-6 flex items-center gap-2 flex-wrap">
        {/* Arama */}
        <div className="relative flex-1 min-w-60">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Proje adı ile ara…"
            className="w-full pl-9 pr-3 h-9 bg-slate-50 border border-slate-200 rounded-md text-sm
                       placeholder-slate-400 focus:bg-white focus:border-slate-400 outline-none"
          />
        </div>

        {/* Durum filtresi */}
        <FilterChip
          label="Tüm Durumlar"
          active={statusFilter === 'all'}
          onClick={() => setStatusFilter('all')}
        />
        {(['taslak', 'baskıda', 'kargoda', 'teslim'] as ProjectStatus[]).map((s) => (
          <FilterChip
            key={s}
            label={s.charAt(0).toUpperCase() + s.slice(1)}
            active={statusFilter === s}
            onClick={() => setStatusFilter(s)}
          />
        ))}

        {/* Sıralama */}
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <span>Sırala:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white border border-slate-300 rounded-md h-9 px-2 text-slate-700
                       text-sm outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Izgara */}
      {loading ? (
        <LoadingGrid />
      ) : sorted.length === 0 ? (
        <EmptyState onNewDesign={() => navigate('/new')} />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {sorted.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Alt bileşenler ───────────────────────────────────────────────────────────

function FilterChip({
  label, active, dashed, onClick,
}: {
  label: string;
  active?: boolean;
  dashed?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'text-xs font-semibold h-9 px-3 rounded-md transition-colors',
        active
          ? 'bg-white border-2 border-slate-700 text-slate-800'
          : dashed
          ? 'border border-dashed border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-500'
          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-slate-200 overflow-hidden animate-pulse">
          <div className="aspect-4/3 bg-slate-100" />
          <div className="p-3 space-y-2">
            <div className="h-3.5 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onNewDesign }: { onNewDesign: () => void }) {
  return (
    <div className="py-16 text-center">
      <p className="text-slate-500 text-sm mb-1">Henüz tasarım projeniz yok.</p>
      <p className="text-slate-400 text-xs mb-6">
        Yeni bir proje oluşturarak başlayabilirsiniz.
      </p>
      <button
        onClick={onNewDesign}
        className="h-9 px-5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm
                   font-semibold inline-flex items-center gap-1.5 transition-colors"
      >
        <Plus size={14} /> İlk Tasarımınızı Oluşturun
      </button>
    </div>
  );
}
