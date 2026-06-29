import { describe, it, expect, afterEach } from 'vitest';
import { textSettingsRegistry, textSettingById } from './registry';
import type { TextSettingCtx } from './types';
import { MIXED, parseRunColor } from '../modules/richText';
import { defaultTypography } from '@matbaapro/shared';

function makeCell(html: string): HTMLElement {
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
  return div;
}
function selectAll(cell: HTMLElement): Range {
  const r = document.createRange();
  r.selectNodeContents(cell);
  return r;
}
function get(id: string) {
  const def = textSettingById[id];
  if (!def) throw new Error(`registry girişi yok: ${id}`);
  return def;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('registry — apply dallanması (run vs cell)', () => {
  it('run dalı: range+cellEl → motor çağrılır, Range döner, DOM değişir', () => {
    const cell = makeCell('Hello');
    const ctx: TextSettingCtx = {
      surface: 'module',
      slotId: 's',
      cellId: 'c',
      cellEl: cell,
      range: selectAll(cell),
    };
    const res = get('fontWeight').apply(ctx, '700');
    expect(res instanceof Range).toBe(true);
    expect((cell.querySelector('span') as HTMLElement).style.fontWeight).toBe('700');
  });

  it('cell dalı: range yok → typography patch döner, DOM değişmez', () => {
    const ctx: TextSettingCtx = {
      surface: 'module',
      slotId: 's',
      cellId: 'c',
      font: { ...defaultTypography },
    };
    expect(get('fontWeight').apply(ctx, '700')).toEqual({ fontWeight: '700' });
    expect(get('color').apply(ctx, { color: '#123456', opacity: 80 })).toEqual({
      color: '#123456',
      opacity: 80,
    });
  });

  it('cell dalı collapsed range → yine cell (motor değil)', () => {
    const cell = makeCell('Hello');
    const r = document.createRange();
    const t = cell.firstChild as Text;
    r.setStart(t, 1);
    r.setEnd(t, 1);
    const ctx: TextSettingCtx = {
      surface: 'module',
      slotId: 's',
      cellId: 'c',
      cellEl: cell,
      range: r,
      font: { ...defaultTypography },
    };
    const res = get('fontSize').apply(ctx, 18);
    expect(res).toEqual({ fontSize: 18 });
    expect(cell.querySelector('span')).toBeNull();
  });
});

describe('registry — decoration cell köprüsü + italic run-only', () => {
  it('underline cell: read = textDecoration enum; apply = textDecoration patch', () => {
    const onCtx: TextSettingCtx = {
      surface: 'module',
      slotId: 's',
      cellId: 'c',
      font: { ...defaultTypography, textDecoration: 'underline' },
    };
    expect(get('underline').read(onCtx)).toBe(true);
    expect(get('lineThrough').read(onCtx)).toBe(false);
    expect(get('underline').apply(onCtx, false)).toEqual({ textDecoration: 'none' });
    expect(get('lineThrough').apply(onCtx, true)).toEqual({ textDecoration: 'line-through' });
  });

  it('italic cell dalı: cell-capable (Faz 4.1) → read font.fontStyle, apply {fontStyle}', () => {
    const ctx: TextSettingCtx = {
      surface: 'module',
      slotId: 's',
      cellId: 'c',
      font: { ...defaultTypography },
    };
    expect(get('italic').read(ctx)).toBe(false); // fontStyle yok → 'normal' → false
    expect(get('italic').apply(ctx, true)).toEqual({ fontStyle: 'italic' });
  });

  it('underline run dalı: motor (cell köprüsü değil)', () => {
    const cell = makeCell('Hi');
    const ctx: TextSettingCtx = {
      surface: 'module',
      slotId: 's',
      cellId: 'c',
      cellEl: cell,
      range: selectAll(cell),
    };
    const res = get('underline').apply(ctx, true);
    expect(res instanceof Range).toBe(true);
    expect((cell.querySelector('span') as HTMLElement).style.textDecoration).toContain('underline');
  });
});

describe('registry — read yansıması', () => {
  it('run karışık seçim → MIXED', () => {
    const cell = makeCell(`<span style="color:#ff0000">AA</span>BB`);
    const ctx: TextSettingCtx = {
      surface: 'module',
      slotId: 's',
      cellId: 'c',
      cellEl: cell,
      range: selectAll(cell),
    };
    expect(get('color').read(ctx)).toBe(MIXED);
  });

  it('cell read: font değerini yansıtır', () => {
    const ctx: TextSettingCtx = {
      surface: 'module',
      slotId: 's',
      cellId: 'c',
      font: { ...defaultTypography, fontFamily: 'Roboto', fontSize: 22 },
    };
    expect(get('fontFamily').read(ctx)).toBe('Roboto');
    expect(get('fontSize').read(ctx)).toBe(22);
  });

  it('benzersiz id; run-capable alt küme + cell-only girişler', () => {
    const ids = textSettingsRegistry.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    const runIds = textSettingsRegistry.filter((d) => d.runCapable).map((d) => d.id).sort();
    expect(runIds).toEqual(
      ['color', 'fontFamily', 'fontSize', 'fontWeight', 'italic', 'lineThrough', 'superscript', 'textTransform', 'underline'],
    );
    const cellIds = textSettingsRegistry.filter((d) => !d.runCapable).map((d) => d.id).sort();
    expect(cellIds).toEqual(['decimalOffset', 'decimalScale', 'letterSpacing', 'lineHeight', 'textAlign', 'verticalAlign']);
  });

  it('cell-only giriş (Faz 4): apply→typography patch, read→cell font değeri', () => {
    const font = { ...defaultTypography, lineHeight: 1.8, textAlign: 'right' as const };
    const ctx: TextSettingCtx = { surface: 'product', slotId: 's', cellId: 'c', font };
    expect(get('lineHeight').apply(ctx, 2.0)).toEqual({ lineHeight: 2.0 });
    expect(get('lineHeight').read(ctx)).toBe(1.8);
    expect(get('textAlign').apply(ctx, 'center')).toEqual({ textAlign: 'center' });
    expect(get('textAlign').read(ctx)).toBe('right');
    expect(get('decimalScale').apply(ctx, 120)).toEqual({ decimalScale: 120 });
  });

  it('italic cell-capable (Faz 4.1): apply→fontStyle, read→font.fontStyle', () => {
    const onCtx: TextSettingCtx = {
      surface: 'product',
      slotId: 's',
      cellId: 'c',
      font: { ...defaultTypography, fontStyle: 'italic' },
    };
    expect(get('italic').read(onCtx)).toBe(true);
    expect(get('italic').apply(onCtx, false)).toEqual({ fontStyle: 'normal' });
    expect(get('italic').apply(onCtx, true)).toEqual({ fontStyle: 'italic' });
    const offCtx: TextSettingCtx = { surface: 'product', slotId: 's', cellId: 'c', font: { ...defaultTypography } };
    expect(get('italic').read(offCtx)).toBe(false);
  });
});
