import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json' with { type: 'json' }

// En GitHub Pages la app vive en /homelab-quest/, en local en la raíz.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/homelab-quest/' : '/',
  plugins: [react(), tailwindcss()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  // El contenido de las lecciones viaja en el bundle; ~200 KB gzip es aceptable aquí.
  build: { chunkSizeWarningLimit: 700 },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
}))
