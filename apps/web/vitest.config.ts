import { defineConfig } from 'vitest/config';

// Run-level rich-text saf fonksiyonlarını (richText.ts) headless doğrulamak için minimal kurulum.
// Uygulama vite.config'ini (react/tailwind) yüklemeden, yalnız jsdom DOM'u gerektirir.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
