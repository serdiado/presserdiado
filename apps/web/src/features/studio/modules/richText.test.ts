import { describe, it, expect, afterEach } from 'vitest';
import {
  applyRunColor,
  applyRunStyle,
  readRunStyle,
  sanitizeRichText,
  parseRunColor,
  isRichTextHtml,
  richTextToPlain,
  clearRunProperty,
  MIXED,
} from './richText';

const RED = '#ff0000';
const GREEN = '#00ff00';
const BLUE = '#0000ff';

function makeCell(html: string): HTMLElement {
  const div = document.createElement('div');
  div.setAttribute('contenteditable', 'true');
  div.innerHTML = html;
  document.body.appendChild(div);
  return div;
}

/** Tüm hücre içeriğini kapsayan taze range (her apply sonrası DOM değişir → taze kurulmalı). */
function selectAll(cell: HTMLElement): Range {
  const r = document.createRange();
  r.selectNodeContents(cell);
  return r;
}
/** İlk text node üzerinde [a,b) karakter aralığı. */
function charRange(node: Node, a: number, b: number): Range {
  const r = document.createRange();
  r.setStart(node, a);
  r.setEnd(node, b);
  return r;
}

function colorsOf(el: HTMLElement): (string | null)[] {
  return Array.from(el.querySelectorAll('span')).map((s) => parseRunColor(s)?.color ?? null);
}
function textsOf(el: HTMLElement): string[] {
  return Array.from(el.querySelectorAll('span')).map((s) => s.textContent ?? '');
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('superscript run — apply/read + serialize/parse + sanitize round-trip', () => {
  it('seçime üst-karakter uygular: <sup> üretir, inline boyut/hiza içermez; metin korunur', () => {
    const cell = makeCell('7,99');
    const t = cell.firstChild as Text;
    applyRunStyle(cell, charRange(t, 2, 4), { property: 'superscript', value: true }); // "99"
    expect(cell.textContent).toBe('7,99');
    const sup = cell.querySelector('sup');
    expect(sup?.textContent).toBe('99');
    // Boyut + cap-top ofseti global CSS'te (--sup-scale) → inline stil olmamalı.
    expect(sup?.getAttribute('style')).toBeFalsy();
  });

  it('üst-karakter + başka stil: <sup> üzerine renk yazılır', () => {
    const cell = makeCell('7,99');
    const t = cell.firstChild as Text;
    applyRunStyle(cell, charRange(t, 2, 4), { property: 'superscript', value: true });
    const sup = cell.querySelector('sup') as HTMLElement;
    applyRunStyle(cell, charRange(sup.firstChild!, 0, 2), { property: 'color', value: { color: RED, opacity: 100 } });
    const sup2 = cell.querySelector('sup') as HTMLElement;
    expect(sup2.tagName).toBe('SUP');
    expect(parseRunColor(sup2)?.color).toBe(RED);
  });

  it('read: üst-karakter seçimini true, düz metni false döndürür', () => {
    const cell = makeCell('7,99');
    const t = cell.firstChild as Text;
    applyRunStyle(cell, charRange(t, 2, 4), { property: 'superscript', value: true });
    const sup = cell.querySelector('sup') as HTMLElement;
    expect(readRunStyle(cell, charRange(sup.firstChild!, 0, 2), 'superscript')).toBe(true);
    expect(readRunStyle(cell, charRange(cell.firstChild!, 0, 1), 'superscript')).toBe(false);
  });

  it('sanitize: <sup> etiketi korunur', () => {
    const clean = sanitizeRichText('7,<sup>99</sup>');
    expect(clean).toContain('<sup>');
    expect(clean).toContain('99');
  });

  it('toggle off: üst-karakteri kaldırır (<sup> kalkar, düz metne döner)', () => {
    const cell = makeCell('7,99');
    const t = cell.firstChild as Text;
    applyRunStyle(cell, charRange(t, 2, 4), { property: 'superscript', value: true });
    const sup = cell.querySelector('sup') as HTMLElement;
    applyRunStyle(cell, charRange(sup.firstChild!, 0, 2), { property: 'superscript', value: false });
    expect(cell.querySelector('sup')).toBeNull();
    expect(cell.textContent).toBe('7,99');
  });
});

describe('applyRunColor — span sarma + normalize (flat invariant)', () => {
  it('kısmi-node: tek text node ortasını sarar, metin korunur', () => {
    const cell = makeCell('Merhaba Dünya');
    const t = cell.firstChild as Text;
    const r = document.createRange();
    r.setStart(t, 8); // "Dünya"
    r.setEnd(t, 13);
    applyRunColor(cell, r, RED, 100);

    expect(cell.textContent).toBe('Merhaba Dünya'); // sessiz veri bozulması yok
    const spans = cell.querySelectorAll('span');
    expect(spans.length).toBe(1);
    expect(spans[0].textContent).toBe('Dünya');
    expect(parseRunColor(spans[0])?.color).toBe(RED);
  });

  it('çok-span: iki farklı renkli span üstünden seçim → tek span (iç renkler temizlenir)', () => {
    const cell = makeCell(
      `<span style="color:${RED}">AA</span><span style="color:${GREEN}">BB</span>`,
    );
    const s1 = (cell.children[0] as HTMLElement).firstChild as Text;
    const s2 = (cell.children[1] as HTMLElement).firstChild as Text;
    const r = document.createRange();
    r.setStart(s1, 0);
    r.setEnd(s2, 2);
    applyRunColor(cell, r, BLUE, 100);

    expect(cell.textContent).toBe('AABB');
    const spans = cell.querySelectorAll('span');
    expect(spans.length).toBe(1);
    expect(spans[0].textContent).toBe('AABB');
    expect(parseRunColor(spans[0])?.color).toBe(BLUE);
  });

  it('span içi alt-seçim (re-renklendirme): flat 3 run üretir, nesting yok', () => {
    const cell = makeCell(`<span style="color:${RED}">ABCDE</span>`);
    const t = (cell.querySelector('span') as HTMLElement).firstChild as Text;
    const r = document.createRange();
    r.setStart(t, 2); // "CD"
    r.setEnd(t, 4);
    applyRunColor(cell, r, BLUE, 100);

    expect(cell.textContent).toBe('ABCDE');
    expect(textsOf(cell)).toEqual(['AB', 'CD', 'E']);
    expect(colorsOf(cell)).toEqual([RED, BLUE, RED]);
    // Flat invariant: hiçbir span başka span içermesin.
    cell.querySelectorAll('span').forEach((s) => {
      expect(s.querySelector('span')).toBeNull();
    });
  });

  it('bitişik aynı-renk: yeni run komşu aynı renkle BİRLEŞİR', () => {
    const cell = makeCell(`<span style="color:${RED}">AA</span>BB`);
    const bb = cell.childNodes[1] as Text;
    const r = document.createRange();
    r.setStart(bb, 0);
    r.setEnd(bb, 2);
    applyRunColor(cell, r, RED, 100);

    expect(cell.textContent).toBe('AABB');
    const spans = cell.querySelectorAll('span');
    expect(spans.length).toBe(1);
    expect(spans[0].textContent).toBe('AABB');
    expect(parseRunColor(spans[0])?.color).toBe(RED);
  });

  it('tüm-hücre seçimi: tek full-cell span (özel-case yok — düzeltme A)', () => {
    const cell = makeCell('Hello');
    const r = document.createRange();
    r.selectNodeContents(cell);
    applyRunColor(cell, r, RED, 100);

    expect(cell.textContent).toBe('Hello');
    const spans = cell.querySelectorAll('span');
    expect(spans.length).toBe(1);
    expect(spans[0].textContent).toBe('Hello');
    expect(parseRunColor(spans[0])?.color).toBe(RED);
  });

  it('opacity<100 → rgba (cell-level hexToRgba ile tutarlı), round-trip parse', () => {
    const cell = makeCell('hi');
    const t = cell.firstChild as Text;
    const r = document.createRange();
    r.setStart(t, 0);
    r.setEnd(t, 2);
    applyRunColor(cell, r, RED, 50);

    const span = cell.querySelector('span') as HTMLElement;
    expect(span.getAttribute('style')).toContain('rgba(255, 0, 0, 0.5)');
    expect(parseRunColor(span)).toEqual({ color: RED, opacity: 50 });
  });
});

describe('sanitizeRichText — commit sınırı (düzeltme E / güvenlik)', () => {
  it('kötücül paste strip: <img onerror> ve <script>', () => {
    const out = sanitizeRichText('<img src=x onerror="alert(1)">hi<script>alert(2)</script>');
    expect(out).not.toContain('onerror');
    expect(out).not.toContain('<img');
    expect(out).not.toContain('<script');
    expect(out).toContain('hi');
  });

  it('benign formatlama korunur: b / i / br', () => {
    const out = sanitizeRichText('<b>x</b><i>y</i><br>z');
    expect(out).toContain('<b>');
    expect(out).toContain('<i>');
    expect(out.toLowerCase()).toContain('<br');
    expect(out).toContain('z');
  });

  it('style allowlist: color korunur; url()/background/position düşer', () => {
    const out = sanitizeRichText(
      '<span style="color: #ff0000; background: url(javascript:alert(1)); position: fixed">t</span>',
    );
    expect(out).toContain('color');
    expect(out).not.toContain('url(');
    expect(out).not.toContain('background');
    expect(out).not.toContain('position');
    expect(out).toContain('t');
  });

  it('bizim run span (rgba) sağ kalır', () => {
    const out = sanitizeRichText('<span style="color: rgba(255, 0, 0, 0.5)">t</span>');
    expect(out).toContain('rgba(255, 0, 0, 0.5)');
    expect(out).toContain('t');
  });
});

describe('applyRunStyle — çok-property re-segmentation', () => {
  it('tek-property apply: bold → span font-weight, metin korunur', () => {
    const cell = makeCell('Hello');
    applyRunStyle(cell, selectAll(cell), { property: 'fontWeight', value: '700' });
    expect(cell.textContent).toBe('Hello');
    const spans = cell.querySelectorAll('span');
    expect(spans.length).toBe(1);
    expect(spans[0].style.fontWeight).toBe('700');
  });

  it('üst-üste binen property: color[0,5] + bold[2,8] → flat kompozisyon (span-in-span yok)', () => {
    const cell = makeCell('ABCDEFGHIJ');
    const t = cell.firstChild as Text;
    applyRunStyle(cell, charRange(t, 0, 5), { property: 'color', value: { color: RED, opacity: 100 } });
    // DOM değişti — yeni text düzeni üstünden lineer offsetlerle ikinci property.
    applyRunStyle(cell, selectAll(cell), { property: 'fontWeight', value: '700' });
    // bold tüm hücreye gitti; ama color yalnız ilk 5'te → 2 farklı stil bölgesi.
    expect(cell.textContent).toBe('ABCDEFGHIJ');
    cell.querySelectorAll('span').forEach((s) => expect(s.querySelector('span')).toBeNull());
    // İlk segment color+bold, ikinci yalnız bold.
    const reds = Array.from(cell.querySelectorAll('span')).filter((s) => parseRunColor(s));
    expect(reds.length).toBe(1);
    expect(reds[0].textContent).toBe('ABCDE');
  });

  it('idempotence: aynı property iki kez = bir kez (HTML kararlı)', () => {
    const cell = makeCell('Hello');
    applyRunStyle(cell, selectAll(cell), { property: 'fontWeight', value: '700' });
    const once = cell.innerHTML;
    applyRunStyle(cell, selectAll(cell), { property: 'fontWeight', value: '700' });
    expect(cell.innerHTML).toBe(once);
  });

  it('renk round-trip: opacity başka-property apply sonrası korunur', () => {
    const cell = makeCell('hi');
    const t = cell.firstChild as Text;
    applyRunStyle(cell, charRange(t, 0, 2), { property: 'color', value: { color: RED, opacity: 50 } });
    applyRunStyle(cell, selectAll(cell), { property: 'fontWeight', value: '700' });
    const span = cell.querySelector('span') as HTMLElement;
    expect(parseRunColor(span)).toEqual({ color: RED, opacity: 50 });
    expect(span.style.fontWeight).toBe('700');
  });

  it('decoration kombinasyonu: line-through + underline birlikte; U kapat → S durur', () => {
    const cell = makeCell('Hello');
    applyRunStyle(cell, selectAll(cell), { property: 'lineThrough', value: true });
    applyRunStyle(cell, selectAll(cell), { property: 'underline', value: true });
    expect(readRunStyle(cell, selectAll(cell), 'underline')).toBe(true);
    expect(readRunStyle(cell, selectAll(cell), 'lineThrough')).toBe(true);
    applyRunStyle(cell, selectAll(cell), { property: 'underline', value: false });
    expect(readRunStyle(cell, selectAll(cell), 'underline')).toBe(false);
    expect(readRunStyle(cell, selectAll(cell), 'lineThrough')).toBe(true);
  });

  it('eski etiket parse: <b>/<i>/<u>/<s> ilk apply ile span\'e normalize', () => {
    const cell = makeCell('<b>A</b><i>B</i><u>C</u><s>D</s>');
    applyRunStyle(cell, selectAll(cell), { property: 'color', value: { color: BLUE, opacity: 100 } });
    expect(cell.textContent).toBe('ABCD');
    expect(cell.querySelector('b')).toBeNull();
    expect(cell.querySelector('i')).toBeNull();
    expect(cell.querySelector('u')).toBeNull();
    expect(cell.querySelector('s')).toBeNull();
    expect(readRunStyle(cell, selectAll(cell), 'fontWeight')).toBe(MIXED); // A=700, B/C/D yok
  });

  it('iç-içe eski color span → düzleşir, iç renk kazanır', () => {
    const cell = makeCell(`<span style="color:${RED}"><span style="color:${BLUE}">X</span></span>`);
    applyRunStyle(cell, selectAll(cell), { property: 'fontWeight', value: '700' });
    expect(cell.querySelector('span span')).toBeNull(); // flat
    const span = cell.querySelector('span') as HTMLElement;
    expect(parseRunColor(span)?.color).toBe(BLUE);
  });

  it('<br> korunur; çevresindeki offset doğru', () => {
    const cell = makeCell('AA<br>BB');
    const bb = cell.childNodes[2] as Text; // "BB"
    applyRunStyle(cell, charRange(bb, 0, 2), { property: 'color', value: { color: RED, opacity: 100 } });
    expect(cell.querySelectorAll('br').length).toBe(1);
    expect(cell.textContent).toBe('AABB');
    const reds = Array.from(cell.querySelectorAll('span')).filter((s) => parseRunColor(s));
    expect(reds.length).toBe(1);
    expect(reds[0].textContent).toBe('BB');
  });

  it('collapsed range → no-op; boş hücre → no-op', () => {
    const cell = makeCell('Hello');
    const t = cell.firstChild as Text;
    const before = cell.innerHTML;
    applyRunStyle(cell, charRange(t, 2, 2), { property: 'fontWeight', value: '700' });
    expect(cell.innerHTML).toBe(before);

    const empty = makeCell('');
    applyRunStyle(empty, selectAll(empty), { property: 'fontWeight', value: '700' });
    expect(empty.innerHTML).toBe('');
  });

  it('whitespace verbatim round-trip (çoklu boşluk + &nbsp;)', () => {
    const cell = makeCell('a  b&nbsp;c'); // "a  b c"
    const t = cell.firstChild as Text;
    expect(t.nodeValue).toBe('a  b c');
    applyRunStyle(cell, charRange(t, 3, 4), { property: 'color', value: { color: RED, opacity: 100 } });
    expect(cell.textContent).toBe('a  b c'); // boşluklar + nbsp birebir
  });

  it('her property apply + read-back', () => {
    const cases: { property: Parameters<typeof applyRunStyle>[2]['property']; value: any; read: any }[] = [
      { property: 'fontFamily', value: 'Roboto', read: 'Roboto' },
      { property: 'fontSize', value: 24, read: 24 },
      { property: 'fontWeight', value: '500', read: '500' },
      { property: 'italic', value: true, read: true },
      { property: 'textTransform', value: 'uppercase', read: 'uppercase' },
    ];
    for (const c of cases) {
      const cell = makeCell('word');
      applyRunStyle(cell, selectAll(cell), { property: c.property, value: c.value });
      expect(readRunStyle(cell, selectAll(cell), c.property)).toEqual(c.read);
    }
  });
});

describe('readRunStyle — karışık seçim', () => {
  it('uniform → değer; karışık → MIXED; yok → undefined', () => {
    const uniform = makeCell(`<span style="font-weight:700">AABB</span>`);
    expect(readRunStyle(uniform, selectAll(uniform), 'fontWeight')).toBe('700');

    const mixed = makeCell(`<span style="font-weight:700">AA</span>BB`);
    expect(readRunStyle(mixed, selectAll(mixed), 'fontWeight')).toBe(MIXED);

    const none = makeCell('plain');
    expect(readRunStyle(none, selectAll(none), 'fontWeight')).toBeUndefined();
  });
});

describe('sanitizeRichText — genişletilmiş allowlist', () => {
  it('font-* + text-decoration + text-transform korunur', () => {
    const out = sanitizeRichText(
      '<span style="font-family: Inter, sans-serif; font-size: 14px; font-weight: 700; font-style: italic; text-decoration: underline; text-transform: uppercase">t</span>',
    );
    expect(out).toContain('font-family');
    expect(out).toContain('14px');
    expect(out).toContain('font-weight');
    expect(out).toContain('italic');
    expect(out).toContain('underline');
    expect(out).toContain('uppercase');
  });

  it('u / s etiketleri korunur', () => {
    const out = sanitizeRichText('<u>a</u><s>b</s>');
    expect(out.toLowerCase()).toContain('<u>');
    expect(out.toLowerCase()).toContain('<s>');
  });

  it('tehlikeli/geçersiz değer düşer: font-family url(), px-dışı font-size', () => {
    const fam = sanitizeRichText('<span style="font-family: url(javascript:alert(1))">t</span>');
    expect(fam).not.toContain('url(');
    const sz = sanitizeRichText('<span style="font-size: 14pt">t</span>');
    expect(sz).not.toContain('14pt');
  });
});

describe('isRichTextHtml / richTextToPlain — innerText→HTML göç güvenlik ağı', () => {
  it('our-markup ve entity → HTML; legacy düz metin → değil', () => {
    expect(isRichTextHtml('<span style="color:#f00">x</span>')).toBe(true);
    expect(isRichTextHtml('<b>x</b>')).toBe(true);
    expect(isRichTextHtml('Salt &amp; Pepper')).toBe(true); // migrated entity
    expect(isRichTextHtml('Salt & Pepper')).toBe(false); // legacy literal &
    expect(isRichTextHtml('Größe <M>')).toBe(false); // <M> bizim tag değil → legacy
    expect(isRichTextHtml('<Özel')).toBe(false);
    expect(isRichTextHtml('Düz Ad')).toBe(false);
  });

  // Motor üst-karakteri STİLSİZ <sup> olarak yazar (styleToCss sup'a boyut yazmaz) → dedektör
  // 'sup'u tanımazsa fiyat/ad "düz metin" sanılıp textContent ile okunur ve kullanıcı literal
  // etiket görür. Fiyatın run-level göçünün ön koşulu.
  it('stilsiz <sup> HTML sayılır (üst-karakter run’ının tipik biçimi)', () => {
    expect(isRichTextHtml('12,<sup>99</sup>')).toBe(true);
    expect(isRichTextHtml('<sup>99</sup>')).toBe(true);
    expect(isRichTextHtml('Ürün<sup>2</sup>')).toBe(true);
    // legacy koruması bozulmamalı — <sup ile başlamayan '<s...' hâlâ düz metin
    expect(isRichTextHtml('Größe <M>')).toBe(false);
    expect(isRichTextHtml('Salt & Pepper')).toBe(false);
  });

  it('richTextToPlain: HTML strip; legacy < ve & AYNEN korunur', () => {
    expect(richTextToPlain('<span style="font-weight:700">Kalın Ad</span>')).toBe('Kalın Ad');
    expect(richTextToPlain('12,<sup>99</sup>')).toBe('12,99'); // sup strip → düz fiyat
    expect(richTextToPlain('Salt &amp; Pepper')).toBe('Salt & Pepper'); // entity decode
    expect(richTextToPlain('Größe <M>')).toBe('Größe <M>'); // legacy: bozulmaz
    expect(richTextToPlain('Salt & Pepper')).toBe('Salt & Pepper');
    expect(richTextToPlain('')).toBe('');
  });
});

describe('clearRunProperty — cell-level property-scoped temizleme (Faz 4.1)', () => {
  it('color sil: tüm run renkleri kalkar; diğer property (weight) korunur', () => {
    const out = clearRunProperty(
      `<span style="color:${RED};font-weight:700">A</span><span style="color:${BLUE}">B</span>`,
      'color',
    );
    const cell = makeCell(out);
    expect(cell.textContent).toBe('AB');
    cell.querySelectorAll('span').forEach((s) => expect(parseRunColor(s)).toBeNull()); // renk yok
    expect(readRunStyle(cell, selectAll(cell), 'fontWeight')).toBe(MIXED); // A=700 korundu, B=yok
  });

  it('color sil: rgba opacity de temizlenir', () => {
    const cell = makeCell(clearRunProperty(`<span style="color: rgba(255,0,0,0.5)">x</span>`, 'color'));
    expect(cell.textContent).toBe('x');
    expect(parseRunColor(cell.querySelector('span') ?? cell)).toBeNull();
  });

  it('underline sil → line-through KORUNUR (ortogonal)', () => {
    const cell = makeCell(clearRunProperty(`<u><s>x</s></u>`, 'underline'));
    expect(readRunStyle(cell, selectAll(cell), 'underline')).toBe(false);
    expect(readRunStyle(cell, selectAll(cell), 'lineThrough')).toBe(true);
  });

  it('plain text → no-op', () => {
    expect(clearRunProperty('Merhaba Dünya', 'color')).toBe('Merhaba Dünya');
  });

  it('strip sonrası eşitlenen komşular coalesce (stilsiz → çıplak text)', () => {
    const cell = makeCell(
      clearRunProperty(`<span style="color:${RED}">AA</span><span style="color:${BLUE}">BB</span>`, 'color'),
    );
    expect(cell.querySelectorAll('span').length).toBe(0);
    expect(cell.textContent).toBe('AABB');
  });
});
