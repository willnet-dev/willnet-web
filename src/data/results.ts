// Cifras de esta misma web para la franja «Resultados medidos» de la portada (ResultsStrip.astro) y Sobre mí.
// Medidas con Lighthouse 13 en la portada de willnet.dev, en celular (Moto G simulado con 4G lenta), 3 pasadas
// el 2026-11-01; se usa la peor de las tres. Volver a medir al publicar cambios grandes y bajar el número si
// hace falta: solo cifras reales. Los textos de cada cifra están en src/i18n/ui.ts (home.resultsLabels).
export const selfResults = [
  { id: "performance", value: 100, unit: "/100" },
  { id: "lcp", value: 1.3, unit: "s" },
  { id: "accessibility", value: 100, unit: "/100" },
  { id: "seo", value: 100, unit: "/100" },
] as const;

export const selfScore = (id: (typeof selfResults)[number]["id"]) => selfResults.find((r) => r.id === id)!.value;
