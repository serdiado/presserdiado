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
import { parseApiDate } from '@/lib/date';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const navigate = useNavigate();
  const { refetchProjects } = useDashboardContext();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [isSaving, setIsSaving] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

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
    setIsEditing(true);
  };

  const handleSaveRename = async () => {
    if (!editName.trim() || editName === project.name) {
      setIsEditing(false);
      return;
    }
    try {
      setIsSaving(true);
      await api.patch(`/projects/${project.id}`, { name: editName.trim() });
      toast.success('Proje adı güncellendi');
      setIsEditing(false);
      await refetchProjects();
    } catch {
      toast.error('Proje adı güncellenemedi');
      setEditName(project.name);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditName(project.name);
      setIsEditing(false);
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
      <div
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        className={`text-left bg-surface-panel rounded-lg border border-border-default
                   hover:border-border-strong hover:shadow-sm transition-all w-full relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-border-strong ${
                     isMenuOpen ? 'z-20' : 'z-10'
                   }`}
      >
        {/* Thumbnail */}
        <div
          className="aspect-4/3 relative flex items-center justify-center w-full rounded-t-lg overflow-hidden bg-surface-subtle"
          style={{ background: project.coverColor }}
        >
          {project.thumbnailKey ? (
            <img
              src={project.thumbnailKey}
              alt={project.name}
              className="w-full h-full object-contain"
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
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveRename}
                onKeyDown={handleInputKeyDown}
                onClick={(e) => e.stopPropagation()}
                disabled={isSaving}
                className="w-full h-7 px-1.5 py-0.5 text-body-md font-semibold text-text-primary bg-surface-subtle border border-border-strong rounded-radius-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            ) : (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsEditing(true);
                }}
                className="text-body-md font-semibold text-text-primary truncate hover:bg-surface-subtle px-1 -mx-1 rounded-radius-sm cursor-text"
                title={project.name}
              >
                {project.name}
              </div>
            )}
            <div className="text-body-xs text-text-secondary mt-0.5 truncate">{project.type}</div>
            <div className="text-body-xs text-text-muted mt-1">
              {parseApiDate(project.updatedAt).toLocaleDateString('tr-TR')}
            </div>
          </div>

          {/* Actions Dropdown */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={handleMenuToggle}
              className="p-1 hover:bg-surface-subtle rounded-md text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1 z-50 w-44 bg-surface-panel border border-border-default rounded-md shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-100">
                <button
                  onClick={handleOpen}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary flex items-center gap-2 cursor-pointer"
                >
                  <FolderOpen size={14} className="text-text-muted" />
                  <span>Aç</span>
                </button>
                <button
                  onClick={handleRenameClick}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary flex items-center gap-2 cursor-pointer"
                >
                  <Pencil size={14} className="text-text-muted" />
                  <span>Yeniden Adlandır</span>
                </button>
                <button
                  onClick={handleDuplicate}
                  disabled={isDuplicating}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary flex items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {isDuplicating ? (
                    <Loader2 size={14} className="animate-spin text-text-muted" />
                  ) : (
                    <Copy size={14} className="text-text-muted" />
                  )}
                  <span>Çoğalt</span>
                </button>
                <div className="border-t border-border-default my-1"></div>
                <button
                  onClick={handleDeleteClick}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-danger hover:bg-danger-subtle hover:text-danger-hover flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Trash2 size={14} className="text-danger" />
                  <span>Sil</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
