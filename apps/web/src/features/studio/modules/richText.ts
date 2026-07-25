// Run-level çok-stil rich-text motoru (B modeli = re-segmentation).
// docs/metin-ayarlari-merkezi-mimari.md §5 + docs/opus-plan-cat1-metin-merkezi.md (Faz 0–1) ile hizalı.
//
// Model: run = `cell.text` HTML'i içinde inline `<span style="…">` (constrained-HTML; opacity
// color'a rgba ile gömülü). Ayrı run-array YOK — depolama düzenleme-anı modelinden bağımsız.
// Bu modül dört işi yapar:
//   1) Aktif zengin-metin seçim oturumu (React-dışı singleton) — BannerSection yazar,
//      ContextualBar okur (iki bileşen arası köprü; canlı DOM Range store'a girmez).
//   2) Renk codec'i (parseRunColor/runColorCss) — opacity rgba alfasına gömülü, round-trip korunur.
//   3) Re-segmentation motoru: hücre HTML'ini {text,style} segmentlerine PARSE et → range
//      offsetlerine property yaz → bitişik-eşit-stil COALESCE → minimal span SERIALIZE.
//      Flat by-construction, idempotent, property sayısından bağımsız.
//   4) Commit sınırı sanitizer (DOMPurify, sıkı allowlist) — güvenlik sınırı.

import DOMPurify from 'dompurify';
import { hexToRgba } from '../util/style';

// ─────────────────────────────────────────────────────────────────────────────
// 1) Aktif seçim oturumu (singleton)
// ─────────────────────────────────────────────────────────────────────────────
export interface RichTextSession {
  slotId: string;
  cellId: string;
  /** selectionchange anında klonlanmış range — canlı seçim collapse olsa bile geçerli kalır. */
  range: Range;
}

let activeSession: RichTextSession | null = null;

export function setActiveRange(slotId: string, cellId: string, range: Range): void {
  activeSession = { slotId, cellId, range: range.cloneRange() };
}

export function getActiveSession(): RichTextSession | null {
  return activeSession;
}

export function clearActiveSession(): void {
  activeSession = null;
}

/** Range'in HER İKİ ucu da verilen element içinde mi? */
export function isRangeWithinElement(range: Range, el: HTMLElement): boolean {
  return el.contains(range.startContainer) && el.contains(range.endContainer);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2) Renk codec — cell-level (BannerSection font.color) ile BİREBİR
// ─────────────────────────────────────────────────────────────────────────────
/** opacity<100 → rgba(); aksi halde düz hex. Cell-level render'la görsel parite. */
export function runColorCss(hex: string, opacity: number): string {
  return opacity < 100 ? hexToRgba(hex, opacity) : hex;
}

/** Inline color'ı `{color,opacity}`'ye ters çözer (opacity rgba alfasından). Round-trip kaynağı. */
export function parseRunColor(el: HTMLElement): { color: string; opacity: number } | null {
  const c = (el.style?.color ?? '').trim();
  if (!c) return null;
  const m = c.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(0|1|0?\.\d+)\s*)?\)$/i,
  );
  if (m) {
    const hex =
      '#' + [m[1], m[2], m[3]].map((n) => Math.min(255, +n).toString(16).padStart(2, '0')).join('');
    const opacity = m[4] !== undefined ? Math.round(parseFloat(m[4]) * 100) : 100;
    return { color: hex, opacity };
  }
  if (/^#[0-9a-f]{6}$/i.test(c)) return { color: c.toLowerCase(), opacity: 100 };
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3) Re-segmentation motoru — düzenleme-anı in-memory model
// ─────────────────────────────────────────────────────────────────────────────

/** Bir segmentin stili. Tüm alanlar opsiyonel = "miras al". Bool'lar SADECE true tutulur
 *  (false ≡ yok kanonik — coalesce/idempotence için kritik). */
export interface RunStyle {
  color?: string; // '#rrggbb' (lowercase)
  opacity?: number; // 0-100, yalnız color ile anlamlı
  fontFamily?: string;
  fontSize?: number; // px
  fontWeight?: string; // kanonik: '400' | '700' | …
  italic?: boolean;
  underline?: boolean;
  lineThrough?: boolean;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize';
  superscript?: boolean; // üst-karakter; boyutu cell-level decimalScale'den (--sup-scale) gelir
}

