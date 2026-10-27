// Ruta pública de una captura del portafolio en WebP (las genera `npm run images` desde originales/work/).
export const workImg = (file: string) => `/img/work/${file.replace(/\.(jpe?g|png)$/i, ".webp")}`;
