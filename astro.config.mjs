// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// SITE_ENV=production solo al publicar en willnet.dev. Cualquier otro valor (local o v2.willnet.dev)
// se trata como preview: noindex en todas las páginas y sin sitemap.
const isProduction = process.env.SITE_ENV === "production";

export default defineConfig({
  site: "https://willnet.dev",
  trailingSlash: "never",
  // Astro 7 compacta el HTML al estilo JSX y se come los espacios entre etiquetas («I buildonline»).
  // true vuelve a la compresión HTML de siempre, que conserva un espacio entre elementos en línea.
  compressHTML: true,
  // inlineStylesheets: el CSS va dentro del HTML y no bloquea el primer pintado
  build: { format: "file", inlineStylesheets: "always" },
  integrations: [react(), ...(isProduction ? [sitemap()] : [])],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: { include: ["three", "@react-three/fiber", "react", "react-dom", "react-dom/client", "gsap", "gsap/ScrollTrigger"] },
    define: { "import.meta.env.SITE_IS_PRODUCTION": JSON.stringify(isProduction) },
  },
  server: { port: 5500 },
  devToolbar: { enabled: false },
});
