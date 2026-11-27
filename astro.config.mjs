import { defineConfig } from 'astro/config';

// Salida 100% estática.
// `site` y `base` salen del entorno para no atar el código a un dominio:
//   - Local: sin variables → el sitio vive en "/".
//   - GitHub Pages: el workflow (.github/workflows/deploy.yml) los define con la URL real
//     (p. ej. SITE_URL=https://aduanetteam.github.io, BASE_PATH=/aplus-landing-page).
//   - Dominio propio: SITE_URL=https://tu-dominio.com y BASE_PATH=/ (o vacío).
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || undefined,
  base: process.env.BASE_PATH || '/',
  build: { inlineStylesheets: 'auto' },
  vite: {
    // Permite ver el preview a través de túneles de ngrok.
    preview: { allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.app', '.ngrok.io'] },
  },
});
