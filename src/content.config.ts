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

const work = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/work" }),
  schema: z.object({
    order: z.number(),
    category: z.enum(["web", "events", "design", "learning"]),
    featured: z.boolean(),
    hasCase: z.boolean(),
    year: z.number(),
    withDopicos: z.boolean().default(false),
    url: z.string(),
    image: z.object({ en: z.string(), es: z.string(), mobileEn: z.string(), mobileEs: z.string() }),
    stack: z.array(z.string()),
    en: copy,
    es: copy,
  }),
});

export const collections = { work };
