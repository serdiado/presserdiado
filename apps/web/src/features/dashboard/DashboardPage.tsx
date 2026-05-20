import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { generateSlots } from '@matbaapro/grid-engine';

interface Project {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
  thumbnailKey: string | null;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch {
      toast.error('Projeler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function createProject() {
    try {
      const { data } = await api.post('/projects', {
        name: 'Yeni Katalog',
        productTypeId: '00000000-0000-0000-0000-000000000001',
        canvasData: {
          version: '1.0',
          productTypeId: '00000000-0000-0000-0000-000000000001',
          theme: {
            primaryColor: '#E31E24',
            secondaryColor: '#FFC107',
            fontFamily: 'Inter',
            fontSize: 14,
            priceFont: 'Oswald',
            priceFontSize: 28,
            decimalScale: 0.4,
            decimalAlign: 'superscript',
            slotBackground: '#FFFFFF',
            slotBorderRadius: 4,
            slotShadow: '0 1px 3px rgba(0,0,0,0.12)',
          },
          formas: [
            {
              id: 'forma-0',
              label: 'Sayfa 1-2',
              pages: [
                {
                  id: 'page-0',
                  grid: { cols: 4, rows: 4 },
                  background: { type: 'color', value: '#FFFFFF' },
                  footer: { visible: true, heightPct: 8, cells: [] },
                  slots: generateSlots('page-0', { cols: 4, rows: 4 }),
                },
              ],
            },
          ],
        },
      });
      navigate(`/studio/${data.id}`);
    } catch {
      toast.error('Proje oluşturulamadı');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Çalışmalarım</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/studio')}
            className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            Mevcut Stüdyoyu Aç
          </button>
          <button
            onClick={() => navigate('/new')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            + Yeni Tasarım
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-lg mb-4">Henüz bir çalışmanız yok</div>
          <button
            onClick={() => navigate('/new')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            İlk Tasarımınızı Oluşturun
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => navigate(`/studio/${project.id}`)}
              className="text-left bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                <span className="text-gray-300 text-4xl">📄</span>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(project.updatedAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
