import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, FolderOpen, Loader2, RefreshCw, Plus } from 'lucide-react';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { ConfirmModal } from '@/components/ui';
import api from '@/lib/api';
import { useProjectSave } from '../hooks/useProjectSave';

const FLYOUT_ID = 'projeler';

export function ProjelerFlyoutPanel() {
  const activeFlyout = useUIStore((s) => s.activeFlyout);
  const setActiveFlyout = useUIStore((s) => s.setActiveFlyout);

  const isDirty = useCatalogStore((s) => s.isDirty);
  const currentProjectId = useCatalogStore((s) => s.projectId);
  const { saveProject } = useProjectSave();

  const navigate = useNavigate();

  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);

  const isOpen = activeFlyout === FLYOUT_ID;

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await api.get('/projects');
      setProjects(data || []);
    } catch (err) {
      console.error('Projeler yüklenirken hata oluştu:', err);
      setError('Projeler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveFlyout(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, setActiveFlyout]);

  const handleProjectClick = (targetProjectId: string) => {
    if (targetProjectId === currentProjectId) {
      setActiveFlyout(null);
      return;
    }

    if (isDirty) {
      setPendingProjectId(targetProjectId);
      setConfirmModalOpen(true);
    } else {
      navigateToProject(targetProjectId);
    }
  };

  const navigateToProject = (id: string) => {
    setActiveFlyout(null);
    navigate(`/studio/${id}`);
  };

  const handleConfirmNavigate = async () => {
    if (!pendingProjectId) return;

    try {
      await saveProject();
      navigateToProject(pendingProjectId);
      setConfirmModalOpen(false);
      setPendingProjectId(null);
    } catch (error) {
      console.error('Proje değiştirmeden önce kaydetme hatası:', error);
    }
  };

  const handleCancelNavigate = () => {
    setConfirmModalOpen(false);
    setPendingProjectId(null);
  };

  const handleDismissNavigate = () => {
    if (pendingProjectId) {
      navigateToProject(pendingProjectId);
    }
    setConfirmModalOpen(false);
    setPendingProjectId(null);
  };

  return (
    <>
      <div
        className="absolute top-4 bottom-4 w-60 bg-surface-panel rounded-xl shadow-xl border border-border-default flex flex-col overflow-hidden transition-transform duration-200 ease-out z-10"
        style={{
          left: '80px',
          transform: isOpen ? 'translateX(0)' : 'translateX(calc(-100% - 80px))',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between px-3 py-2.5 bg-surface-subtle border-b border-border-default shrink-0">
          <div className="flex items-center gap-2 text-text-primary">
            <span className="text-heading-md">Projeler</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveFlyout(null)}
            className="text-text-secondary hover:text-text-primary p-1 rounded transition-colors cursor-pointer"
            title="Kapat"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto flex flex-col min-h-0">
          {isLoading ? (
            <div className="flex-1 overflow-auto p-3 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-2 items-center p-2 rounded-lg border border-border-default">
                  <div className="w-12 h-9 bg-surface-subtle rounded shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="h-3.5 bg-surface-subtle rounded w-3/4" />
                    <div className="h-2.5 bg-surface-subtle rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-3">
              <span className="text-body-sm text-text-secondary">{error}</span>
              <button
                type="button"
                onClick={fetchProjects}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-surface-subtle hover:bg-border-default border border-border-strong text-text-secondary rounded-md cursor-pointer transition-colors"
              >
                <RefreshCw size={12} />
                <span>Tekrar Dene</span>
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-3">
              <FolderOpen size={32} strokeWidth={1.25} className="text-text-muted opacity-50" />
              <span className="text-body-sm text-text-secondary">Henüz proje yok</span>
              <button
                type="button"
                onClick={() => {
                  setActiveFlyout(null);
                  navigate('/new');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-md cursor-pointer transition-colors"
              >
                <Plus size={14} />
                <span>Yeni Tasarım</span>
              </button>
            </div>
          ) : (
            <div className="p-3 space-y-2 overflow-auto flex-1">
              {projects.map((p) => {
                const isActive = p.id === currentProjectId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProjectClick(p.id)}
                    className={`w-full flex gap-2 items-center p-2 rounded-lg border transition-all text-left cursor-pointer ${
                      isActive
                        ? 'border-border-selected bg-surface-subtle text-text-primary shadow-drop-sm font-semibold'
                        : 'border-border-default bg-surface-panel text-text-secondary hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-9 bg-surface-subtle rounded border border-border-default flex items-center justify-center overflow-hidden shrink-0">
                      {p.thumbnailKey ? (
                        <img
                          src={p.thumbnailKey}
                          alt={p.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        /* Mini grid placeholder */
                        <div className="bg-white shadow-drop-xs w-5/6 h-5/6 p-0.5">
                          <div className="grid grid-cols-4 gap-0.5 h-full">
                            {Array.from({ length: 12 }).map((_, idx) => (
                              <div key={idx} className="bg-slate-100 rounded-2xs" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Project Details */}
                    <div className="flex-1 min-w-0">
                      <div className="text-body-sm font-semibold truncate text-text-primary">
                        {p.name}
                      </div>
                      <div className="text-body-xs text-text-muted mt-0.5">
                        {p.updatedAt && typeof p.updatedAt === 'string' && p.updatedAt.includes('T')
                          ? new Date(p.updatedAt).toLocaleDateString('tr-TR')
                          : p.updatedAt || ''}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModalOpen}
        title="Kaydedilmemiş Değişiklikler"
        description="Kaydedilmemiş değişiklikler var. Kaydetmeden diğer projeye geçmek istiyor musunuz?"
        confirmLabel="Kaydet"
        dismissLabel="Kaydetmeden Çık"
        onConfirm={handleConfirmNavigate}
        onCancel={handleCancelNavigate}
        onDismiss={handleDismissNavigate}
      />
    </>
  );
}
