// Miniaturas de la pantalla de carga (src/components/SiteLoader.astro): tres proyectos reales recortados
// en 4:3 y pequeños (≈ 15–30 KB), para que no compitan con la carga de la página. Uso: npm run loader-images
import sharp from "sharp";
import fs from "node:fs";

// Orden en que se ven: la primera queda arriba y es la que se ve primero
const projects = ["acl", "imola", "pavlove"];
const dest = "public/img/loader";
fs.mkdirSync(dest, { recursive: true });
for (const slug of projects) {
  const out = `${dest}/${slug}.webp`;
  await sharp(`originales/work/${slug}.jpg`).resize(640, 480, { fit: "cover", position: "top" }).webp({ quality: 72 }).toFile(out);
  console.log(`${out} (${Math.round(fs.statSync(out).size / 1024)} KB)`);
}
