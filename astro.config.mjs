import { defineConfig } from 'astro/config';

// Salida 100% estática. Define `site` con el dominio final para canonical/sitemap.
export default defineConfig({
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  vite: {
    // Permite ver el preview a través de túneles de ngrok.
    preview: { allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.app', '.ngrok.io'] },
  },
});
