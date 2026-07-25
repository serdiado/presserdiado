// Görünüm ayarları birleştirmesi (zemin/çerçeve/köşe → BorderData/CellAppearance) öncesi
// JSON-import edilen kod-içi presetler/modüller (afpack-tema.json, afpack-banner.json,
// afpack-pizza-karton.json) eski şekli taşıyor. Bu dosyalar `as unknown as X` çifte cast
// ile içe aktarılıyor — derleyici bunları KONTROL ETMEZ, tip değişikliği burada sessiz kalır
// ve render koduna eski şekil (ör. containerBorder:{color,width}) geçerse çerçeve görünmez
// hale gelir. Bu fonksiyon JSON'u DEĞİŞTİRMEDEN, import edildiği anda bir kez normalize eder.
//
// Kural seti (yalnız KENDİNE has parmak izi olan alanlar dönüştürülür — zaten yeni şekilde
// olanlar dokunulmadan geçer, idempotent):
// 1) containerBorder: {color:{c,o}, width} → BorderData {t,r,b,l,linked,color,style}
// 2) (herhangi bir düzeydeki) colors.cellBorder / colors.priceBorder: {c,o} (ColorOpacity) +
//    kardeş borderWidth/priceBorderWidth (sayı) → BorderData; kardeş alanlar silinir.
// 3) düz bgColor(string)+bgOpacity?+borderColor(string)+borderOpacity?+borderWidth?+borderRadius?
//    (badge/nameSettings/priceSettings) → appearance: CellAppearance (radius yoksa CellAppearanceNoRadius).

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function isLegacyContainerBorder(v: unknown): v is { color: { c: string; o: number }; width: number } {
  return isObject(v) && 'width' in v && isObject(v.color) && !('t' in v);
}

function isLegacyColorOpacity(v: unknown): v is { c: string; o: number } {
  return isObject(v) && typeof v.c === 'string' && typeof v.o === 'number' && !('t' in v);
}

function expandBorder(color: { c: string; o: number }, width: number): Record<string, unknown> {
  return { t: width, r: width, b: width, l: width, linked: true, color, style: 'solid' };
}

/** Derin, tek seferlik normalize. Zaten yeni şekilde olan alanlara dokunmaz (idempotent). */
export function normalizeLegacyAppearance(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(normalizeLegacyAppearance);
  if (!isObject(node)) return node;

  const obj: Record<string, unknown> = { ...node };

  // 1) containerBorder (BannerModuleData) — kendi kendine yeten, kardeş alan gerekmez.
  if (isLegacyContainerBorder(obj.containerBorder)) {
    obj.containerBorder = expandBorder(obj.containerBorder.color, obj.containerBorder.width);
  }

  // 2) colors.cellBorder / colors.priceBorder (CatalogSettings) — kardeş borderWidth/priceBorderWidth
  //    bu objenin (colors'ın kendisi değil, colors'ı TAŞIYAN objenin) alanı.
  if (isObject(obj.colors)) {
    const colors: Record<string, unknown> = { ...obj.colors };
    if (isLegacyColorOpacity(colors.cellBorder)) {
      colors.cellBorder = expandBorder(colors.cellBorder, typeof obj.borderWidth === 'number' ? obj.borderWidth : 0);
    }
    if (isLegacyColorOpacity(colors.priceBorder)) {
      colors.priceBorder = expandBorder(colors.priceBorder, typeof obj.priceBorderWidth === 'number' ? obj.priceBorderWidth : 0);
    }
    obj.colors = colors;
    delete obj.borderWidth;
    delete obj.priceBorderWidth;
  }

  // 3) Düz bg/border alanları (badge / nameSettings / priceSettings) → appearance.
  if (typeof obj.bgColor === 'string' || typeof obj.borderColor === 'string') {
    const bg = typeof obj.bgColor === 'string'
      ? { type: 'solid', color: obj.bgColor, opacity: typeof obj.bgOpacity === 'number' ? obj.bgOpacity : 100 }
      : { type: 'solid', color: '#ffffff', opacity: 0 };
    const width = typeof obj.borderWidth === 'number' ? obj.borderWidth : 0;
    const border = expandBorder(
      {
        c: typeof obj.borderColor === 'string' ? obj.borderColor : '#e2e8f0',
        o: typeof obj.borderOpacity === 'number' ? obj.borderOpacity : 100,
      },
      width,
    );
    const hasRadius = typeof obj.borderRadius === 'number';
    obj.appearance = hasRadius
      ? {
          bg,
          border,
          radius: { tl: obj.borderRadius, tr: obj.borderRadius, bl: obj.borderRadius, br: obj.borderRadius, linked: true },
        }
      : { bg, border };
    delete obj.bgColor;
    delete obj.bgOpacity;
    delete obj.borderColor;
    delete obj.borderOpacity;
    delete obj.borderWidth;
    delete obj.borderRadius;
  }

  for (const key of Object.keys(obj)) {
    obj[key] = normalizeLegacyAppearance(obj[key]);
  }
  return obj;
}
