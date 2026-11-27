# SIMA · Landing page

Landing page de **SIMA por Aduanet**, el sistema web para capturar y gestionar pedimentos aduanales.

Sitio estático construido con [Astro](https://astro.build) y animado con [GSAP](https://gsap.com) (ScrollTrigger y SplitText).

## Requisitos

- Node.js **22.23.4 o superior** (hay un `.nvmrc`: `nvm use`)
- npm 9.6.5 o superior

## Puesta en marcha

```bash
npm install
cp .env.example .env   # y completa las variables (ver más abajo)
npm run dev            # http://localhost:4321
```

## Scripts

| Comando           | Qué hace                                         |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Servidor de desarrollo con recarga en caliente   |
| `npm run build`   | Genera el sitio estático en `dist/`              |
| `npm run preview` | Sirve `dist/` localmente para revisar el build   |

## Variables de entorno

| Variable                  | Descripción                                                                 |
| ------------------------- | --------------------------------------------------------------------------- |
| `PUBLIC_WEB3FORMS_KEY`    | Access Key de [Web3Forms](https://web3forms.com) para el formulario de demo |

El formulario "Solicita una demo" envía los datos por correo mediante Web3Forms.

1. Entra a <https://web3forms.com>, escribe el correo que debe recibir las solicitudes (ventas) y copia la **Access Key** que llega a esa bandeja.
2. Colócala en `.env` como `PUBLIC_WEB3FORMS_KEY`.
3. En producción, define la misma variable **antes del build**: Astro la incrusta al compilar.

La clave es pública por diseño (se ve en el navegador), pero `.env` no se versiona. Si la clave falta o el envío falla, el formulario muestra un aviso con el correo de ventas en lugar de un falso "recibimos tu solicitud".

## Estructura

```
src/
├── layouts/Layout.astro    # <head>, meta, fuentes y carga del script
├── pages/index.astro       # Todo el contenido de la landing (una sola página)
├── scripts/main.js         # Animaciones GSAP, navbar, tema, menú, FAQ y formulario
└── styles/global.css       # Estilos y tokens de diseño (modo claro y oscuro)
public/                     # Archivos estáticos (favicon, imágenes)
```

## Secciones y animaciones

- **Hero:** entrada del título palabra por palabra y mockup del pedimento.
- **Recorrido del mockup:** el mockup queda fijo (pin) y se llena solo con el scroll: captura, validación con un error corregido y un bot de procesos en segundo plano que genera el archivo M.
- **Cómo funciona, Módulos, Aprende, Beneficios (con contadores) y FAQ:** animaciones ligadas al scroll.
- **Navbar:** ancho completo con fondo traslúcido y desenfoque al hacer scroll; entrada escalonada al cargar.
- **Modo claro y oscuro:** botón en el navbar.
- Se respeta `prefers-reduced-motion`: sin animaciones, con todo el contenido visible.

Todo lo animado vive en `src/scripts/main.js`; los tiempos del recorrido del mockup están en el bloque "Recorrido del mockup".

## Despliegue

La salida es 100 % estática (`output: 'static'`): publica el contenido de `dist/` en cualquier hosting estático.

Antes de publicar:

- Define `PUBLIC_WEB3FORMS_KEY` en el entorno de build.
- Define `site` en `astro.config.mjs` con el dominio final (canonical y sitemap).
- Reemplaza el enlace del aviso de privacidad (hoy apunta a `#`).
- Agrega un favicon en `public/` (el navegador pide `/favicon.ico`).
