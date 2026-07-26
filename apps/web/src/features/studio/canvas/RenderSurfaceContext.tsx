// Render yüzeyi bağlamı: aynı bileşen ağacı (Page → Slot) hem stüdyo kanvasında hem de
// Puppeteer'ın bastığı /print-view rotasında kullanılıyor. Bu bağlam, o ağacın hangi amaçla
// çizildiğini söyler; tek fark görselin hangi katmandan çekileceğidir.
//
// Varsayılan 'screen' — stüdyo tarafında hiçbir değişiklik gerekmez.
// PrintView kendini 'original' ile sarmalar → baskıya her zaman tam çözünürlük gider.
//
// Bu, geometriyi DEĞİŞTİRMEZ: yerleşim ölçüleri mm cinsinden hesaplanıyor ve Slot.tsx'te
// görselin çizim kutusu konteynerden geliyor (w-full/h-full), dosyanın piksel sayısından
// değil. Dolayısıyla ekran ile PDF arasında konum/boyut farkı oluşmaz.
import { createContext, useContext } from 'react';
import type { ImageTier } from '@/lib/imageTier';

const RenderSurfaceContext = createContext<ImageTier>('screen');

export function RenderSurfaceProvider({
  tier,
  children,
}: {
  tier: ImageTier;
  children: React.ReactNode;
}) {
  return <RenderSurfaceContext.Provider value={tier}>{children}</RenderSurfaceContext.Provider>;
}

/** Bulunulan render yüzeyinin görsel katmanı. JSX içinde tierUrl ile birlikte kullanılır. */
export function useImageTier(): ImageTier {
  return useContext(RenderSurfaceContext);
}
