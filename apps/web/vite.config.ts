/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const convexUrl = env.VITE_CONVEX_URL || env.CONVEX_URL || '';

  return {
    plugins: [react()],
    define: {
      __HAYL_CONVEX_URL__: JSON.stringify(convexUrl),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            convex: ["convex/react", "convex/browser"],
            storage: ["dexie", "dexie-react-hooks"],
            motion_icons: ["framer-motion", "lucide-react"],
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
    },
  };
});
