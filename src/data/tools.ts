// Herramientas de la franja de About, con su logo (Simple Icons, licencia CC0) y su color de marca.
// El logo se ve en gris y toma el color de la marca al pasar el mouse (pedido de Willder, 2026-11-18).
// Las marcas negras (GitHub, Three.js) usan blanco, porque el negro no se vería sobre el fondo oscuro.
// Canva no está en Simple Icons (la quitaron por pedido de la marca): va como texto, con su degradado.
import {
  siHtml5,
  siCss,
  siJavascript,
  siTailwindcss,
  siAstro,
  siReact,
  siThreedotjs,
  siGsap,
  siNodedotjs,
  siWordpress,
  siWoocommerce,
  siStripe,
  siCloudflare,
  siGit,
  siGithub,
  siFigma,
  siClaude,
} from "simple-icons";

export interface Tool {
  name: string;
  /** Trazado SVG (viewBox 0 0 24 24); sin trazado, se muestra el nombre */
  path?: string;
  /** Color al pasar el mouse */
  color: string;
}

const icon = (name: string, si: { path: string; hex: string }, color = `#${si.hex}`): Tool => ({ name, path: si.path, color });

export const tools: Tool[] = [
  icon("HTML", siHtml5),
  icon("CSS", siCss),
  icon("JavaScript", siJavascript),
  icon("Tailwind CSS", siTailwindcss),
  icon("Astro", siAstro),
  icon("React", siReact),
  icon("Three.js", siThreedotjs, "#ffffff"),
  icon("GSAP", siGsap),
  icon("Node.js", siNodedotjs),
  icon("WordPress", siWordpress, "#3a9fd1"),
  icon("WooCommerce", siWoocommerce, "#a46497"),
  icon("Stripe", siStripe),
  icon("Cloudflare", siCloudflare),
  icon("Git", siGit),
  icon("GitHub", siGithub, "#ffffff"),
  icon("Figma", siFigma),
  { name: "Canva", color: "linear-gradient(135deg, #00c4cc, #7d2ae8)" },
  icon("Claude Code", siClaude),
];
