import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { captureAndUploadThumbnail } from '@/lib/thumbnailCapture';
import { useCatalogStore } from '@/stores/studio';
import { serializeStudioState } from '../lib/projectSerializer';

interface SaveOptions {
  // true → thumbnail yakalama+yükleme tamamlanmadan dönme (panele çıkışta eski thumbnail görünmesin).
  awaitThumbnail?: boolean;
}

interface UseProjectSaveResult {
  saveProject: (opts?: SaveOptions) => Promise<string>;
  isSaving: boolean;
}

// Thumbnail üretimini en fazla `ms` kadar bekle; yakalama takılırsa çıkışı bloklamamak için yarış.
function awaitWithTimeout(p: Promise<unknown>, ms: number): Promise<unknown> {
  return Promise.race([p, new Promise((resolve) => setTimeout(resolve, ms))]);
}

export function useProjectSave(): UseProjectSaveResult {
  const navigate = useNavigate();
  const projectId = useCatalogStore((s) => s.projectId);
  const setProjectId = useCatalogStore((s) => s.setProjectId);
  const projectName = useCatalogStore((s) => s.projectName);
  const setIsDirty = useCatalogStore((s) => s.setIsDirty);
  const [isSaving, setIsSaving] = useState(false);

  const saveProject = async (opts?: SaveOptions): Promise<string> => {
    const toastId = toast.loading('Tasarım buluta kaydediliyor...');
    setIsSaving(true);

    try {
      const canvasData = serializeStudioState();

      if (!projectId) {
        // İlk kayıt
        // TODO: productTypeId'yi aktif template kategorisinden türet (şu an sabit broşür)
        const response = await api.post('/projects', {
          name: projectName,
          productTypeId: '00000000-0000-0000-0000-000000000001',
          canvasData,
          status: 'saved',
        });
        const newId = response.data.id as string;
        setProjectId(newId);
        setIsDirty(false);
        navigate(`/studio/${newId}`, { replace: true });
        toast.success('Tasarım buluta başarıyla kaydedildi!', { id: toastId });

        // Thumbnail yakalama + yükleme. navigate replace sonrası canvas DOM'u yeniden render
        // edilmediği için yakalama güvenle tamamlanır. awaitThumbnail ise panele çıkmadan önce bitir.
        const canvasEl = document.getElementById('studio-canvas-root');
        if (canvasEl) {
          const thumb = captureAndUploadThumbnail(canvasEl, newId);
          if (opts?.awaitThumbnail) await awaitWithTimeout(thumb, 5000);
          else void thumb;
        }

        return newId;
      }

      // Güncelleme
      await api.patch(`/projects/${projectId}/canvas`, {
        canvasData,
        name: projectName,
      });
      setIsDirty(false);
      toast.success('Değişiklikler buluta kaydedildi!', { id: toastId });

      // Thumbnail yakalama + yükleme. awaitThumbnail ise (panele çıkışta-kaydet) navigasyondan
      // önce bitir ki panel taze thumbnailKey'i çeksin; aksi halde arka planda koşar.
      const canvasEl = document.getElementById('studio-canvas-root');
      if (canvasEl) {
        const thumb = captureAndUploadThumbnail(canvasEl, projectId);
        if (opts?.awaitThumbnail) await awaitWithTimeout(thumb, 5000);
        else void thumb;
      }

      return projectId;
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      toast.error('Tasarım kaydedilirken bir hata oluştu.', { id: toastId });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveProject, isSaving };
}