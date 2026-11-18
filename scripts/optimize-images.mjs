// Crea una versión .webp (máx. 1200 px de ancho, calidad 78) de cada .jpg/.png de originales/work
// y la guarda en public/img/work, que es lo que se publica. Uso: npm run images
// Los casos del slider de Work (los que tienen captura de celular) llevan además una copia «-fondo.webp»
// ya desenfocada para el fondo a todo lo ancho: el título blanco se lee mejor y pesa poco (2026-11-16).
// Se desenfoca aquí y no con CSS (filter: blur) para no gastar el procesador del teléfono al hacer scroll.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const src = "originales/work";
// Capturas de los casos que van en el slider de Work (hasCase y sin inShowcase: false)
const sliderFiles = new Set(
  fs
    .readdirSync("src/content/work")
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join("src/content/work", f), "utf8")))
    .filter((d) => d.hasCase && d.inShowcase !== false && d.image)
    .flatMap((d) => Object.values(d.image)),
);
const dest = "public/img/work";
fs.mkdirSync(dest, { recursive: true });
for (const file of fs.readdirSync(src)) {
  if (!/\.(jpe?g|png)$/i.test(file)) continue;
  const out = path.join(dest, file.replace(/\.(jpe?g|png)$/i, ".webp"));
  const img = sharp(path.join(src, file));
  const { width = 0 } = await img.metadata();
  await img.resize({ width: Math.min(width, 1200) }).webp({ quality: 78 }).toFile(out);
  console.log(`${file} → ${path.basename(out)} (${Math.round(fs.statSync(out).size / 1024)} KB)`);
  const isMobileShot = /-movil/i.test(file);
  if (sliderFiles.has(file)) {
    const fondo = out.replace(/\.webp$/, "-fondo.webp");
    await sharp(path.join(src, file))
      .resize({ width: isMobileShot ? 585 : 1600 })
      .blur(isMobileShot ? 6 : 9)
      .webp({ quality: 62 })
      .toFile(fondo);
    console.log(`  + ${path.basename(fondo)} (${Math.round(fs.statSync(fondo).size / 1024)} KB)`);
  }
}
