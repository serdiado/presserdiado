// Proje kartı — grid içinde kullanılan tek bileşen
// apps/web/src/features/dashboard/components/ProjectCard.tsx

import { useNavigate } from 'react-router-dom';
import { StatusPill } from './StatusPill';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const navigate = useNavigate();

  const handleClick = onClick ?? (() => navigate(`/studio/${project.id}`));

  return (
    <button
      onClick={handleClick}
      className="text-left bg-white rounded-lg border border-slate-200
                 hover:border-slate-400 hover:shadow-sm transition-all overflow-hidden"
    >
      {/* Thumbnail */}
      <div
        className="aspect-4/3 relative flex items-center justify-center"
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
      <div className="p-3">
        <div className="text-sm font-semibold text-slate-800 truncate">{project.name}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">{project.type}</div>
        <div className="text-[11px] text-slate-400 mt-1">
          {typeof project.updatedAt === 'string' && project.updatedAt.includes('T')
            ? new Date(project.updatedAt).toLocaleDateString('tr-TR')
            : project.updatedAt}
        </div>
      </div>
    </button>
  );
}
