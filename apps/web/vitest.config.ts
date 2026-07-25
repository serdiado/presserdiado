import { defineConfig } from 'vitest/config';
import path from 'path';

// Run-level rich-text saf fonksiyonlarını (richText.ts) headless doğrulamak için minimal kurulum.
// Uygulama vite.config'ini (react/tailwind) yüklemeden, yalnız jsdom DOM'u gerektirir.
// '@' alias'ı vite.config.ts ile birebir — testlerin import grafiği '@/...' kullanan koda
// dokunursa (ör. store → modules) çözümleme burada da çalışsın diye ayrıca tanımlanır.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
