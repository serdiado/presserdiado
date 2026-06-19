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

  it('italic cell dalı: run-only → read undefined, apply no-op patch', () => {
    const ctx: TextSettingCtx = {
      surface: 'module',
      slotId: 's',
      cellId: 'c',
      font: { ...defaultTypography },
    };
    expect(get('italic').read(ctx)).toBeUndefined();
    expect(get('italic').apply(ctx, true)).toEqual({});
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

  it('her çekirdek giriş runCapable + benzersiz id', () => {
    const ids = textSettingsRegistry.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(textSettingsRegistry.every((d) => d.runCapable)).toBe(true);
  });
});
