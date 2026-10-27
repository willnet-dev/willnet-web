// Rutas de la web en los dos idiomas. El inglés va en la raíz y el español bajo /es/.
// Para agregar una página: añade su clave aquí y crea los dos archivos en src/pages/.
export type Lang = "en" | "es";

export const routes = {
  home: { en: "/", es: "/es" },
  services: { en: "/services", es: "/es/servicios" },
  work: { en: "/work", es: "/es/trabajo" },
  about: { en: "/about", es: "/es/sobre-mi" },
  faq: { en: "/faq", es: "/es/preguntas-frecuentes" },
  contact: { en: "/contact", es: "/es/contacto" },
  privacy: { en: "/privacy", es: "/es/privacidad" },
} as const;

export type RouteKey = keyof typeof routes;

// Slugs de los servicios en cada idioma (la clave interna es la inglesa)
export const serviceSlugs = {
  "landing-pages": { en: "landing-pages", es: "landing-pages" },
  websites: { en: "websites", es: "sitios-web" },
  "online-stores": { en: "online-stores", es: "tiendas-en-linea" },
  branding: { en: "branding", es: "branding" },
  "website-fixes": { en: "website-fixes", es: "arreglos-web" },
  maintenance: { en: "maintenance", es: "mantenimiento" },
} as const;

export type ServiceKey = keyof typeof serviceSlugs;

export const r = (key: RouteKey, lang: Lang) => routes[key][lang];

export const servicePath = (key: ServiceKey, lang: Lang) => `${routes.services[lang]}/${serviceSlugs[key][lang]}`;

export const workPath = (slug: string, lang: Lang) => `${routes.work[lang]}/${slug}`;

/** Devuelve la ruta equivalente en el otro idioma (para el selector EN/ES y hreflang). */
export function altPath(path: string, to: Lang): string {
  const clean = path.replace(/\/$/, "") || "/";
  const from: Lang = clean === "/es" || clean.startsWith("/es/") ? "es" : "en";
  if (from === to) return clean;

  for (const key of Object.keys(routes) as RouteKey[]) {
    if (routes[key][from] === clean) return routes[key][to];
  }
  for (const key of Object.keys(serviceSlugs) as ServiceKey[]) {
    if (servicePath(key, from) === clean) return servicePath(key, to);
  }
  const workBase = routes.work[from] + "/";
  if (clean.startsWith(workBase)) return workPath(clean.slice(workBase.length), to);

  return routes.home[to];
}

export const langFromPath = (path: string): Lang => (path === "/es" || path.startsWith("/es/") ? "es" : "en");
