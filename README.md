# WillNet — web oficial (https://willnet.dev)

Web oficial de WillNet, diseñada y desarrollada por WillNet. **Desde el 2026-10-26 está publicada en willnet.dev**: reemplazó a la landing de `Marca WillNet/04 Web/willnet-landing/`, que queda como respaldo.

- Sitio de varias páginas, **bilingüe** (inglés en `/`, español en `/es/`).
- Escena 3D de la W en el inicio, laptop y teléfono 3D en el portafolio, wireframe que se construye en el proceso y en los casos.
- Tema oscuro por defecto y claro a elección del visitante.

## Comandos (comprobados el 2026-10-25)

Ejecutar dentro de esta carpeta (`willnet-web/`):

```bash
npm install
```

```bash
npm run dev
```

Servidor local en **http://localhost:5500**, con recarga al guardar.

```bash
npm run build
```

Genera la web en `dist/` como **preview**: todas las páginas llevan `noindex` y no hay sitemap.

```bash
npm run build:prod
```

Igual que el anterior, pero para **willnet.dev**: sin `noindex` y con `sitemap-index.xml`. Usarlo solo al publicar en el dominio final.

```bash
npm run preview
```

Sirve `dist/` en http://localhost:5500 para probar la versión compilada.

```bash
npm run images
```

Convierte las capturas de `originales/work/` (.jpg o .png) a `.webp` de 1200 px en `public/img/work/`.

```bash
npm run check
```

Revisa los tipos de TypeScript y Astro.

## Tecnologías y por qué

| Pieza | Para qué |
|---|---|
| **Astro 7** | Genera HTML estático (bueno para SEO y velocidad). Maneja las rutas EN/ES y las transiciones entre páginas (`ClientRouter`). |
| **React 19** (solo en «islas») | Solo donde hay 3D. El resto de la web no carga React. |
| **Three.js + React Three Fiber** | Las escenas 3D. Se cargan aparte, cuando el navegador está libre, para no frenar la primera pantalla. |
| **GSAP + ScrollTrigger** | Parallax, el proceso que se construye y el bloque «Let's work together». |
| **Tailwind CSS 4** | Estilos. Los colores y tipografías son variables en `src/styles/global.css`. |
| **Fontsource** | Fuentes Unbounded, Geist y Geist Mono alojadas en la propia web (sin Google Fonts). |

> Si más adelante quieres aprender algo más avanzado aquí: las escenas 3D son un buen lugar para practicar React (estado, efectos y `lazy`/`Suspense`).

