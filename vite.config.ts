import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Code splitting for better caching and smaller initial load
    rollupOptions: {
      output: {
        manualChunks: {
          // React and routing libraries
          'react-vendor': ['react', 'react-dom', 'react-router'],
          // UI component libraries
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
          ],
          // Chart and data visualization
          'chart-vendor': ['recharts'],
          // Form and utility libraries
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge'],
          // Supabase client
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    // Minification settings
    minify: 'esbuild', // esbuild is faster than terser for most cases
    // Smaller chunk size limit warning
    chunkSizeWarningLimit: 1000, // 1000 KB
    // Source maps for debugging (disabled in production for smaller builds)
    sourcemap: false,
    // Target modern browsers for smaller output
    target: 'es2015',
    // CSS code splitting
    cssCodeSplit: true,
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      '@supabase/supabase-js',
    ],
  },
})