import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Pro-schemu/',
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

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Improved server configuration
  server: {
    hmr: {
      overlay: false, // Disable error overlay for cleaner development
      protocol: 'ws',
      timeout: 5000,
    },
    port: 5173,
    strictPort: false,
    open: false,
    // Allow iframe embedding
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },

  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      'sonner',
      'jspdf',
      'html2canvas',
      'qrcode',
    ],
    // Force re-optimization on every start in development
    force: false,
  },

  // Optimize build
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // Simplified chunking for better compatibility with Figma Make deployment
        manualChunks: undefined,
        inlineDynamicImports: true, // Inline all dynamic imports to avoid fetch errors
      },
    },
    chunkSizeWarningLimit: 2000,
  },
})
