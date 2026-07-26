// Görseli YALNIZCA kutusu görünür alana yaklaştığında DOM'a koyar (IntersectionObserver).
//
// NEDEN: Stüdyodaki ürün havuzu / bekleme listeleri yüzlerce satırı tek seferde render ediyor
// (ölçüm: 645 satır, 263 görsel) ama liste kutusu yalnızca ~320px. Görseller 36x36'lık
// kutucuklarda gösterilse de dosyalar 1500x1500 olduğu için her biri ~9 MB decode edilmiş
// bitmap tutuyor → tek liste ~2 GB bellek. Ölçülen alternatifler YETMEDİ:
//   - loading="lazy": bu senaryoda hiçbir görseli ertelemedi (0 erteleme).
//   - content-visibility:auto: render'ı atlıyor ama tarayıcı kaynağı yine indirip decode ediyor.
// Tek kesin çözüm: görünür değilken <img> etiketini hiç render etmemek.
//
// KANVASTA KULLANMAYIN: Puppeteer export'unda (/print-view) tüm hücreler tek karede render
// edilir; ertelenmiş bir görsel #print-canvas-ready tetiklendiğinde henüz yüklenmemiş olabilir
// ve PDF'e boş girer. Kanvas görselleri için Slot.tsx'teki düz <img> kullanılır.
import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';

interface DeferredImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  /** Görünür alana bu kadar yaklaşınca yüklemeye başla. Varsayılan 300px. */
  rootMargin?: string;
}

export function DeferredImage({ src, rootMargin = '300px', ...imgProps }: DeferredImageProps) {
  const kutuRef = useRef<HTMLSpanElement>(null);
  const [yakin, setYakin] = useState(false);

  useEffect(() => {
    if (yakin) return;
    // DİKKAT: sarmalayıcı span `display: contents` — kendi layout kutusu YOKTUR, bu yüzden
    // IntersectionObserver onu hiçbir zaman kesişiyor saymaz (ölçümde doğrulandı: hiçbir
    // görsel yüklenmiyordu). Gözlem, gerçek kutuyu üreten ebeveyne bağlanır.
    const el = kutuRef.current?.parentElement;
    if (!el) return;
    // IntersectionObserver yoksa (çok eski tarayıcı) doğrudan yükle — bozulmasın.
    if (typeof IntersectionObserver === 'undefined') {
      setYakin(true);
      return;
    }
    const gozlemci = new IntersectionObserver(
      (girisler) => {
        if (girisler.some((g) => g.isIntersecting)) {
          setYakin(true);
          gozlemci.disconnect();
        }
      },
      { rootMargin },
    );
    gozlemci.observe(el);
    return () => gozlemci.disconnect();
  }, [yakin, rootMargin]);

  return (
    <span ref={kutuRef} className="contents">
      {yakin ? <img src={src} decoding="async" {...imgProps} /> : null}
    </span>
  );
}
