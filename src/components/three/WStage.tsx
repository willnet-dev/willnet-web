// La W 3D de la sección «3D y movimiento» del inicio (antes estaba en el hero; ronda 21, 2026-11-16).
// Este archivo es ligero: decide si se puede mostrar el 3D y, cuando el navegador está libre, carga la
// escena (WScene.tsx, con Three.js) en un archivo aparte. No se monta con movimiento reducido ni sin
// WebGL: en esos casos queda la W estática (SVG) de Astro.
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { canUseWebGL, prefersReducedMotion, useInView } from "./utils";

const WScene = lazy(() => import("./WScene"));

type Props = { pauseLabel: string; playLabel: string };

export default function WStage({ pauseLabel, playLabel }: Props) {
  const [ok, setOk] = useState(false);
  const [paused, setPaused] = useState(false);
  // El contenedor existe desde el principio para que el observador de pantalla lo vea:
  // fuera de pantalla la escena deja de dibujarse (ahora está a mitad de página, no arriba)
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap);

  useEffect(() => {
    if (prefersReducedMotion() || !canUseWebGL()) return;
    const start = () => setOk(true);
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (idle) idle(start, { timeout: 2500 });
    else setTimeout(start, 900);
  }, []);

  const mobile = typeof innerWidth !== "undefined" && innerWidth < 768;

  return (
    <div ref={wrap} className="absolute inset-0">
      {ok && (
        <>
          <Suspense fallback={null}>
            <WScene running={inView && !paused} mobile={mobile} />
          </Suspense>
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            aria-pressed={paused}
            aria-label={paused ? playLabel : pauseLabel}
            className="absolute bottom-4 right-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-line bg-surface/70 text-ink backdrop-blur hover:border-ink"
          >
            {paused ? (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /></svg>
            )}
          </button>
        </>
      )}
    </div>
  );
}
