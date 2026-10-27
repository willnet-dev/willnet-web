// Comportamiento común de la web. Se ejecuta una vez y se re-inicializa en cada cambio de página
// (las transiciones de Astro no recargan la página completa).
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => matchMedia("(hover: hover) and (pointer: fine)").matches;
const desktop = () => matchMedia("(min-width: 1024px)").matches;

// Todo lo que se crea en una página se limpia antes de la siguiente
let cleanups: Array<() => void> = [];
const onCleanup = (fn: () => void) => cleanups.push(fn);

function listen<K extends keyof WindowEventMap>(target: Window, type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions): void;
function listen(target: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions): void;
function listen(target: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions) {
  target.addEventListener(type, fn, opts);
  onCleanup(() => target.removeEventListener(type, fn, opts));
}

/* ---------- Cabecera: fondo al bajar, se oculta al bajar y aparece al subir ---------- */
function initHeader() {
  const header = document.querySelector<HTMLElement>("[data-header]");
  if (!header) return;
  let lastY = scrollY;
  const update = () => {
    const y = scrollY;
    header.classList.toggle("is-scrolled", y > 10);
    if (!header.classList.contains("menu-open")) header.classList.toggle("is-hidden", y > 400 && y > lastY);
    lastY = y;
  };
  update();
  listen(window, "scroll", update, { passive: true });
}

/* ---------- Menú móvil a pantalla completa ---------- */
function initMenu() {
  const btn = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const menu = document.querySelector<HTMLElement>("[data-menu]");
  const header = document.querySelector<HTMLElement>("[data-header]");
  const label = document.querySelector<HTMLElement>("[data-menu-label]");
  if (!btn || !menu || !header) return;
  // En móvil la cabecera no es fija: si se abre el menú después de bajar, el logo, el idioma y el tema
  // entran sincronizados con el círculo del menú (menu-reveal) en lugar de aparecer de golpe
  const narrow = () => matchMedia("(max-width: 1023px)").matches;
  let closeTimer = 0;

  const setOpen = (open: boolean) => {
    btn.setAttribute("aria-expanded", String(open));
    clearTimeout(closeTimer);
    if (open) {
      const fromScroll = narrow() && scrollY > header.offsetHeight;
      header.classList.add("menu-open");
      header.classList.toggle("menu-reveal", fromScroll);
      if (fromScroll) {
        // Primero se pintan ocultos (sin transición) y después entran
        header.classList.add("menu-reveal-start");
        void header.offsetWidth;
        requestAnimationFrame(() => {
          header.classList.remove("menu-reveal-start");
          header.classList.add("menu-reveal-in");
        });
      }
    } else {
      header.classList.remove("menu-reveal-in");
      const finish = () => header.classList.remove("menu-open", "menu-reveal");
      if (header.classList.contains("menu-reveal") && !reducedMotion()) closeTimer = window.setTimeout(finish, 700);
      else finish();
    }
    if (label) label.textContent = open ? label.dataset.close! : label.dataset.open!;
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add("is-open"));
      menu.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    } else {
      menu.classList.remove("is-open");
      const hide = () => (menu.hidden = true);
      reducedMotion() ? hide() : setTimeout(hide, 700);
    }
  };

  listen(btn, "click", () => setOpen(btn.getAttribute("aria-expanded") !== "true"));
  listen(document, "keydown", ((e: KeyboardEvent) => {
    if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      btn.focus();
    }
  }) as EventListener);
  onCleanup(() => (document.documentElement.style.overflow = ""));
}

/* ---------- Tema oscuro / claro ---------- */
function initTheme() {
  const btn = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (!btn) return;
  const sync = () => {
    const dark = document.documentElement.dataset.theme !== "light";
    btn.setAttribute("aria-label", dark ? btn.dataset.labelLight! : btn.dataset.labelDark!);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0a0a0b" : "#f3f2ee");
  };
  sync();
  listen(btn, "click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    sync();
    window.dispatchEvent(new CustomEvent("wn:theme", { detail: next }));
  });
}

/* ---------- Botón flotante de WhatsApp: marca que ya se vio su entrada en esta sesión ---------- */
function markWaSeen() {
  try {
    sessionStorage.setItem("wa-seen", "1");
  } catch {}
}

/* ---------- Botones magnéticos (solo con mouse) ---------- */
function initMagnetic() {
  if (!finePointer() || reducedMotion()) return;
  document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
    const label = el.querySelector<HTMLElement>(".btn-label");
    const strength = Number(el.dataset.magneticStrength ?? 0.3);
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
    const lxTo = label ? gsap.quickTo(label, "x", { duration: 0.6, ease: "power3.out" }) : null;
    const lyTo = label ? gsap.quickTo(label, "y", { duration: 0.6, ease: "power3.out" }) : null;
    listen(el, "pointermove", ((e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      lxTo?.(dx * strength * 0.4);
      lyTo?.(dy * strength * 0.4);
    }) as EventListener);
    listen(el, "pointerleave", () => {
      xTo(0);
      yTo(0);
      lxTo?.(0);
      lyTo?.(0);
    });
  });
}

