// robots.txt según el estado del sitio: la vista previa permite el rastreo (para que los buscadores vean
// el noindex de cada página) pero no anuncia sitemap; en producción (SITE_ENV=production) sí lo anuncia.
import type { APIRoute } from "astro";

const production = process.env.SITE_ENV === "production";

export const GET: APIRoute = () =>
  new Response(["User-agent: *", "Allow: /", ...(production ? ["", "Sitemap: https://willnet.dev/sitemap-index.xml"] : []), ""].join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
