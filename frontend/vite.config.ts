<<<<<<< HEAD
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target:    'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir:        'dist',
    sourcemap:     true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ['react', 'react-dom'],
          charts:   ['recharts'],
          router:   ['react-router-dom'],
        },
      },
    },
=======
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target:       "http://localhost:5000",
        changeOrigin: true,
        secure:       false,
      },
    },
  },

  preview: {
    port: 4173,
    host: true,
  },

  build: {
    outDir:        "dist",
    sourcemap:     true,
    target:        "es2020",
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react":   ["react", "react-dom"],
          "vendor-charts":  ["recharts"],
          "vendor-icons":   ["lucide-react"],
        },
      },
    },
    reportCompressedSize: true,
  },

  optimizeDeps: {
    include: ["react", "react-dom", "recharts", "lucide-react", "axios"],
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
  },
});
