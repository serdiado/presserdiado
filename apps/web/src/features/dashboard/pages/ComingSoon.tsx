// Coming Soon / Yakında Sayfası — Yapım Aşamasında Bölümler İçin Placeholder
// apps/web/src/features/dashboard/pages/ComingSoon.tsx

import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, ArrowLeft } from 'lucide-react';

export function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl grid place-items-center text-slate-700 shadow-sm mb-6">
        <LayoutTemplate size={28} />
      </div>
      
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        Bu Bölüm Yapım Aşamasında
      </h1>
      
      <p className="text-sm text-slate-500 max-w-md mt-2">
        Sizlere daha iyi bir deneyim sunabilmek için bu sayfayı hazırlıyoruz. Çok yakında modern bir arayüzle hizmetinizde olacak!
      </p>

      <button
        onClick={() => navigate('/dashboard')}
        className="mt-8 inline-flex items-center gap-2 h-9 px-4 rounded-md bg-white border border-slate-300
                   text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
      >
        <ArrowLeft size={14} />
        Ana Sayfaya Dön
      </button>
    </div>
  );
}
