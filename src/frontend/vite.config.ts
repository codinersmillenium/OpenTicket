import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import environment from 'vite-plugin-environment';
import svgr from "vite-plugin-svgr";

process.env.API_HOST = 'http://localhost:8002'
export default defineConfig({
  base: './',
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
    environment('all', { prefix: 'CANISTER_' }), 
    environment('all', { prefix: 'DFX_' })
  ],
  envDir: '../../',
  define: {
    'process.env': process.env
  },
  optimizeDeps: {
    include: ["react-toastify"],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  resolve: {
    alias: [
      {
        find: 'declarations',
        replacement: fileURLToPath(new URL('../declarations', import.meta.url))
      }
    ]
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true
      }
    },
    host: '127.0.0.1',
    port: 3002
  }
});
