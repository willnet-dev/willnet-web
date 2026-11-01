// Hoja 16:10 con el sistema de logos de Macias Counseling para el portafolio de willnet.dev.
// Uso (desde willnet-web): node scripts/macias-sheet.mjs "<Clientes/MaciasCounseling/01 Marca/logo/final>" originales/work . && npm run images
import { createRequire } from "node:module";
import path from "node:path";
const [, , src, out, proj] = process.argv;
const require = createRequire(path.join(proj, "package.json"));
const sharp = require("sharp");

const W = 1600, H = 1000, NAVY = "#0F2B5B", BLUE = "#2373F4";
const f = (p) => path.join(src, p);

async function fit(file, w, h) {
  return sharp(f(file)).resize({ width: w, height: h, fit: "inside" }).png().toBuffer();
}
async function circle(file, d) {
  const mask = Buffer.from(`<svg width="${d}" height="${d}"><circle cx="${d / 2}" cy="${d / 2}" r="${d / 2}"/></svg>`);
  return sharp(f(file)).resize(d, d).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
}
const meta = async (b) => sharp(b).metadata();

const panels = [
  { x: 24, y: 24, w: 976, h: 540, bg: "#FFFFFF", ink: NAVY, key: "primary" },
  { x: 1016, y: 24, w: 560, h: 540, bg: NAVY, ink: "#FFFFFF", key: "dark" },
  { x: 24, y: 580, w: 536, h: 396, bg: BLUE, ink: "#FFFFFF", key: "mono" },
  { x: 576, y: 580, w: 424, h: 396, bg: "#FFFFFF", ink: NAVY, key: "icon" },
  { x: 1016, y: 580, w: 560, h: 396, bg: "#E4ECF8", ink: NAVY, key: "social" },
];
const labels = {
  en: { primary: "Primary logo", dark: "Dark background", mono: "One color", icon: "Icon &amp; favicon", social: "Social media profiles" },
  es: { primary: "Logo principal", dark: "Fondo oscuro", mono: "A un color", icon: "Ícono y favicon", social: "Perfiles de redes" },
};

async function build(lang, file) {
  const layers = [];
  const place = async (buf, p, dy = 14) => {
    const m = await meta(buf);
    layers.push({ input: buf, left: Math.round(p.x + (p.w - m.width) / 2), top: Math.round(p.y + (p.h - m.height) / 2 + dy) });
  };
  const [primary, dark, mono, icon, social] = panels;
  await place(await fit("png/macias-logo-horizontal-color.png", 740, 300), primary);
  await place(await fit("png/macias-logo-vertical-oscuro.png", 400, 380), dark);
  await place(await fit("png/macias-logo-horizontal-blanco.png", 420, 170), mono);
  // Ícono en tres tamaños, como se ve en la pestaña del navegador y en el teléfono
  const sizes = [150, 72, 36];
  let x = icon.x + 52;
  for (const s of sizes) {
    const b = await fit("png/macias-icono-color.png", s, s);
    layers.push({ input: b, left: x, top: Math.round(icon.y + icon.h / 2 + 14 - s / 2) });
    x += s + 34;
  }
  const d = 190;
  const a = await circle("redes/perfil-fondo-blanco.png", d);
  const b = await circle("redes/perfil-fondo-marino.png", d);
  const cy = Math.round(social.y + social.h / 2 + 14 - d / 2);
  layers.push({ input: a, left: social.x + social.w / 2 - d - 20, top: cy });
  layers.push({ input: b, left: social.x + social.w / 2 + 20, top: cy });

  const rects = panels.map((p) => `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="18" fill="${p.bg}"/>`).join("");
  const text = panels
    .map((p) => `<text x="${p.x + 28}" y="${p.y + 46}" fill="${p.ink}" fill-opacity="0.7" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="22" font-weight="600" letter-spacing="0.5">${labels[lang][p.key]}</text>`)
    .join("");
  // Borde suave en los perfiles para que el blanco no se pierda sobre el fondo claro
  const rings = [social.x + social.w / 2 - d / 2 - 20, social.x + social.w / 2 + d / 2 + 20]
    .map((cx) => `<circle cx="${cx}" cy="${cy + d / 2}" r="${d / 2}" fill="none" stroke="${NAVY}" stroke-opacity="0.12" stroke-width="2"/>`)
    .join("");
  const base = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#EEF1F6"/>${rects}${text}</svg>`);
  const top = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${rings}</svg>`);
  await sharp(base).composite([...layers, { input: top }]).flatten({ background: "#EEF1F6" }).jpeg({ quality: 90 }).toFile(path.join(out, file));
  console.log("ok", file);
}
await build("en", "logo-macias-en.jpg");
await build("es", "logo-macias.jpg");
