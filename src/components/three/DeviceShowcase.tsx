// Escena 3D del portafolio (opción C). Este archivo es ligero: activa la escena solo en escritorio,
// con WebGL y sin movimiento reducido, y carga DeviceScene.tsx (con Three.js) en un archivo aparte.
// Si no se activa, la lista del portafolio usa capturas planas dentro de un teléfono (CSS).
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { canUseWebGL, prefersReducedMotion, useInView } from "./utils";
import type { Item } from "./DeviceScene";

const DeviceScene = lazy(() => import("./DeviceScene"));

type Props = { items: Item[] };

export default function DeviceShowcase({ items }: Props) {
  const [ok, setOk] = useState(false);
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap);

  useEffect(() => {
    if (prefersReducedMotion() || !matchMedia("(min-width: 1024px)").matches) return;
    if (canUseWebGL()) setOk(true);
    else document.documentElement.classList.add("no-showcase");
  }, []);

  // El proyecto activo es el que está en el centro de la pantalla
  useEffect(() => {
    if (!ok) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-showcase-item]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = items.findIndex((it) => it.slug === (entry.target as HTMLElement).dataset.showcaseItem);
          if (i >= 0) {
            setActive(i);
            els.forEach((el) => el.classList.toggle("is-active", el === entry.target));
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ok, items]);

  if (!ok) return null;

  return (
    <div ref={wrap} className="h-full w-full">
      <Suspense fallback={null}>
        <DeviceScene items={items} active={active} running={inView} />
      </Suspense>
    </div>
  );
}
