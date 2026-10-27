// Crea una versión .webp (máx. 1200 px de ancho, calidad 78) de cada .jpg/.png de originales/work
// y la guarda en public/img/work, que es lo que se publica. Uso: npm run images
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const src = "originales/work";
const dest = "public/img/work";
fs.mkdirSync(dest, { recursive: true });
for (const file of fs.readdirSync(src)) {
  if (!/\.(jpe?g|png)$/i.test(file)) continue;
  const out = path.join(dest, file.replace(/\.(jpe?g|png)$/i, ".webp"));
  const img = sharp(path.join(src, file));
  const { width = 0 } = await img.metadata();
  await img.resize({ width: Math.min(width, 1200) }).webp({ quality: 78 }).toFile(out);
  console.log(`${file} → ${path.basename(out)} (${Math.round(fs.statSync(out).size / 1024)} KB)`);
}
