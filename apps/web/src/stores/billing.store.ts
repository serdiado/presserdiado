import { create } from 'zustand';
import api from '@/lib/api';
import type {
  BillingProfile,
  CreateBillingProfileInput,
  UpdateBillingProfileInput,
} from '@/features/settings/types';

interface BillingState {
  profiles: BillingProfile[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchProfiles: () => Promise<void>;
  createProfile: (data: CreateBillingProfileInput) => Promise<BillingProfile>;
  updateProfile: (id: string, data: UpdateBillingProfileInput) => Promise<BillingProfile>;
  deleteProfile: (id: string) => Promise<void>;
  setDefaultProfile: (id: string) => Promise<BillingProfile>;
}

const sortProfiles = (profiles: BillingProfile[]) =>
  [...profiles].sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    return (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '');
  });

export const useBillingStore = create<BillingState>((set, get) => ({
  profiles: [],
  loading: false,
  saving: false,
  error: null,

  fetchProfiles: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<BillingProfile[]>('/billing-profiles');
      set({ profiles: sortProfiles(response.data ?? []) });
    } catch (error) {
      console.error('Fatura profilleri yüklenemedi:', error);
      set({ error: 'Fatura profilleri yüklenemedi' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createProfile: async (data) => {
    set({ saving: true, error: null });
    try {
      const response = await api.post<BillingProfile>('/billing-profiles', data);
      set((state) => ({ profiles: sortProfiles([...state.profiles, response.data]) }));
      return response.data;
    } catch (error) {
      console.error('Fatura profili oluşturulamadı:', error);
      set({ error: 'Fatura profili oluşturulamadı' });
      throw error;
    } finally {
      set({ saving: false });
    }
  },

  updateProfile: async (id, data) => {
    set({ saving: true, error: null });
    try {
      const response = await api.patch<BillingProfile>(`/billing-profiles/${id}`, data);
      set((state) => ({
        profiles: sortProfiles(
          state.profiles.map((profile) => (profile.id === id ? response.data : profile)),
        ),
      }));
      return response.data;
    } catch (error) {
      console.error('Fatura profili güncellenemedi:', error);
      set({ error: 'Fatura profili güncellenemedi' });
      throw error;
    } finally {
      set({ saving: false });
    }
  },

  deleteProfile: async (id) => {
    set({ saving: true, error: null });
    try {
      await api.delete(`/billing-profiles/${id}`);
      set((state) => ({ profiles: state.profiles.filter((profile) => profile.id !== id) }));
    } catch (error) {
      console.error('Fatura profili silinemedi:', error);
      set({ error: 'Fatura profili silinemedi' });
      throw error;
    } finally {
      set({ saving: false });
    }
  },

  setDefaultProfile: async (id) => {
    return get().updateProfile(id, { isDefault: true });
  },
}));