/* ---------- Revelado al entrar en pantalla ---------- */
function initReveal() {
  const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (reducedMotion() || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  items.forEach((el) => io.observe(el));
  onCleanup(() => io.disconnect());
}

/* ---------- Máquina de escribir (frase del hero) ---------- */
function initTypewriter() {
  const el = document.querySelector<HTMLElement>("[data-typewriter]");
  if (!el) return;
  const words: string[] = JSON.parse(el.dataset.words || "[]");
  if (!words.length) return;
  if (reducedMotion()) {
    el.textContent = words[0];
    return;
  }
  let w = 0;
  let i = words[0].length;
  let deleting = true;
  let timer = 0;
  const tick = () => {
    const word = words[w];
    i += deleting ? -1 : 1;
    el.textContent = word.slice(0, i);
    let delay = deleting ? 40 : 75;
    if (!deleting && i === word.length) {
      deleting = true;
      delay = 1800;
    } else if (deleting && i === 0) {
      deleting = false;
      w = (w + 1) % words.length;
      delay = 300;
    }
    timer = window.setTimeout(tick, delay);
  };
  timer = window.setTimeout(tick, 2200);
  onCleanup(() => clearTimeout(timer));
}

/* ---------- Botón para volver arriba ---------- */
function initBackTop() {
  const btn = document.querySelector<HTMLButtonElement>("[data-back-top]");
  if (!btn) return;
  const update = () => (btn.hidden = scrollY < innerHeight * 0.8);
  update();
  listen(window, "scroll", update, { passive: true });
  listen(btn, "click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
    document.querySelector<HTMLElement>(".skip-link")?.focus({ preventScroll: true });
  });
}

/* ---------- Mouse del hero: baja con desplazamiento suave (el ancla sola salta de golpe) ---------- */
function initScrollCue() {
  const cue = document.querySelector<HTMLAnchorElement>(".scroll-cue");
  const target = cue && document.querySelector<HTMLElement>(cue.hash);
  if (!cue || !target) return;
  listen(cue, "click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + scrollY, behavior: reducedMotion() ? "auto" : "smooth" });
    // Como el ancla nativa: el foco pasa a la sección, para que el teclado siga desde ahí
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
}

/* ---------- Hora local de West Palm Beach en el pie ---------- */
function initClock() {
  const els = document.querySelectorAll<HTMLElement>("[data-local-time]");
  if (!els.length) return;
  const lang = document.documentElement.lang === "es" ? "es-US" : "en-US";
  const fmt = new Intl.DateTimeFormat(lang, { hour: "numeric", minute: "2-digit", timeZone: "America/New_York", timeZoneName: "short" });
  const update = () => els.forEach((el) => (el.textContent = fmt.format(new Date())));
  update();
  const id = window.setInterval(update, 30_000);
  onCleanup(() => clearInterval(id));
}

/* ---------- Filtros del portafolio ---------- */
function initFilters() {
  const bar = document.querySelector<HTMLElement>("[data-filters]");
  if (!bar) return;
  const items = document.querySelectorAll<HTMLElement>("[data-category]");
  const note = document.querySelector<HTMLElement>("[data-learning-note]");
  bar.querySelectorAll<HTMLButtonElement>("button[data-filter]").forEach((btn) => {
    listen(btn, "click", () => {
      const f = btn.dataset.filter!;
      bar.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      items.forEach((it) => (it.hidden = f !== "all" && it.dataset.category !== f));
      if (note) note.hidden = !(f === "all" || f === "learning");
      ScrollTrigger.refresh();
    });
  });
}

/* ---------- Animaciones con scroll (GSAP) ---------- */
// Altura inicial del telón: la misma que en CSS (--lip-h), más baja en móvil
const lipHeight = () => innerHeight * (desktop() ? 0.16 : 0.1);

function initScroll() {
  if (reducedMotion()) return;
  const ctx = gsap.context(() => {
    // Parallax: data-speed="0.2" mueve el elemento más lento o más rápido que el scroll
    gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
      const speed = Number(el.dataset.speed);
      gsap.fromTo(
        el,
        { yPercent: -speed * 50 },
        { yPercent: speed * 50, ease: "none", scrollTrigger: { trigger: el.closest("[data-parallax-root]") ?? el, start: "top bottom", end: "bottom top", scrub: true } },
      );
    });

    // Proceso (B): el wireframe se construye paso a paso mientras se leen los pasos
    const process = document.querySelector<HTMLElement>("[data-process]");
    if (process && desktop()) {
      const frame = process.querySelector<HTMLElement>("[data-process-frame]");
      const steps = process.querySelectorAll<HTMLElement>("[data-process-step]");
      const activate = (step: HTMLElement) => {
        frame?.setAttribute("data-state", step.dataset.processStep!);
        steps.forEach((s) => s.classList.toggle("is-active", s === step));
      };
      // Al entrar (bajando o subiendo) en un paso, el marco pasa a ese estado; al salir se queda como está
      steps.forEach((step) => {
        ScrollTrigger.create({ trigger: step, start: "top 60%", end: "bottom 40%", onEnter: () => activate(step), onEnterBack: () => activate(step) });
      });
    }

    // Casos (B): la captura real «rellena» el wireframe al bajar
    document.querySelectorAll<HTMLElement>("[data-case-build]").forEach((root) => {
      const frame = root.querySelector<HTMLElement>("[data-case-frame]");
      if (!frame) return;
      ScrollTrigger.create({
        trigger: root,
        start: "top 70%",
        end: "bottom 80%",
        scrub: true,
        onUpdate: (self) => frame.style.setProperty("--p", self.progress.toFixed(3)),
      });
    });

    // Telón final (referencia: dennissnellenberg.com): la curva del contenido se aplana mientras el
    // escenario entra; su contenido sube más lento que el scroll y la sombra del telón se disipa
    const stage = document.querySelector<HTMLElement>("[data-stage]");
    if (stage) {
      const reveal = { trigger: stage, start: "top bottom", end: "bottom bottom", scrub: true, invalidateOnRefresh: true };
      // Termina cuando el escenario llega a esa altura de la pantalla o al final de la página (en Contacto es corto)
      const until = (ratio: number) => () => Math.min(stage.offsetTop - innerHeight * ratio, ScrollTrigger.maxScroll(window));
      gsap.fromTo("[data-stage-lip]", { height: () => lipHeight() }, { height: 0, ease: "none", scrollTrigger: { ...reveal, end: until(0.15) } });
      gsap.fromTo("[data-stage-shade]", { opacity: 1 }, { opacity: 0, ease: "none", scrollTrigger: { ...reveal, end: until(0) } });
      gsap.fromTo("[data-stage-inner]", { y: () => -innerHeight * 0.35 }, { y: 0, ease: "none", scrollTrigger: reveal });
      gsap.fromTo("[data-together-orb]", { x: () => innerWidth * 0.12 }, { x: 0, ease: "none", scrollTrigger: reveal });
    }
  });
  onCleanup(() => ctx.revert());
}

