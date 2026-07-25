import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { discardStudioSession } from '@/features/studio/lib/projectSerializer';

// Stüdyoya özel yerel anahtarlar (auth token'ları dışında) — paylaşılan bir makinede
// bir pazarın oturumu kapanıp başka biri girdiğinde önceki tasarım/havuz/şablon verisi
// sızmasın diye logout'ta temizlenir. discardStudioSession STUDIO_STORE_NAME'i zaten temizler.
const STALE_LOCAL_KEYS = ['matbaapro-custom-templates', 'matbaapro-user-modules'];

interface User {
  id: string;
  email: string;
  companyName: string | null;
  role?: 'user' | 'admin';
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  // clearLocalDrafts: SADECE kullanıcının kendi isteğiyle (Çıkış Yap butonu) true geçilir.
  // api.ts'nin interceptor'ı refresh token geçersizleşince bunu argümansız çağırır — orada
  // stüdyo taslağını silmek, geçici bir ağ/oturum hatasında kaydedilmemiş tasarımı SESSİZCE
  // yok eder (gerçek fayda yok, sadece veri kaybı riski). Paylaşılan makine koruması yalnız
  // bilinçli çıkışta uygulanır.
  logout: (opts?: { clearLocalDrafts?: boolean }) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      login: (accessToken, refreshToken, user) => set({ accessToken, refreshToken, user }),
      logout: (opts) => {
        set({ accessToken: null, refreshToken: null, user: null });
        if (opts?.clearLocalDrafts) {
          discardStudioSession();
          STALE_LOCAL_KEYS.forEach((key) => localStorage.removeItem(key));
        }
      },
    }),
    {
      name: 'matbaapro-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);
