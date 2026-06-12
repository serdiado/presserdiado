// Pasif menüler için shell içi "Yakında" sayfası. Modül adı router state'inden gelir.
import { useLocation, useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

export default function AdminPlaceholder() {
  const navigate = useNavigate();
  const location = useLocation();
  const title = (location.state as { title?: string } | null)?.title;

  return (
    <div className="max-w-3xl mx-auto px-8 py-16 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl grid place-items-center text-slate-700 shadow-sm mb-6">
        <Construction size={28} />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        {title ? `${title} — Yakında` : 'Bu Modül Yakında'}
      </h1>
      <p className="text-sm text-slate-500 max-w-md mt-2">
        Bu bölüm henüz aktif değil. Üzerinde çalışıyoruz; çok yakında yönetici panelinde
        kullanıma açılacak.
      </p>
      <button
        onClick={() => navigate('/admin')}
        className="mt-8 inline-flex items-center gap-2 h-9 px-4 rounded-md bg-white border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
      >
        <ArrowLeft size={14} />
        Kontrol Paneline Dön
      </button>
    </div>
  );
}
