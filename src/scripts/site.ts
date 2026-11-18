// Comportamiento común de la web. Se ejecuta una vez y se re-inicializa en cada cambio de página
// (las transiciones de Astro no recargan la página completa).
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { decimalsOf, formatNumber } from "../lib/format";

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

// Todo lo que se crea en una página se limpia antes de la siguiente
let cleanups: Array<() => void> = [];
const onCleanup = (fn: () => void) => cleanups.push(fn);

function listen<K extends keyof WindowEventMap>(target: Window, type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions): void;
function listen(target: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions): void;
function listen(target: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions) {
  target.addEventListener(type, fn, opts);
  onCleanup(() => target.removeEventListener(type, fn, opts));
}

/* ---------- Scroll suave (Lenis), solo con mouse o trackpad ---------- */
// En Mac el scroll nativo corre en otro hilo y las animaciones con scroll (parallax, telón, W 3D)
// llegaban un fotograma tarde: temblaban aunque la página fuera a 60 fps. Lenis mueve la página dentro
// del mismo requestAnimationFrame que GSAP (gsap.ticker), así todo se dibuja en el mismo fotograma.
// En pantallas táctiles y con movimiento reducido se queda el scroll nativo.
let lenis: Lenis | null = null;
function bindSmoothScroll() {
  if (lenis || reducedMotion() || !finePointer()) return;
  lenis = new Lenis({ autoRaf: false, stopInertiaOnNavigate: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  // Sin esto, tras un fotograma lento GSAP «frena» el tiempo y el scroll daría un tirón
  gsap.ticker.lagSmoothing(0);
}

// Ventanas encima de la página (Calendly, src/scripts/calendly.ts) piden detener el scroll suave mientras están abiertas
window.addEventListener("willnet:scroll-lock", (e) => {
  if ((e as CustomEvent<boolean>).detail) lenis?.stop();
  else lenis?.start();
});

// Desplazamiento animado: con Lenis si está activo; si no, el nativo del navegador
function scrollToY(top: number) {
  if (lenis) lenis.scrollTo(top);
  else window.scrollTo({ top, behavior: reducedMotion() ? "auto" : "smooth" });
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
    if (open) lenis?.stop();
    else lenis?.start();
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
  onCleanup(() => {
    document.documentElement.style.overflow = "";
    lenis?.start();
  });
}

/* ---------- Tema oscuro / claro ---------- */
function initTheme() {
  const btn = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (!btn) return;
  const sync = () => {
    const dark = document.documentElement.dataset.theme !== "light";
    btn.setAttribute("aria-label", dark ? btn.dataset.labelLight! : btn.dataset.labelDark!);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#161719" : "#f1f3f4");
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

/* ---------- Servicios: vista previa que sigue al mouse (solo escritorio con mouse) ---------- */
function initServicePreview() {
  if (!finePointer() || reducedMotion() || !matchMedia("(min-width: 768px)").matches) return;
  document.querySelectorAll<HTMLElement>("[data-svc-list]").forEach((list) => {
    const preview = list.querySelector<HTMLElement>("[data-svc-preview]");
    if (!preview) return;
    const items = preview.querySelectorAll<HTMLElement>("[data-svc-item]");
    const xTo = gsap.quickTo(preview, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(preview, "y", { duration: 0.5, ease: "power3.out" });
    const rTo = gsap.quickTo(preview, "rotation", { duration: 0.6, ease: "power3.out" });
    let shown = false;
    let pointer = { x: 0, y: 0 };
    let settle = 0;
    const hide = () => {
      shown = false;
      preview.classList.remove("is-on");
    };
    // Coloca la vista previa a la derecha del cursor (sin salirse de la lista) y muestra la del servicio
    const update = (clientX: number, clientY: number) => {
      const row = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>("[data-svc]");
      if (!row || !list.contains(row)) return hide();
      items.forEach((item) => item.classList.toggle("is-active", item.dataset.svcItem === row.dataset.svc));
      const r = list.getBoundingClientRect();
      const x = gsap.utils.clamp(0, r.width - preview.offsetWidth, clientX - r.left + 32);
      const y = clientY - r.top - preview.offsetHeight / 2;
      if (shown) {
        xTo(x);
        yTo(y);
      } else {
        xTo(x, x);
        yTo(y, y);
        shown = true;
        preview.classList.add("is-on");
      }
    };
    listen(list, "pointermove", ((e: PointerEvent) => {
      // Se inclina un poco hacia donde va el mouse y vuelve a quedar recta al parar
      rTo(gsap.utils.clamp(-8, 8, (e.clientX - pointer.x) * 0.4));
      window.clearTimeout(settle);
      settle = window.setTimeout(() => rTo(0), 120);
      pointer = { x: e.clientX, y: e.clientY };
      update(e.clientX, e.clientY);
    }) as EventListener);
    listen(list, "pointerleave", hide);
    // Al hacer scroll sin mover el mouse, la fila bajo el cursor cambia: se actualiza igual
    listen(window, "scroll", () => shown && update(pointer.x, pointer.y), { passive: true });
    onCleanup(() => window.clearTimeout(settle));
  });
}

/* ---------- Servicios (opción 2, bento): brillo del borde que sigue al mouse ---------- */
function initBento() {
  if (!finePointer() || reducedMotion()) return;
  document.querySelectorAll<HTMLElement>("[data-bento]").forEach((bento) => {
    const tiles = bento.querySelectorAll<HTMLElement>(".bento__tile");
    // Cada mosaico recibe la posición del mouse relativa a él: el brillo se ve también en los vecinos
    listen(bento, "pointermove", ((e: PointerEvent) => {
      tiles.forEach((tile) => {
        const r = tile.getBoundingClientRect();
        tile.style.setProperty("--mx", `${e.clientX - r.left}px`);
        tile.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    }) as EventListener);
    listen(bento, "pointerleave", () => tiles.forEach((tile) => tile.style.removeProperty("--mx")));
  });
}

/* ---------- Foto de About: se inclina en 3D siguiendo al mouse, con brillo en el borde (como el bento) ---------- */
function initTilt() {
  if (!finePointer() || reducedMotion()) return;
  document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
    // Se mide el contenedor, que no gira: si se midiera la foto inclinada, el giro cambiaría la medida y temblaría
    const box = el.parentElement ?? el;
    gsap.set(el, { transformPerspective: 900 });
    const rotX = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
    const rotY = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
    listen(el, "pointermove", ((e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      rotX((0.5 - y / r.height) * 8);
      rotY((x / r.width - 0.5) * 10);
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    }) as EventListener);
    listen(el, "pointerleave", () => {
      rotX(0);
      rotY(0);
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    });
    onCleanup(() => gsap.killTweensOf(el));
  });
}

/* ---------- Pantalla de carga (SiteLoader.astro; idea de osmo.supply, «Willem Loading Animation») ---------- */
// Solo corre si el script del <head> puso .is-loading en <html> (primera visita de la pestaña). Otras entradas
// (la foto pixelada de About) esperan a `loaderDone` para no animarse debajo de la pantalla de carga.
let loaderDone: Promise<void> = Promise.resolve();
function initLoader() {
  const root = document.documentElement;
  const el = document.querySelector<HTMLElement>("[data-site-loader]");
  if (!root.classList.contains("is-loading") || !el) return;
  let finish!: () => void;
  loaderDone = new Promise((resolve) => (finish = resolve));
  lenis?.stop();
  // Fuera de <body>: al final se escala <body> (la web en miniatura) y la pantalla de carga no debe escalarse con él
  root.append(el);
  const body = document.body;
  const q = <T extends Element>(sel: string) => Array.from(el.querySelectorAll<T>(sel));
  const letters = q<HTMLElement>("[data-sl-letter]");
  // La fila de letras y ventana (no .sl__word, que se centra con la propiedad CSS translate; ver SiteLoader.astro)
  const row = el.querySelector<HTMLElement>("[data-sl-row]")!;
  const start = el.querySelector<HTMLElement>("[data-sl-half='start']")!;
  const finishHalf = el.querySelector<HTMLElement>("[data-sl-half='end']")!;
  const box = el.querySelector<HTMLElement>("[data-sl-box]")!;
  const img = el.querySelector<HTMLElement>("[data-sl-img]")!;
  // De arriba abajo: la de encima es la primera que se quita
  const extras = q<HTMLElement>("[data-sl-extra]").reverse();

  // La web en miniatura: <body> se escala y se mueve para llenar justo la ventana (como object-fit: cover).
  // Se recalcula en cada fotograma con la medida real de la ventana, así siguen juntas mientras crece.
  // Al terminar la ventana mide toda la pantalla, la escala llega a 1 y el movimiento a 0: no hay salto.
  let following = false;
  const follow = () => {
    if (!following) return;
    const r = img.getBoundingClientRect();
    // Ancho real de la página (sin la barra de desplazamiento): documentElement.clientWidth no descuenta el
    // hueco reservado con scrollbar-gutter mientras el scroll está bloqueado
    const w = body.offsetWidth;
    const h = innerHeight;
    const s = Math.min(1, Math.max(r.width / w, r.height / h));
    body.style.transformOrigin = `${w / 2}px ${scrollY + h / 2}px`;
    body.style.transform = `translate(${r.left + r.width / 2 - w / 2}px, ${r.top + r.height / 2 - h / 2}px) scale(${s})`;
  };
  const showMini = () => {
    // <body> se recorta a la pantalla que se está viendo: sin esto, al escalarlo, las secciones de más abajo
    // entrarían en la pantalla y sus animaciones de entrada (que se activan al verse) se gastarían escondidas
    Object.assign(body.style, { height: `${scrollY + innerHeight}px`, overflowY: "clip", willChange: "transform" });
    following = true;
    follow();
    // La entrada del hero arranca ya, dentro de la ventana
    root.classList.remove("is-loading");
  };
  const done = () => {
    following = false;
    for (const prop of ["transform", "transform-origin", "height", "overflow-y", "will-change"]) body.style.removeProperty(prop);
    el.remove();
    lenis?.resize();
    lenis?.start();
    ScrollTrigger.refresh();
  };

  const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.inOut" }, onUpdate: follow, onComplete: done });
  el.classList.add("is-active");
  // 1. Las letras suben
  tl.from(letters, { yPercent: 110, duration: 0.9, stagger: 0.04, ease: "expo.out" });
  // 2. Se abre la ventana entre WILL y NET y las mitades se separan un poco. WILL es más ancho que NET, así que
  //    la ventana quedaría a la derecha del centro (≈ 47 px en escritorio) y la web, al aparecer y crecer, se
  //    deslizaba de la derecha al centro. Mientras se abre, la palabra se corre lo justo para que la ventana
  //    quede en el centro exacto de la pantalla: desde ahí la web solo crece, sin moverse de lado
  tl.to(box, { width: "1em", duration: 1 }, 0.55)
    .to(img, { width: "100%", duration: 1 }, "<")
    .to(start, { x: "-0.05em", duration: 1 }, "<")
    .to(finishHalf, { x: "0.05em", duration: 1 }, "<")
    .to(row, { x: () => (finishHalf.offsetWidth - start.offsetWidth) / 2, duration: 1 }, "<");
  // 3. Las capturas se quitan de una en una. Debajo de la última ya está la web real, en miniatura
  tl.to(extras, { opacity: 0, duration: 0.05, stagger: 0.35, ease: "none" }, "-=0.1");
  tl.add(showMini, tl.duration() - 0.05);
  // 4. Pausa corta con la web pequeña y la ventana crece desde el centro hasta llenar la pantalla, empujando las letras
  tl.add(finish, "+=0.6")
    .to(img, { width: "100vw", height: "100dvh", borderRadius: 0, duration: 1.1 }, "<")
    .to(box, { width: "110vw", duration: 1.1 }, "<");

  // Un toque o una tecla la acelera para quien no quiera esperar
  const hurry = () => tl.timeScale(3.5);
  addEventListener("pointerdown", hurry, { once: true });
  addEventListener("keydown", hurry, { once: true });

  // Empieza cuando la letra del título está lista (máx. 0.8 s de espera)
  Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 800))]).then(() => tl.play());
}

/* ---------- Foto de About: aparece pixelada (idea de osmo.supply, «Pixelated Image Reveal») ---------- */
// Al cargar la página, la primera vez que el marco se ve: los bloques lima tapan el marco en orden aleatorio,
// la foto se muestra debajo y los bloques se apagan también al azar. En la demo de Osmo pasa al pasar el mouse
// y cambia entre dos fotos; aquí es una sola entrada y va un poco más lenta para que se aprecie.
// Sin JavaScript o con movimiento reducido no hay bloques y la foto se ve desde el principio (CSS en AboutView).
function initPixelReveal() {
  document.querySelectorAll<HTMLElement>("[data-pixel-reveal]").forEach((frame) => {
    const blocks = frame.querySelectorAll<HTMLElement>(".px-grid span");
    const img = frame.querySelector<HTMLImageElement>("[data-pixel-target] img");
    if (!blocks.length || !img) return;
    if (reducedMotion() || !("IntersectionObserver" in window)) {
      frame.classList.add("is-pixel-done");
      return;
    }
    frame.classList.add("is-pixel-running");
    const STEP = 0.45; // segundos que tardan los bloques en tapar el marco, y otros tantos en apagarse
    let tl: gsap.core.Timeline | null = null;
    const play = async () => {
      await loaderDone;
      // La foto tiene que estar decodificada antes de quitar los bloques; si falla, se sigue igual
      const ready = img.decode().catch(() => undefined);
      tl = gsap.timeline();
      tl.to(blocks, { opacity: 1, duration: 0.01, stagger: { each: STEP / blocks.length, from: "random" } });
      await Promise.all([ready, tl.then()]);
      frame.classList.add("is-pixel-done");
      tl = gsap.timeline();
      tl.to(blocks, { opacity: 0, duration: 0.01, stagger: { each: STEP / blocks.length, from: "random" } }, 0.08);
      // La foto se asienta un poco mientras se descubre (escala 1.08 → 1)
      tl.fromTo(img, { scale: 1.08 }, { scale: 1, duration: 1.4, ease: "expo.out", clearProps: "scale" }, 0);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        play();
      },
      { threshold: 0.2 },
    );
    io.observe(frame);
    onCleanup(() => {
      io.disconnect();
      tl?.kill();
    });
  });
}

