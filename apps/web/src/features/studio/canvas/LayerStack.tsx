import { useMemo } from 'react';
import type { StudioForma } from '@matbaapro/shared';
import { useCatalogStore, useLayerStore } from '@/stores/studio';
import { LayerRenderer } from './LayerRenderer';

export function LayerStack({ forma }: { forma?: StudioForma }) {
  const layers = useLayerStore((s) => s.layers);
  const template = useCatalogStore((s) => s.activeTemplate);

  const filtered = useMemo(() => {
    if (!forma) return [];
    const formaPageIds = forma.pages.map((p) => p.id);
    return layers
      .filter((l) => {
        const mask = l.mask;
        if (!mask || mask.type === 'document') return true;
        if (mask.type === 'spread') return mask.targetIds.every((id) => formaPageIds.includes(id));
        if (mask.type === 'page') return mask.targetIds.some((id) => formaPageIds.includes(id));
        return false;
      })
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  }, [layers, forma]);

  if (!forma || !template) return null;

  return (
    <>
      {filtered.map((l) => (
        <LayerRenderer key={l.id} layer={l} forma={forma} template={template} />
      ))}
    </>
  );
}
