import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // All API requests now go to the integrated Flask backend
      '/api': {
        target: 'http://localhost:5090',
        changeOrigin: true,
        secure: false,
      },
      // Legacy routes for backward compatibility
      '/upload': {
        target: 'http://localhost:5090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/upload/, '/api/upload'),
      },
      '/images': {
        target: 'http://localhost:5090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/images/, '/api/images'),
      },
      '/addListing': {
        target: 'http://localhost:5090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/addListing/, '/api/addListing'),
      },
      '/askIt': {
        target: 'http://localhost:5090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/askIt/, '/api/askIt'),
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
