// Utilidades ligeras compartidas por las escenas 3D (sin Three.js, para no cargarlo antes de tiempo).
import { useEffect, useState, type RefObject } from "react";

export const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** ¿El navegador puede dibujar WebGL? Si no, se queda la versión estática. */
export function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** true mientras el elemento está en pantalla: fuera de ella se pausa el render. */
export function useInView(ref: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting && !document.hidden), { rootMargin: "100px" });
    io.observe(el);
    const vis = () => setInView((v) => (document.hidden ? false : v || el.getBoundingClientRect().top < innerHeight));
    document.addEventListener("visibilitychange", vis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, [ref]);
  return inView;
}

/** Tema actual (oscuro/claro), sincronizado con el botón de la cabecera. */
export function useTheme() {
  const read = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");
  const [theme, setTheme] = useState<"light" | "dark">(read);
  useEffect(() => {
    const on = () => setTheme(read());
    window.addEventListener("wn:theme", on);
    return () => window.removeEventListener("wn:theme", on);
  }, []);
  return theme;
}