export type RunProperty =
  | 'color'
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'italic'
  | 'underline'
  | 'lineThrough'
  | 'textTransform'
  | 'superscript';

export type RunValue = string | number | boolean | { color: string; opacity: number };

/** Karışık (indeterminate) seçim okuması — kontrol yansımasında "belirsiz" anlamı. */
export const MIXED = '__mixed__' as const;
export type ReadResult = RunValue | typeof MIXED | undefined;

type Segment = { text: string; style: RunStyle } | { br: true };

function isText(seg: Segment): seg is { text: string; style: RunStyle } {
  return 'text' in seg;
}

function segLen(seg: Segment): number {
  return isText(seg) ? seg.text.length : 1; // <br> = 1 karakter (offset kararlılığı)
}

// — Kanonikleştirme — ────────────────────────────────────────────────────────
function canonicalWeight(w: string): string {
  const s = w.trim().toLowerCase();
  if (s === 'bold') return '700';
  if (s === 'normal') return '400';
  return s;
}

/** Stil eşitliği/coalesce için temsil-bağımsız kanonik form:
 *  bool false/undefined ≡ yok; fontWeight bold/normal → 700/400; textTransform 'none' ≡ yok;
 *  color lowercase + opacity default 100. */
function canonicalStyle(s: RunStyle): RunStyle {
  const out: RunStyle = {};
  if (s.color) {
    out.color = s.color.toLowerCase();
    out.opacity = s.opacity == null ? 100 : s.opacity;
  }
  if (s.fontFamily) out.fontFamily = s.fontFamily;
  if (s.fontSize != null) out.fontSize = s.fontSize;
  if (s.fontWeight) out.fontWeight = canonicalWeight(s.fontWeight);
  if (s.italic) out.italic = true;
  if (s.underline) out.underline = true;
  if (s.lineThrough) out.lineThrough = true;
  if (s.superscript) out.superscript = true;
  if (s.textTransform) out.textTransform = s.textTransform; // 'none' applyPatch/parse'te zaten elenir
  return out;
}

function styleKey(s: RunStyle): string {
  const c = canonicalStyle(s);
  return JSON.stringify([
    c.color ?? '',
    c.opacity ?? '',
    c.fontFamily ?? '',
    c.fontSize ?? '',
    c.fontWeight ?? '',
    c.italic ? 1 : 0,
    c.underline ? 1 : 0,
    c.lineThrough ? 1 : 0,
    c.superscript ? 1 : 0,
    c.textTransform ?? '',
  ]);
}

function styleEquals(a: RunStyle, b: RunStyle): boolean {
  return styleKey(a) === styleKey(b);
}

/** property+value → segment stiline yaz. Bool `false` → anahtarı SİL (kanonikleştirme). */
function applyPatch(style: RunStyle, property: RunProperty, value: RunValue): RunStyle {
  const next: RunStyle = { ...style };
  switch (property) {
    case 'color': {
      const v = value as { color: string; opacity: number };
      next.color = v.color;
      next.opacity = v.opacity;
      break;
    }
    case 'fontFamily':
      next.fontFamily = value as string;
      break;
    case 'fontSize':
      next.fontSize = value as number;
      break;
    case 'fontWeight':
      next.fontWeight = canonicalWeight(value as string);
      break;
    case 'textTransform': {
      const v = value as string;
      if (v === 'none') delete next.textTransform;
      else next.textTransform = v as RunStyle['textTransform'];
      break;
    }
    case 'italic':
    case 'underline':
    case 'lineThrough':
    case 'superscript':
      if (value) next[property] = true;
      else delete next[property];
      break;
  }
  return canonicalStyle(next);
}

function readProp(style: RunStyle, property: RunProperty): RunValue | undefined {
  const c = canonicalStyle(style);
  switch (property) {
    case 'color':
      return c.color ? { color: c.color, opacity: c.opacity ?? 100 } : undefined;
    case 'fontFamily':
      return c.fontFamily;
    case 'fontSize':
      return c.fontSize;
    case 'fontWeight':
      return c.fontWeight;
    case 'italic':
      return !!c.italic;
    case 'underline':
      return !!c.underline;
    case 'lineThrough':
      return !!c.lineThrough;
    case 'superscript':
      return !!c.superscript;
    case 'textTransform':
      return c.textTransform;
  }
}

