// Colección de proyectos del portafolio: un archivo JSON por proyecto en src/content/work/.
// Para agregar un proyecto, copia uno parecido, cambia los textos, pon sus capturas (.jpg) en
// originales/work/ y ejecuta `npm run images` para crear las versiones .webp que usa la web.
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const copy = z.object({
  title: z.string(),
  type: z.string(),
  summary: z.string(),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  result: z.string().optional(),
});

// Cifra medida en un proyecto: antes y después, o solo después (p. ej. 0 enlaces rotos). La usan la
// página del caso y la página del servicio relacionado. Solo cifras medidas de verdad
const metric = z.object({
  id: z.string(),
  before: z.number().optional(),
  after: z.number(),
  // Unidad que va pequeña junto al número («/100» en las puntuaciones de Lighthouse)
  unit: z.string().optional(),
  en: z.string(),
  es: z.string(),
});

const work = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/work" }),
  schema: z.object({
    order: z.number(),
    category: z.enum(["web", "events", "design", "learning"]),
    featured: z.boolean(),
    hasCase: z.boolean(),
    year: z.number(),
    withDopicos: z.boolean().default(false),
    // «fix»: arreglo de una web que ya existía (no se parte de un wireframe); cambia el rótulo del caso
    kind: z.enum(["build", "fix"]).default("build"),
    url: z.string(),
    image: z.object({ en: z.string(), es: z.string(), mobileEn: z.string(), mobileEs: z.string() }),
    stack: z.array(z.string()),
    metrics: z.array(metric).default([]),
    en: copy,
    es: copy,
  }),
});

export const collections = { work };