/* ---------- Transición entre páginas: cortina lima con el nombre de la página ---------- */
let curtainBound = false;
function bindCurtain() {
  if (curtainBound) return;
  curtainBound = true;
  const curtain = () => document.querySelector<HTMLElement>("[data-curtain]");
  const ease = "cubic-bezier(0.76, 0, 0.24, 1)";

  document.addEventListener("astro:before-preparation", (event) => {
    const e = event as Event & { loader: () => Promise<void>; sourceElement?: Element; to: URL };
    const el = curtain();
    if (!el || reducedMotion()) return;
    const label = el.querySelector<HTMLElement>("[data-curtain-label]");
    const text = e.sourceElement?.textContent?.trim();
    if (label) label.textContent = text && text.length < 32 ? text : "WillNet";
    const original = e.loader;
    e.loader = async () => {
      const cover = el.animate([{ transform: "translateY(100%)", visibility: "visible" }, { transform: "translateY(0%)", visibility: "visible" }], { duration: 550, easing: ease, fill: "forwards" });
      await Promise.all([cover.finished, original()]);
    };
  });

  document.addEventListener("astro:after-swap", () => {
    const el = curtain();
    if (!el) return;
    if (reducedMotion()) {
      el.getAnimations().forEach((a) => a.cancel());
      return;
    }
    el.getAnimations().forEach((a) => a.cancel());
    el.animate([{ transform: "translateY(0%)", visibility: "visible" }, { transform: "translateY(-100%)", visibility: "visible" }], { duration: 650, delay: 120, easing: ease, fill: "backwards" });
  });

  document.addEventListener("astro:before-swap", () => {
    cleanups.forEach((fn) => fn());
    cleanups = [];
  });
}

export function initSite() {
  (window as Window & { __wnReady?: boolean }).__wnReady = true;
  bindCurtain();
  document.addEventListener("astro:page-load", () => {
    initHeader();
    initMenu();
    initTheme();
    initMagnetic();
    initReveal();
    initTypewriter();
    initBackTop();
    initScrollCue();
    markWaSeen();
    initClock();
    initFilters();
    initScroll();
    // Recalcula posiciones cuando terminan de cargar fuentes e imágenes
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  });
}