## Dónde cambiar cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Textos de la interfaz (menú, botones, títulos de cada página, formulario) | `src/i18n/ui.ts`. Cada texto está en inglés (`en`) y español (`es`). |
| Precios «desde», plazos y contenido de cada servicio | `src/data/services.ts`. `caseSlug` es el proyecto relacionado de cada servicio y `gallery`, la galería de Branding (lista de proyectos de `src/content/work/`). El precio y el plazo solo se muestran en la página de cada servicio (las listas de Home y Services llevan título y descripción). |
| Preguntas frecuentes | `src/data/faq.ts` (`home: true` = también sale en el inicio). |
| Proyectos del portafolio | `src/content/work/*.json` (un archivo por proyecto). Las capturas van en `originales/work/`; después hay que ejecutar `npm run images`. |
| Teléfono, correos, WhatsApp, redes | `site` al inicio de `src/i18n/ui.ts`. Correos por contexto: `email` (contact@: Contacto, menú, «Let's work together», Privacidad), `infoEmail` y `supportEmail` (pie; support@ también en Mantenimiento). |
| Colores, tipografías, botones | `src/styles/global.css` (tokens en `:root` y `[data-theme="light"]`). Los colores del escenario final (bloque «Let's work together» y pie, en gris carbón) están al final del archivo, en `.stage`. |
| Rutas en español (`/es/servicios`, etc.) | `src/i18n/routes.ts`. |
| Imagen al compartir el enlace | `public/og-en.jpg` y `public/og-es.jpg` (1200×630, captura del hero). Si cambia el hero, hay que volver a capturarlas. |
| Ícono del navegador | `public/favicon.svg`; los PNG (`favicon-32x32.png`, `apple-touch-icon.png`, `icon-512.png`) se generan a partir de él con sharp. |
| Política de privacidad | `src/views/PrivacyView.astro`. |
| **Tu foto** (página Sobre mí) | Guárdala como `public/img/willder.jpg` (vertical 4:5, unos 800×1000 px) y cambia `hasPhoto` a `true` en `src/views/AboutView.astro`. |

## Formulario de presupuesto (Web3Forms)

El formulario envía a Web3Forms con una **clave pública** que no está en el código:

1. El destino es **contact@willnet.dev**. El formulario «WillNet» que ya usa la landing actual entrega a ese correo, así que puedes usar la misma clave (está en la cuenta de Web3Forms; ver `CONTEXTO_WILLNET.md`) o crear otra en web3forms.com.
2. Copia `.env.example` como `.env` y pega la clave en `PUBLIC_WEB3FORMS_KEY=`.
3. Reinicia `npm run dev`.

Sin clave, el formulario muestra el aviso «formulario sin conectar», desactiva el botón de enviar y deja el correo y WhatsApp como alternativa. Solo muestra «enviado» cuando Web3Forms responde que el envío fue correcto.

## Estructura

```
src/
  pages/        rutas (archivos cortos que llaman a una vista con lang="en" o "es")
  views/        cada página completa (Home, Services, Service, Work, Case, About, FAQ, Contact, Privacy)
  components/   cabecera, pie, bloque «Let's work together», proceso, listas, marcos de navegador
  components/three/  escenas 3D (HeroW/HeroScene, DeviceShowcase/DeviceScene, StudioEnv)
  content/work/ proyectos del portafolio (JSON)
  data/         servicios y preguntas frecuentes
  i18n/         textos y rutas en los dos idiomas
  scripts/site.ts  comportamiento común (menú, tema, botones magnéticos, revelados, GSAP, transiciones)
  styles/global.css  tokens de diseño y estilos base
originales/work/  capturas originales (no se publican)
scripts/optimize-images.mjs  conversión a WebP
```

## Publicar

**Producción: https://willnet.dev** (y www) desde el 2026-10-26, en el Worker `willnet-web` (entorno `production` de `wrangler.jsonc`):

```bash
npm run deploy:prod
```

Compila sin `noindex`, con sitemap y `robots.txt` que lo anuncia, y sube la web a willnet.dev. Antes de publicar en producción, prueba el cambio en la vista previa.

La **vista previa** está publicada en **https://v2.willnet.dev** desde el 2026-10-26: un Worker de Cloudflare llamado `willnet-v2` con archivos estáticos (`wrangler.jsonc`), cuenta Willdevgo@gmail.com's Account. Lleva `noindex` en todas las páginas y no tiene sitemap.

```bash
npm run deploy
```

Compila la vista previa y la sube a v2.willnet.dev. Usa la sesión de `wrangler` que ya tiene la Mac (`npx wrangler login` si caduca).

- **Antes de publicar, la clave de Web3Forms tiene que estar disponible:** en `.env` (`PUBLIC_WEB3FORMS_KEY=`, lo crea Willder) o como variable de entorno al ejecutar el comando. Si falta, `scripts/check-form-key.mjs` detiene la publicación, para que el formulario nunca salga desconectado.
- `robots.txt` se genera según el entorno (`src/pages/robots.txt.ts`): en la vista previa no anuncia sitemap y en producción sí.

**Medición:** Cloudflare Web Analytics (configuración automática en willnet.dev) y Google Search Console (propiedad de dominio `willnet.dev`, cuenta will.gomez@willnet.dev, con el sitemap enviado).

**Archivos que dependen de willnet.dev desde fuera** (no borrarlos): `public/assets/email/willnet-firma-correo.png` (logo de la firma de Gmail) y `public/assets/img/og/willnet-og.jpg` (imagen de enlaces compartidos con la landing anterior).

**Volver a la landing anterior (solo si hiciera falta):** `npm run deploy` dentro de `Marca WillNet/04 Web/willnet-landing/` devuelve los dominios al Worker `willdev-landing`.
