import { useMemo } from 'react';
import type { Layer, StudioForma, BrochureTemplate, CatalogPage } from '@matbaapro/shared';
import { MM_TO_PX } from '../util/style';

interface Props {
  layer: Layer;
  forma: StudioForma;
  template: BrochureTemplate;
}

function getPageOffsetX(
  forma: StudioForma,
  pageId: string,
  template: BrochureTemplate,
): number {
  const targetIdx = forma.pages.findIndex((p) => p.id === pageId);
  if (targetIdx === -1) return 0;
  return forma.pages.slice(0, targetIdx).reduce((sum, p: CatalogPage) => {
    const tp = template.pages.find((tt) => tt.pageNumber === p.pageNumber);
    return sum + (tp?.widthMm ?? 210);
  }, 0);
}

export function LayerRenderer({ layer, forma, template }: Props) {
  const geom = useMemo(() => {
    let leftPx = (layer.bounds.x + template.bleedMm) * MM_TO_PX;
    let topPx = (layer.bounds.y + template.bleedMm) * MM_TO_PX;
    let widthPx = layer.bounds.w * MM_TO_PX;
    let heightPx = layer.bounds.h * MM_TO_PX;

    if (
      !layer.mask ||
      layer.mask.type === 'document' ||
      !layer.mask.targetIds ||
      layer.mask.targetIds.length === 0
    ) {
      if (layer.type === 'solid' || layer.type === 'image') {
        leftPx = 0;
        topPx = 0;
        widthPx = (template.openWidthMm + template.bleedMm * 2) * MM_TO_PX;
        heightPx = (template.openHeightMm + template.bleedMm * 2) * MM_TO_PX;
      }
      return { clipPath: 'none', leftPx, topPx, widthPx, heightPx };
    }

    const rects = layer.mask.targetIds
      .map((pid) => {
        const page = forma.pages.find((p) => p.id === pid);
        const pConfig = template.pages.find((tt) => tt.pageNumber === page?.pageNumber);
        if (!page || !pConfig) return null;
        const idx = forma.pages.findIndex((p) => p.id === pid);
        const xOffset = getPageOffsetX(forma, pid, template);
        let x1 = xOffset + template.bleedMm;
        let x2 = x1 + pConfig.widthMm;
        let y1 = template.bleedMm - template.bleedMm;
        let y2 = template.bleedMm + template.openHeightMm + template.bleedMm;
        if (idx === 0) x1 -= template.bleedMm;
        if (idx === forma.pages.length - 1) x2 += template.bleedMm;
        else x2 += 0.5;
        return { x1, x2, y1, y2 };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (rects.length === 0) return { clipPath: 'none', leftPx, topPx, widthPx, heightPx };

    const minX = Math.min(...rects.map((r) => r.x1));
    const minY = Math.min(...rects.map((r) => r.y1));
    const maxX = Math.max(...rects.map((r) => r.x2));
    const maxY = Math.max(...rects.map((r) => r.y2));

    const layerLeftPx = minX * MM_TO_PX;
    const layerTopPx = minY * MM_TO_PX;
    const layerWidthPx = (maxX - minX) * MM_TO_PX;
    const layerHeightPx = (maxY - minY) * MM_TO_PX;

    let clipPath = `polygon(0 0, ${layerWidthPx}px 0, ${layerWidthPx}px ${layerHeightPx}px, 0 ${layerHeightPx}px)`;
    if (layer.mask.excludeGaps) {
      rects.sort((a, b) => a.x1 - b.x1);
      const top: string[] = [];
      const bot: string[] = [];
      for (const r of rects) {
        const lx1 = (r.x1 - minX) * MM_TO_PX;
        const lx2 = (r.x2 - minX) * MM_TO_PX;
        const ly1 = (r.y1 - minY) * MM_TO_PX;
        const ly2 = (r.y2 - minY) * MM_TO_PX;
        top.push(`${lx1}px ${ly1}px`, `${lx2}px ${ly1}px`);
        bot.unshift(`${lx1}px ${ly2}px`, `${lx2}px ${ly2}px`);
      }
      clipPath = `polygon(${[...top, ...bot].join(', ')})`;
    }

    return {
      clipPath,
      leftPx: layerLeftPx,
      topPx: layerTopPx,
      widthPx: layerWidthPx,
      heightPx: layerHeightPx,
    };
  }, [layer, forma, template]);

  if (!layer.visible) return null;

  const rotation = layer.transform.rotation || 0;
  const scaleVal = (layer.transform.scale ?? 100) / 100;
  const sx = scaleVal * (layer.transform.flipX ? -1 : 1);
  const sy = scaleVal * (layer.transform.flipY ? -1 : 1);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${geom.leftPx}px`,
        top: `${geom.topPx}px`,
        width: `${geom.widthPx}px`,
        height: `${geom.heightPx}px`,
        opacity: (layer.properties.opacity ?? 100) / 100,
        mixBlendMode: (layer.properties.blendMode as React.CSSProperties['mixBlendMode']) || 'normal',
        pointerEvents: layer.locked ? 'none' : 'auto',
        zIndex: layer.zIndex,
        clipPath: geom.clipPath,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `rotate(${rotation}deg) scale(${sx}, ${sy})`,
        }}
      >
        {layer.type === 'solid' ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: (layer.properties.color as string) || 'transparent',
            }}
          />
        ) : layer.properties.imageUrl ? (
          <img
            src={layer.properties.imageUrl as string}
            alt={layer.name ?? ''}
            style={{
              width: layer.properties.fitMode === 'fit-height' ? 'auto' : '100%',
              height: layer.properties.fitMode === 'fit-width' ? 'auto' : '100%',
              minWidth: layer.properties.fitMode === 'fit-width' ? '100%' : undefined,
              minHeight: layer.properties.fitMode === 'fit-height' ? '100%' : undefined,
              objectFit:
                layer.properties.fitMode === 'fit-width' ||
                layer.properties.fitMode === 'fit-height'
                  ? 'initial'
                  : layer.properties.fitMode === 'repeat'
                    ? 'fill'
                    : ((layer.properties.fitMode as React.CSSProperties['objectFit']) || 'cover'),
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