function valueKey(v: RunValue | undefined): string {
  if (v === undefined) return 'u';
  if (typeof v === 'object') return `c:${v.color}:${v.opacity}`;
  return `${typeof v}:${v}`;
}

// — Parse (HTML → flat segment listesi) — ─────────────────────────────────────
/** Bir elemandan stil katkısı: eski semantik etiketler (paste) + span inline stilleri.
 *  fontWeight kanonikleşir; text-decoration → underline/lineThrough bool'larına ayrışır. */
function styleFromElement(el: HTMLElement): RunStyle {
  const d: RunStyle = {};
  const tag = el.tagName;
  if (tag === 'B' || tag === 'STRONG') d.fontWeight = '700';
  if (tag === 'I' || tag === 'EM') d.italic = true;
  if (tag === 'U') d.underline = true;
  if (tag === 'S' || tag === 'STRIKE') d.lineThrough = true;
  if (tag === 'SUP') d.superscript = true;

  const st = el.style;
  if (st) {
    const col = parseRunColor(el);
    if (col) {
      d.color = col.color;
      d.opacity = col.opacity;
    }
    if (st.fontFamily) d.fontFamily = st.fontFamily;
    // Üst-karakter <sup> etiketiyle işaretlenir (yukarıda); px fontSize üst-karakterde okunmaz
    // (boyut --sup-scale'den gelir).
    const fs = st.fontSize;
    if (!d.superscript && fs && /^\d+(?:\.\d+)?px$/.test(fs.trim())) d.fontSize = parseFloat(fs);
    if (st.fontWeight) d.fontWeight = canonicalWeight(st.fontWeight);
    if (st.fontStyle === 'italic' || st.fontStyle === 'oblique') d.italic = true;
    const dec = ((st as { textDecorationLine?: string }).textDecorationLine || st.textDecoration || '')
      .toLowerCase();
    if (dec.includes('underline')) d.underline = true;
    if (dec.includes('line-through')) d.lineThrough = true;
    const tt = st.textTransform;
    if (tt === 'uppercase' || tt === 'lowercase' || tt === 'capitalize') d.textTransform = tt;
  }
  return d;
}

/** Hücre HTML'ini düz {text,style}|{br} segment listesine indirger. CSS cascade: iç ata kazanır.
 *  Text node'ları BİREBİR korur (trim/collapse YOK → whitespace round-trip). */
function parseCell(cellEl: HTMLElement): Segment[] {
  const segs: Segment[] = [];
  const visit = (node: Node, inherited: RunStyle): void => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 3) {
        const text = child.nodeValue ?? '';
        if (text.length > 0) segs.push({ text, style: { ...inherited } });
      } else if (child.nodeType === 1) {
        const el = child as HTMLElement;
        if (el.tagName === 'BR') {
          segs.push({ br: true });
          continue;
        }
        visit(el, canonicalStyle({ ...inherited, ...styleFromElement(el) }));
      }
    }
  };
  visit(cellEl, {});
  return coalesce(segs);
}

/** Bitişik eşit-stil text segmentlerini birleştir; boş text'i at; <br> run'ı keser. */
function coalesce(segs: Segment[]): Segment[] {
  const out: Segment[] = [];
  for (const seg of segs) {
    if (!isText(seg)) {
      out.push(seg);
      continue;
    }
    if (seg.text.length === 0) continue;
    const last = out[out.length - 1];
    if (last && isText(last) && styleEquals(last.style, seg.style)) {
      last.text += seg.text;
    } else {
      out.push({ text: seg.text, style: canonicalStyle(seg.style) });
    }
  }
  return out;
}

/** Verilen lineer offset'te bir text segmentini ikiye böl (kısmi-node sınır hizalama). */
function splitAt(segs: Segment[], offset: number): Segment[] {
  if (offset <= 0) return segs;
  const out: Segment[] = [];
  let pos = 0;
  for (const seg of segs) {
    const len = segLen(seg);
    if (isText(seg) && pos < offset && offset < pos + len) {
      const cut = offset - pos;
      out.push({ text: seg.text.slice(0, cut), style: { ...seg.style } });
      out.push({ text: seg.text.slice(cut), style: { ...seg.style } });
    } else {
      out.push(seg);
    }
    pos += len;
  }
  return out;
}

