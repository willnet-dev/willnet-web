// Foto de About en la máxima calidad útil: parte del original de Canva (1136×1408, su resolución nativa;
// exportarlo más grande desde Canva solo lo agranda, no agrega detalle) y crea AVIF y WebP de alta calidad
// en 720 y 1136 px, más un JPEG de respaldo. Uso: npm run about-photo [ruta del original]
import sharp from "sharp";
import fs from "node:fs";

const src = process.argv[2] ?? "originales/about/willder-about-04-estudio-pecho-v2.jpg";
const dest = "public/img";
// Calidades elegidas midiendo contra el original (PSNR ≈ 45–46 dB: sin diferencia visible)
const formats = [
  ["avif", { quality: 80 }],
  ["webp", { quality: 90 }],
];
for (const width of [720, 1136]) {
  for (const [fmt, opts] of formats) {
    const out = `${dest}/willder-${width}.${fmt}`;
    await sharp(src).resize({ width })[fmt](opts).toFile(out);
    console.log(`${out} (${Math.round(fs.statSync(out).size / 1024)} KB)`);
  }
}
// Respaldo para navegadores sin AVIF ni WebP (y la ruta de siempre)
const jpg = `${dest}/willder.jpg`;
await sharp(src).resize({ width: 1136 }).jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" }).toFile(jpg);
console.log(`${jpg} (${Math.round(fs.statSync(jpg).size / 1024)} KB)`);
