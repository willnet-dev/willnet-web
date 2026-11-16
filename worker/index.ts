// Worker de willnet.dev (2026-11-16). Hasta ahora Cloudflare servía los archivos de dist/ sin código propio;
// este Worker solo existe para la cuenta regresiva del lanzamiento oficial (pedido de Willder).
//
// Mientras COUNTDOWN_UNTIL (wrangler.jsonc, solo en producción) esté en el futuro, cualquier página HTML
// responde con la cuenta regresiva (src/pages/cuenta-regresiva.astro) y el código 503 + Retry-After:
// así Google entiende «cerrado un momento» y no cambia las páginas que ya tiene por la cuenta regresiva.
// Imágenes, fuentes, CSS, robots.txt, el sitemap y la imagen de la firma de Gmail siguen servidos normal.
// A la hora del lanzamiento todo vuelve a la web normal, sin publicar nada. La vista previa (v2) no tiene
// COUNTDOWN_UNTIL, así que siempre muestra la web.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  COUNTDOWN_UNTIL?: string;
}

const COUNTDOWN_PAGE = "/cuenta-regresiva";

// Una página es una ruta sin extensión (/, /es, /contact) o un .html
function isPage(pathname: string) {
  const last = pathname.split("/").pop() ?? "";
  return !last.includes(".") || last.endsWith(".html");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const until = env.COUNTDOWN_UNTIL ? Date.parse(env.COUNTDOWN_UNTIL) : NaN;
    const left = until - Date.now();
    const url = new URL(request.url);
    const isRead = request.method === "GET" || request.method === "HEAD";

    if (!(left > 0) || !isRead || !isPage(url.pathname)) return env.ASSETS.fetch(request);

    const page = await env.ASSETS.fetch(new Request(new URL(COUNTDOWN_PAGE, url), { method: request.method }));
    const headers = new Headers(page.headers);
    headers.set("Retry-After", String(Math.ceil(left / 1000)));
    headers.set("Cache-Control", "no-store");
    return new Response(page.body, { status: 503, headers });
  },
};