// — Serialize (segment → minimal span; DOM-node inşası → escaping/&nbsp; güvenli) — ──
function styleToCss(el: HTMLElement, style: RunStyle): boolean {
  const c = canonicalStyle(style);
  let any = false;
  if (c.color) {
    el.style.color = runColorCss(c.color, c.opacity ?? 100);
    any = true;
  }
  if (c.fontFamily) {
    el.style.fontFamily = c.fontFamily;
    any = true;
  }
  // Üst-karakter <sup> olarak üretilir; boyut + dikey ofset (cap-top hizası) global CSS'ten gelir
  // ([data-rt-editable] sup, --sup-scale). Burada üst-karaktere inline boyut/hiza YAZILMAZ; px
  // fontSize de üst-karakterde anlamsız (boyut --sup-scale) → atlanır.
  if (!c.superscript && c.fontSize != null) {
    el.style.fontSize = `${c.fontSize}px`;
    any = true;
  }
  if (c.fontWeight) {
    el.style.fontWeight = c.fontWeight;
    any = true;
  }
  if (c.italic) {
    el.style.fontStyle = 'italic';
    any = true;
  }
  if (c.underline || c.lineThrough) {
    const parts: string[] = [];
    if (c.underline) parts.push('underline');
    if (c.lineThrough) parts.push('line-through');
    el.style.textDecoration = parts.join(' ');
    any = true;
  }
  if (c.textTransform) {
    el.style.textTransform = c.textTransform;
    any = true;
  }
  return any;
}

function serializeSegments(cellEl: HTMLElement, segs: Segment[]): void {
  const doc = cellEl.ownerDocument;
  while (cellEl.firstChild) cellEl.removeChild(cellEl.firstChild);
  for (const seg of segs) {
    if (!isText(seg)) {
      cellEl.appendChild(doc.createElement('br'));
      continue;
    }
    if (seg.text.length === 0) continue;
    // Üst-karakter → <sup> (boyut/ofset global CSS'ten, --sup-scale ile). Diğer run stilleri
    // (renk/kalınlık/italik…) <sup>/<span> üzerine yazılır. Üst-karakter stilsiz olsa da <sup> kalır.
    const isSup = !!seg.style.superscript;
    const el = doc.createElement(isSup ? 'sup' : 'span');
    const styled = styleToCss(el, seg.style);
    if (isSup || styled) {
      el.appendChild(doc.createTextNode(seg.text));
      cellEl.appendChild(el);
    } else {
      cellEl.appendChild(doc.createTextNode(seg.text)); // stilsiz → çıplak text (span yok)
    }
  }
}

// — DOM ↔ lineer offset köprüsü (restore range için) — ────────────────────────
/** (container, containerOffset) DOM sınırı → cellEl içindeki lineer karakter offseti (br=1). */
function offsetWithin(root: Node, container: Node, containerOffset: number): number {
  let count = 0;
  let done = false;
  const visit = (node: Node): boolean => {
    if (done) return true;
    if (node === container) {
      if (node.nodeType === 3) {
        count += containerOffset;
      } else {
        const kids = node.childNodes;
        for (let i = 0; i < kids.length; i++) {
          if (i === containerOffset) break;
          if (visit(kids[i])) return true;
        }
      }
      done = true;
      return true;
    }
    if (node.nodeType === 3) {
      count += (node.nodeValue ?? '').length;
      return false;
    }
    if (node.nodeName === 'BR') {
      count += 1;
      return false;
    }
    const kids = node.childNodes;
    for (let i = 0; i < kids.length; i++) if (visit(kids[i])) return true;
    return false;
  };
  visit(root);
  return count;
}

/** Lineer offset → (node, offset) DOM sınırı (text node tercih edilir; br sınırı → parent+index). */
function locate(root: Node, pos: number): { node: Node; offset: number } {
  let remaining = pos;
  let result: { node: Node; offset: number } | null = null;
  const visit = (node: Node): boolean => {
    if (result) return true;
    if (node.nodeType === 3) {
      const len = (node.nodeValue ?? '').length;
      if (remaining <= len) {
        result = { node, offset: remaining };
        return true;
      }
      remaining -= len;
      return false;
    }
    if (node.nodeName === 'BR') {
      if (remaining === 0) {
        const parent = node.parentNode as Node;
        result = { node: parent, offset: Array.prototype.indexOf.call(parent.childNodes, node) };
        return true;
      }
      remaining -= 1;
      return false;
    }
    for (const c of Array.from(node.childNodes)) if (visit(c)) return true;
    return false;
  };
  visit(root);
  if (!result) result = { node: root, offset: root.childNodes.length };
  return result;
}

