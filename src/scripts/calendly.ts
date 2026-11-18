// Llamadas de Calendly en una ventana encima de la página (pedido de Willder, 2026-11-14).
// El script y la hoja de estilos de Calendly se descargan solo al primer clic en un enlace con
// data-calendly: así quien no agenda no descarga nada de Calendly (velocidad y cookies).
// Sin JavaScript, o si Calendly no carga, el enlace abre la página de Calendly en otra pestaña.
// Colores: el color neutro de los botones de la web (Willder, 2026-11-18): negro en claro y blanco en
// oscuro, sobre el gris de las tarjetas de cada tema. El enlace trae los del oscuro (calendlyHref, ui.ts)
// y aquí se ponen los del tema actual. Calendly elige solo el texto de sus botones.

const WIDGET_JS = "https://assets.calendly.com/assets/external/widget.js";
const WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css";
const COLORS = {
  light: { background_color: "f2f1ed", text_color: "111113", primary_color: "111113" },
  dark: { background_color: "0b0b0c", text_color: "f0f0f0", primary_color: "f0f0f0" },
};

type CalendlyApi = { initPopupWidget: (opts: { url: string }) => void };
declare global {
  interface Window {
    Calendly?: CalendlyApi;
  }
}

let loading: Promise<CalendlyApi> | null = null;

function loadCalendly(): Promise<CalendlyApi> {
  if (window.Calendly) return Promise.resolve(window.Calendly);
  if (loading) return loading;
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = WIDGET_CSS;
  document.head.append(css);
  loading = new Promise<CalendlyApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = WIDGET_JS;
    script.async = true;
    const timer = window.setTimeout(() => reject(new Error("timeout")), 8000);
    script.onload = () => {
      clearTimeout(timer);
      window.Calendly ? resolve(window.Calendly) : reject(new Error("no Calendly"));
    };
    script.onerror = () => {
      clearTimeout(timer);
      reject(new Error("load error"));
    };
    document.head.append(script);
  }).catch((err) => {
    loading = null; // permite reintentar en el próximo clic
    throw err;
  });
  return loading;
}

function themedUrl(href: string) {
  const url = new URL(href);
  const colors = COLORS[document.documentElement.dataset.theme === "light" ? "light" : "dark"];
  for (const [k, v] of Object.entries(colors)) url.searchParams.set(k, v);
  return url.toString();
}

// Mientras la ventana está abierta, el scroll suave (Lenis) se detiene; al cerrarla vuelve y el foco
// regresa al enlace que la abrió. Calendly quita su .calendly-overlay del body al cerrar.
function lockUntilClosed(trigger: HTMLElement) {
  window.dispatchEvent(new CustomEvent("willnet:scroll-lock", { detail: true }));
  const observer = new MutationObserver(() => {
    if (document.querySelector(".calendly-overlay")) return;
    observer.disconnect();
    window.dispatchEvent(new CustomEvent("willnet:scroll-lock", { detail: false }));
    trigger.focus({ preventScroll: true });
  });
  observer.observe(document.body, { childList: true });
}

document.addEventListener("click", async (e) => {
  const link = (e.target as Element | null)?.closest<HTMLAnchorElement>("a[data-calendly]");
  if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  const url = themedUrl(link.href);
  link.setAttribute("aria-busy", "true");
  try {
    const calendly = await loadCalendly();
    calendly.initPopupWidget({ url });
    lockUntilClosed(link);
  } catch {
    // Calendly bloqueado o sin conexión: se abre su página en otra pestaña
    // (con "noopener" window.open siempre devuelve null, por eso se corta el opener a mano)
    const tab = window.open(url, "_blank");
    if (tab) tab.opener = null;
    else location.href = url;
  } finally {
    link.removeAttribute("aria-busy");
  }
});

// Archivo como módulo (para declare global)
export {};
