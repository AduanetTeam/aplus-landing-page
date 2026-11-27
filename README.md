# SIMA · Landing page

Landing page de **SIMA por Aduanet**, el sistema web para capturar y gestionar pedimentos aduanales.

Sitio estático construido con [Astro](https://astro.build) y animado con [GSAP](https://gsap.com) (ScrollTrigger y SplitText).

## Requisitos

- Node.js **22.23.4 o superior** (el `.nvmrc` fija Node 24: `nvm use`)
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

## Build y despliegue (GitHub Actions)

El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) hace lo siguiente:

| Evento                    | Qué hace                                                        |
| ------------------------- | --------------------------------------------------------------- |
| Pull request              | Compila el sitio (`npm ci` + `npm run build`) para validar el PR |
| Push a `main`             | Compila y, si el despliegue está activado, publica en Pages     |
| Ejecución manual          | Igual que un push a `main` (pestaña **Actions → Run workflow**) |

La salida es 100 % estática (`output: 'static'`), así que también sirve en cualquier otro hosting estático publicando `dist/`.

### Activar GitHub Pages

El despliegue está **apagado por defecto** para que el CI no falle mientras Pages no esté disponible.

> GitHub Pages en un repositorio **privado** requiere un plan de pago (Team o Enterprise). En el plan Free solo funciona con repositorios públicos.

1. Habilita Pages: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Crea la variable de repositorio `DEPLOY_PAGES` con valor `true`
   (**Settings → Secrets and variables → Actions → Variables**).
3. Crea también la variable `PUBLIC_WEB3FORMS_KEY` con la clave del formulario.
4. Haz un push a `main` (o ejecuta el workflow a mano). El sitio queda en
   `https://aduanetteam.github.io/aplus-landing-page/`.

### Dominio propio

Define las variables de repositorio `SITE_URL` (por ejemplo `https://sima.aduanet.net`) y `BASE_PATH` con valor `/`.
Sin ellas, el workflow usa `https://<organización>.github.io` y `/<repositorio>`.

`astro.config.mjs` lee `SITE_URL` y `BASE_PATH` del entorno; en local no se necesitan y el sitio vive en `/`.

### Pendientes antes de publicar

- Definir `PUBLIC_WEB3FORMS_KEY` en las variables de Actions.
- Reemplazar el enlace del aviso de privacidad (hoy apunta a `#`).
- Agregar un favicon en `public/` (el navegador pide `/favicon.ico`).
