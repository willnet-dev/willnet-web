// Cifras de la franja «Resultados medidos» de la portada (ResultsStrip.astro). Cada una sale de las
// «metrics» de un caso (src/content/work/<caso>.json) y enlaza a él: para cambiarla, cambia el caso o el id.
export const homeResults = [
  { work: "aeterna", metric: "images" },
  { work: "aeterna", metric: "fonts" },
  { work: "aeterna", metric: "links" },
];

// Puntuación de Lighthouse (móvil) de esta misma web en accesibilidad y SEO. Comprobarla al publicar:
// si alguna página baja de 100, corregirla o cambiar este número (2026-11-01: 100 en las páginas medidas)
export const selfScore = 100;
