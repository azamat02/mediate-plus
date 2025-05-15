import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Добавляем алиас для lucide-react, чтобы обойти блокировку
      'lucide-react': path.resolve(__dirname, 'node_modules/lucide-react'),
    },
  },
  optimizeDeps: {
    include: ['lucide-react'], // Явно включаем lucide-react в оптимизацию
  },
  build: {
    rollupOptions: {
      output: {
        // Изменяем формат имен файлов, чтобы избежать блокировки
        manualChunks: (id) => {
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
        },
      },
    },
  },
});
