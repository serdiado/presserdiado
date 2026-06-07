// Proje kartı — grid içinde kullanılan tek bileşen
// apps/web/src/features/dashboard/components/ProjectCard.tsx

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusPill } from './StatusPill';
import { useDashboardContext } from '../DashboardLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { MoreVertical, FolderOpen, Pencil, Copy, Trash2, Loader2 } from 'lucide-react';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

interface RenameModalProps {
  isOpen: boolean;
  initialName: string;
  onConfirm: (newName: string) => Promise<void> | void;
  onCancel: () => void;
}

export function RenameModal({ isOpen, initialName, onConfirm, onCancel }: RenameModalProps) {
  const [name, setName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isLoading) return;
    try {
      setIsLoading(true);
      await onConfirm(name);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-99999 animate-fade-in"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <div className="bg-surface-panel border border-border-default rounded-radius-xl p-6 w-full max-w-sm shadow-drop-lg animate-in fade-in zoom-in-95 duration-150 relative">
        <h3 className="text-base font-bold text-text-primary mb-3">Projeyi Yeniden Adlandır</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 px-3 border border-slate-300 focus:border-slate-500 rounded-md text-sm w-full outline-none transition-colors mb-4"
            placeholder="Proje adı"
            autoFocus
            disabled={isLoading}
          />
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="h-9 px-4 text-xs font-semibold bg-surface-subtle hover:bg-border-default border border-border-strong text-text-secondary rounded-md transition-all cursor-pointer disabled:opacity-40"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="h-9 px-4 text-xs font-semibold bg-primary hover:bg-primary-hover text-white border border-transparent rounded-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <span>Kaydet</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const navigate = useNavigate();
  const { refetchProjects } = useDashboardContext();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClick = onClick ?? (() => navigate(`/studio/${project.id}`));

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsMenuOpen(false);
    handleClick();
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsMenuOpen(false);
    setIsRenameOpen(true);
  };

  const handleRenameConfirm = async (newName: string) => {
    try {
      await api.patch(`/projects/${project.id}`, { name: newName });
      toast.success('Proje adı güncellendi');
      setIsRenameOpen(false);
      await refetchProjects();
    } catch {
      toast.error('Proje adı güncellenemedi');
    }
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsMenuOpen(false);
    setIsDuplicating(true);
    try {
      const { data: original } = await api.get(`/projects/${project.id}`);
      await api.post('/projects', {
        name: `${original.name} (Kopya)`,
        productTypeId: original.productTypeId,
        canvasData: original.canvasData,
        printConfig: original.printConfig,
      });
      toast.success('Proje çoğaltıldı');
      await refetchProjects();
    } catch (err) {
      console.error(err);
      toast.error('Proje çoğaltılamadı');
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsMenuOpen(false);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/projects/${project.id}`);
      toast.success('Proje silindi');
      setIsDeleteOpen(false);
      await refetchProjects();
    } catch {
      toast.error('Proje silinemedi');
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="text-left bg-white rounded-lg border border-slate-200
                   hover:border-slate-400 hover:shadow-sm transition-all overflow-hidden w-full relative group"
      >
        {/* Thumbnail */}
        <div
          className="aspect-4/3 relative flex items-center justify-center w-full"
          style={{ background: project.coverColor ?? '#f1f5f9' }}
        >
          {project.thumbnailKey ? (
            <img
              src={`/uploads/${project.thumbnailKey}`}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          ) : (
            /* Görsel yoksa mini ızgara placeholder */
            <div className="bg-white shadow-sm" style={{ width: '60%', height: '80%' }}>
              <div className="grid grid-cols-4 gap-0.5 p-1 h-full">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="bg-slate-100 rounded-sm" />
                ))}
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <StatusPill status={project.status} sm />
          </div>
        </div>

        {/* Meta */}
        <div className="p-3 flex justify-between items-start gap-2 relative">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-800 truncate" title={project.name}>
              {project.name}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate">{project.type}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {typeof project.updatedAt === 'string' && project.updatedAt.includes('T')
                ? new Date(project.updatedAt).toLocaleDateString('tr-TR')
                : project.updatedAt}
            </div>
          </div>

          {/* Actions Dropdown */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={handleMenuToggle}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1 z-10 w-44 bg-white border border-slate-200 rounded-md shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-100">
                <button
                  onClick={handleOpen}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 cursor-pointer"
                >
                  <FolderOpen size={14} className="text-slate-400" />
                  <span>Aç</span>
                </button>
                <button
                  onClick={handleRenameClick}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 cursor-pointer"
                >
                  <Pencil size={14} className="text-slate-400" />
                  <span>Yeniden Adlandır</span>
                </button>
                <button
                  onClick={handleDuplicate}
                  disabled={isDuplicating}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {isDuplicating ? (
                    <Loader2 size={14} className="animate-spin text-slate-400" />
                  ) : (
                    <Copy size={14} className="text-slate-400" />
                  )}
                  <span>Çoğalt</span>
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={handleDeleteClick}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 size={14} className="text-red-400" />
                  <span>Sil</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </button>

      <RenameModal
        isOpen={isRenameOpen}
        initialName={project.name}
        onConfirm={handleRenameConfirm}
        onCancel={() => setIsRenameOpen(false)}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Projeyi Sil"
        description={`"${project.name}" projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmLabel="Projeyi Sil"
        cancelLabel="Vazgeç"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </>
  );
}