// — Public motor API — ────────────────────────────────────────────────────────
/** Seçili range'e bir run stili uygular (re-segmentation). collapsed/aralık-dışı → no-op.
 *  normalize-SONRASI restore range döner (offset-tabanlı; ACTIVE_MARK marker'ı YOK). */
export function applyRunStyle(
  cellEl: HTMLElement,
  range: Range,
  op: { property: RunProperty; value: RunValue },
): Range {
  if (range.collapsed) return range;
  const a = offsetWithin(cellEl, range.startContainer, range.startOffset);
  const b = offsetWithin(cellEl, range.endContainer, range.endOffset);
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  if (hi <= lo) return range;

  let segs = parseCell(cellEl);
  segs = splitAt(splitAt(segs, lo), hi);

  let pos = 0;
  segs = segs.map((seg) => {
    const len = segLen(seg);
    const segStart = pos;
    pos += len;
    if (isText(seg) && segStart >= lo && segStart + len <= hi) {
      return { text: seg.text, style: applyPatch(seg.style, op.property, op.value) };
    }
    return seg;
  });

  segs = coalesce(segs);
  serializeSegments(cellEl, segs);

  const start = locate(cellEl, lo);
  const end = locate(cellEl, hi);
  const restored = cellEl.ownerDocument.createRange();
  restored.setStart(start.node, start.offset);
  restored.setEnd(end.node, end.offset);
  return restored;
}

/** Seçimdeki property değerini okur. Tüm segmentler eşit → değer; farklı → MIXED; hiç yok → undefined. */
export function readRunStyle(cellEl: HTMLElement, range: Range, property: RunProperty): ReadResult {
  const a = offsetWithin(cellEl, range.startContainer, range.startOffset);
  const b = offsetWithin(cellEl, range.endContainer, range.endOffset);
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const segs = parseCell(cellEl);

  const vals: (RunValue | undefined)[] = [];
  let pos = 0;
  for (const seg of segs) {
    const len = segLen(seg);
    const s = pos;
    const e = pos + len;
    pos = e;
    if (!isText(seg)) continue;
    const overlap = lo === hi ? s < lo && lo <= e : s < hi && e > lo; // collapsed → caret solu
    if (overlap) vals.push(readProp(seg.style, property));
  }
  if (vals.length === 0) return undefined;
  const k0 = valueKey(vals[0]);
  return vals.every((v) => valueKey(v) === k0) ? vals[0] : MIXED;
}

/** Geri-uyum sarmalayıcı (renk yüzeyleri/testler dokunulmadan çalışsın). */
export function applyRunColor(
  cellEl: HTMLElement,
  range: Range,
  hex: string,
  opacity: number,
): Range {
  return applyRunStyle(cellEl, range, { property: 'color', value: { color: hex, opacity } });
}

/** Cell-level "property-scoped uniform": HTML'den bir run property'sini TÜM segmentlerden siler
 *  (re-segmentation). `color` → color+opacity birlikte; `underline`/`lineThrough` ortogonal (biri silinince
 *  diğeri korunur). Diğer run property'leri korunur. Pure (detached element). Plain text → no-op. */
export function clearRunProperty(html: string, property: RunProperty): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  let segs = parseCell(div);
  segs = segs.map((seg) => {
    if (!isText(seg)) return seg;
    const style: RunStyle = { ...seg.style };
    if (property === 'color') {
      delete style.color;
      delete style.opacity;
    } else {
      delete style[property as keyof RunStyle];
    }
    return { text: seg.text, style: canonicalStyle(style) };
  });
  segs = coalesce(segs);
  serializeSegments(div, segs);
  return div.innerHTML;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4) Sanitizer (commit sınırı — DOMPurify, sıkı allowlist)
// ─────────────────────────────────────────────────────────────────────────────
function isSafeColor(v: string): boolean {
  const s = v.toLowerCase();
  if (s.includes('url(') || s.includes('expression') || s.includes('/*') || s.includes('\\')) {
    return false;
  }
  return (
    /^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(s) ||
    /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/.test(s)
  );
}

