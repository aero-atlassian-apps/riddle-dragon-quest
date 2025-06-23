import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // Disable native Rollup binaries to fix Vercel deployment issue
      // See: https://github.com/npm/cli/issues/4828
      context: 'globalThis',
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Large UI component libraries
          'radix-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-toast',
            '@radix-ui/react-slot',
            '@radix-ui/react-select',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
            '@radix-ui/react-tabs'
          ],
          // Heavy utility libraries
          'heavy-vendor': [
            'recharts',
            'jspdf',
            'canvas-confetti',
            '@tanstack/react-query'
          ],
          // Supabase and auth
          'supabase-vendor': ['@supabase/supabase-js'],
          // Form and validation libraries
          'form-vendor': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          // Utility libraries
          'utils-vendor': [
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'lucide-react',
            'date-fns',
            'zustand'
          ]
        }
      }
    },
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));