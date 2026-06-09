import { Folder } from 'lucide-react';

export function GenelMedyaPage() {
  return (
    <div className="p-8 w-full max-w-[1200px] mx-auto">
      <h1 className="text-heading-xl text-text-primary mb-6">Medya</h1>
      <div className="flex flex-col items-center justify-center py-20 bg-surface-panel border border-border-default rounded-radius-lg">
        <Folder size={32} className="text-text-muted mb-4" />
        <p className="text-body-md text-text-muted">Bu bölüm yakında aktif olacak</p>
      </div>
    </div>
  );
}
