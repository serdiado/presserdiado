// LocalStorage destekli kullanıcı modülü kalıcılığı.
// Kullanıcı bir Banner/Pizza modülünü adlandırarak kaydeder; Modül sekmesinde
// "Kullanıcı modülleri" altında listelenir, sürükle-bırak ile yerleştirilir.

import type { AnyModuleData } from './types';

export interface UserModule {
  id: string;
  name: string;
  type: 'banner' | 'pizza';
  data: AnyModuleData;
  createdAt: string;
}

const KEY = 'matbaapro-user-modules';
const EVENT = 'matbaapro_user_modules_updated';

export function listUserModules(): UserModule[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveUserModule(name: string, data: AnyModuleData): UserModule {
  const id = `um-${Date.now().toString(36)}`;
  const entry: UserModule = {
    id,
    name: name.trim(),
    type: data.type,
    data: JSON.parse(JSON.stringify(data)),
    createdAt: new Date().toISOString(),
  };
  const list = [entry, ...listUserModules()].slice(0, 50);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
  return entry;
}

export function deleteUserModule(id: string): void {
  const list = listUserModules().filter((m) => m.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export const USER_MODULES_EVENT = EVENT;