/* ---------- Cifras que cuentan al entrar en pantalla: data-count="6" (y data-count-from="36" para bajar) ---------- */
// El HTML ya trae el número final: sin JavaScript o con movimiento reducido se ve tal cual
function initCounters() {
  const els = document.querySelectorAll<HTMLElement>("[data-count]");
  if (!els.length || reducedMotion() || !("IntersectionObserver" in window)) return;
  // Formato del idioma de la página (1.3 / 1,3) con los mismos decimales que el valor final
  const lang = document.documentElement.lang || "en";
  const show = (el: HTMLElement, n: number) => (el.textContent = formatNumber(n, lang, decimalsOf(el.dataset.count!)));
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        io.unobserve(el);
        const v = { n: Number(el.dataset.countFrom ?? 0) };
        gsap.to(v, { n: Number(el.dataset.count), duration: 1.6, delay: 0.2, ease: "power3.out", onUpdate: () => show(el, v.n) });
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  els.forEach((el) => {
    show(el, Number(el.dataset.countFrom ?? 0));
    io.observe(el);
  });
  onCleanup(() => io.disconnect());
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
    scrollToY(0);
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
    scrollToY(target.getBoundingClientRect().top + scrollY);
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

    // Parallax de una foto dentro de su marco (About): la foto, más grande que el marco, baja más despacio que
    // la página, como la del hero del inicio. yPercent es relativo a la foto (114 % del marco): ±6 ≈ ±7 % del marco
    gsap.utils.toArray<HTMLElement>("[data-img-parallax]").forEach((el) => {
      gsap.fromTo(
        el,
        { yPercent: -6 },
        { yPercent: 6, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true } },
      );
    });

    // Parallax por capas del hero (referencia: osmo.supply, «Parallax Image Layers»): mientras el hero sale
    // de la pantalla cada capa baja un poco respecto al scroll. La 1 (fondo) es la que más se queda atrás
    // y la 4 (la foto) casi acompaña al scroll: eso da la sensación de profundidad.
    const LAYER_SHIFT: Record<string, number> = { "1": 60, "2": 40, "3": 22, "4": 8 };
    gsap.utils.toArray<HTMLElement>("[data-parallax-layers]").forEach((root) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true } });
      root.querySelectorAll<HTMLElement>("[data-parallax-layer]").forEach((layer) => {
        tl.to(layer, { yPercent: LAYER_SHIFT[layer.dataset.parallaxLayer ?? ""] ?? 0, ease: "none" }, 0);
      });
    });

    // Proceso (B): el wireframe se construye paso a paso mientras se leen los pasos (también en móvil)
    const process = document.querySelector<HTMLElement>("[data-process]");
    if (process) {
      const frame = process.querySelector<HTMLElement>("[data-process-frame]");
      const steps = process.querySelectorAll<HTMLElement>("[data-process-step]");
      // El total del presupuesto cuenta desde $0 cada vez que se llega al paso 2
      const total = frame?.querySelector<HTMLElement>("[data-quote-total]");
      const amount = Number(total?.dataset.quoteTotal ?? 0);
      const counter = { v: amount };
      const activate = (step: HTMLElement) => {
        const state = step.dataset.processStep!;
        if (total && state === "2" && frame?.dataset.state !== "2") {
          gsap.fromTo(counter, { v: 0 }, {
            v: amount, duration: 1, delay: 0.6, ease: "power2.out", overwrite: true,
            onUpdate: () => { total.textContent = `$${Math.round(counter.v).toLocaleString("en-US")}`; },
          });
        }
        frame?.setAttribute("data-state", state);
        steps.forEach((s) => s.classList.toggle("is-active", s === step));
      };
      // Si el marco aún no se ve, el chat empieza vacío y los mensajes entran cuando aparece la sección
      if (frame && process.getBoundingClientRect().top > innerHeight * 0.6) {
        frame.dataset.state = "0";
        ScrollTrigger.create({
          trigger: process, start: "top 60%", once: true,
          onEnter: () => { if (frame.dataset.state === "0") frame.dataset.state = "1"; },
        });
      }
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
      // La curva se aplana con scaleY (no con height): no obliga a recalcular la página en cada fotograma
      gsap.fromTo("[data-stage-lip]", { scaleY: 1 }, { scaleY: 0, ease: "none", scrollTrigger: { ...reveal, end: until(0.15) } });
      gsap.fromTo("[data-stage-shade]", { opacity: 1 }, { opacity: 0, ease: "none", scrollTrigger: { ...reveal, end: until(0) } });
      gsap.fromTo("[data-stage-inner]", { y: () => -innerHeight * 0.35 }, { y: 0, ease: "none", scrollTrigger: reveal });
      gsap.fromTo("[data-together-orb]", { x: () => innerWidth * 0.12 }, { x: 0, ease: "none", scrollTrigger: reveal });
    }
  });
  onCleanup(() => ctx.revert());

  // gsap.matchMedia rehace cada bloque si el ancho cruza el corte (girar la tableta, cambiar la ventana)
  const mm = gsap.matchMedia();
  mm.add({ mobile: "(max-width: 767px)", vertical: "(max-width: 1023px)", desktop: "(min-width: 1024px)" }, (ctx) => {
    const { mobile, vertical } = ctx.conditions as { mobile: boolean; vertical: boolean };

    if (mobile) {
      // Home, servicios en móvil: el título se pinta de gris a negro mientras la tarjeta sube por la pantalla
      gsap.utils.toArray<HTMLElement>("[data-svc-list] .price-row__title").forEach((title) => {
        gsap.fromTo(title, { "--paint": "100%" }, {
          "--paint": "0%", ease: "none",
          scrollTrigger: { trigger: title.closest("li"), start: "top 85%", end: "top 40%", scrub: true },
        });
      });

      // Página de servicios en móvil: la tarjeta de atrás se encoge y se oscurece mientras la siguiente la tapa
      const stack = gsap.utils.toArray<HTMLElement>("[data-stack-card]");
      stack.forEach((item, i) => {
        const next = stack[i + 1];
        if (!next) return;
        gsap.fromTo(item.firstElementChild, { scale: 1, "--shade": 0 }, {
          scale: 0.9, "--shade": 0.5, ease: "none",
          scrollTrigger: { trigger: next, start: "top bottom", end: "top 15%", scrub: true },
        });
      });
    }

    // Página de servicios, proceso: la línea de tiempo se llena con el scroll (vertical en tableta y
    // móvil) y enciende cada paso al alcanzarlo
    const line = document.querySelector<HTMLElement>("[data-timeline]");
    if (line) {
      const steps = line.querySelectorAll<HTMLElement>("[data-timeline-step]");
      const axis = vertical ? "scaleY" : "scaleX";
      gsap.fromTo(line.querySelector("[data-timeline-fill]"), { [axis]: 0 }, {
        [axis]: 1, ease: "none",
        scrollTrigger: {
          trigger: line, start: "top 70%", end: vertical ? "bottom 70%" : "top 20%", scrub: true,
          onUpdate: (self) => steps.forEach((s, i) => s.classList.toggle("is-on", self.progress >= Math.max(0.01, i * 0.29))),
        },
      });
    }
  });
  onCleanup(() => mm.revert());
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
    // data-curtain-text manda sobre el texto del enlace: el botón de idioma tiene dentro las dos etiquetas
    // que ruedan (EN y ES) y el telón decía «ENES»; con el atributo dice «Español» o «English».
    const source = e.sourceElement as HTMLElement | undefined;
    const text = (source?.dataset.curtainText ?? source?.textContent)?.trim();
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
  bindSmoothScroll();
  initLoader();
  document.addEventListener("astro:page-load", () => {
    // Astro ya movió el scroll de la página nueva: Lenis toma esa posición y las nuevas medidas
    lenis?.resize();
    lenis?.scrollTo(scrollY, { immediate: true, force: true });
    initHeader();
    initMenu();
    initTheme();
    initMagnetic();
    initServicePreview();
    initBento();
    initTilt();
    initPixelReveal();
    initCounters();
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