function isSafeFontFamily(v: string): boolean {
  const s = v.toLowerCase();
  if (
    s.includes('url(') ||
    s.includes('expression') ||
    s.includes('/*') ||
    s.includes('\\') ||
    /[(){};]/.test(s)
  ) {
    return false;
  }
  return /^[\w\s,"'-]+$/.test(v);
}

function isSafeDecoration(v: string): boolean {
  const toks = v.toLowerCase().split(/\s+/).filter(Boolean);
  return toks.length > 0 && toks.every((t) => t === 'none' || t === 'underline' || t === 'line-through');
}

/** style attr'ını run-stili allowlist'ine kısar; gerisini düşürür. (Doc düzeltmesi: text-transform
 *  dahil — motor textTransform(case) üretir; atlanırsa commit'te veri kaybı olur.) */
function filterStyle(style: string): string {
  const out: string[] = [];
  for (const decl of style.split(';')) {
    const idx = decl.indexOf(':');
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim().toLowerCase();
    const val = decl.slice(idx + 1).trim();
    const lo = val.toLowerCase();
    if (prop === 'color' && isSafeColor(val)) out.push(`color: ${val}`);
    else if (prop === 'opacity' && /^(?:0|1|0?\.\d+|\d{1,3}%)$/.test(val)) out.push(`opacity: ${val}`);
    else if (prop === 'font-family' && isSafeFontFamily(val)) out.push(`font-family: ${val}`);
    else if (prop === 'font-size' && /^\d{1,3}(?:\.\d+)?px$/.test(lo)) out.push(`font-size: ${val}`);
    else if (prop === 'font-weight' && /^(?:normal|bold|[1-9]00)$/.test(lo)) out.push(`font-weight: ${val}`);
    else if (prop === 'font-style' && /^(?:normal|italic)$/.test(lo)) out.push(`font-style: ${val}`);
    else if (prop === 'text-decoration' && isSafeDecoration(val)) out.push(`text-decoration: ${val}`);
    else if (prop === 'text-transform' && /^(?:none|uppercase|lowercase|capitalize)$/.test(lo))
      out.push(`text-transform: ${val}`);
  }
  return out.join('; ');
}

let hookInstalled = false;
function ensureHook(): void {
  if (hookInstalled) return;
  DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
    if (data.attrName === 'style') {
      const safe = filterStyle(data.attrValue);
      if (safe) data.attrValue = safe;
      else data.keepAttr = false;
    }
  });
  hookInstalled = true;
}

/** Commit sınırı sanitizasyonu: saklanan `cell.text` her zaman allowlist içinde kalır.
 *  u/s etiketleri paste-interop için korunur (motor onları span'e normalize eder). */
export function sanitizeRichText(html: string): string {
  ensureHook();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['span', 'b', 'i', 'u', 's', 'sup', 'br'],
    ALLOWED_ATTR: ['style'],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5) Legacy düz-metin ↔ constrained-HTML köprüsü (innerText→HTML göçü güvenlik ağı)
// ─────────────────────────────────────────────────────────────────────────────
/** String bizim markup'ımızı (span/sup/b/i/u/s/br) VEYA bir HTML entity (&amp; &lt; &#…) içeriyor mu?
 *  Göç sınırı: true → constrained-HTML (innerHTML ile oku); false → legacy düz metin (textContent ile
 *  oku — `<harf` ve `&` literal korunur). Tek-kaynak tespit (render + display-strip ortak).
 *
 *  `sup` ALLOWED_TAGS'te (yukarıda) hep vardı ama BURADA eksikti: `s\b` alternatifi `<sup`'ta sınır
 *  bulamaz ('s'→'u' ikisi de kelime karakteri) → motorun ürettiği STİLSİZ `<sup>` (üst-karakter run'ının
 *  en tipik biçimi) "düz metin" sanılıp textContent ile okunuyor, kullanıcı literal etiket görüyordu. */
export function isRichTextHtml(s: string): boolean {
  return /<(?:span|sup|b|i|u|s|br)\b|&(?:#\d+|[a-z][a-z0-9]*);/i.test(s);
}

/** HTML/legacy adı görsel-düz metne indirger (input/önizleme/alt için). Legacy düz metni
 *  (tag/entity yok) AYNEN döndürür → `Größe <M>` / `Salt & Pepper` bozulmaz. */
export function richTextToPlain(s: string): string {
  if (!s || !isRichTextHtml(s)) return s ?? '';
  const d = document.createElement('div');
  d.innerHTML = s;
  return d.textContent ?? '';
}
