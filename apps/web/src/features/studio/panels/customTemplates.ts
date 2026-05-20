// LocalStorage destekli özel şablon kalıcılığı.

import type { BrochureTemplate } from '@matbaapro/shared';

const KEY = 'matbaapro-custom-templates';

export function listCustomTemplates(): BrochureTemplate[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveCustomTemplate(tpl: BrochureTemplate): void {
  const list = listCustomTemplates().filter((t) => t.id !== tpl.id);
  list.unshift(tpl);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('matbaapro_custom_templates_updated'));
}

export function deleteCustomTemplate(id: string): void {
  const list = listCustomTemplates().filter((t) => t.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('matbaapro_custom_templates_updated'));
}
