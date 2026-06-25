<<<<<<< HEAD
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
=======
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
<<<<<<< HEAD
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:  ['react','react-dom'],
          charts:  ['recharts'],
          icons:   ['lucide-react'],
        }
      }
    }
  }
})
=======
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
