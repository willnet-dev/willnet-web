// Escena 3D de la sección «3D y movimiento» del inicio (se carga aparte; ver WStage.tsx).
// El isotipo W en cromo, extruido desde el SVG del logo: se inclina hacia el mouse y con el scroll de
// su sección sus tres piezas se separan, giran y se vuelven a unir. Hasta la ronda 21 vivía en el hero.
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "./utils";
import { StudioEnv } from "./StudioEnv";

// Coordenadas del isotipo (viewBox 416 × 290 del SVG de la marca)
const PIECES: [number, number][][] = [
  [[0, 0], [96, 37], [156, 203], [107, 290]],
  [[416, 0], [320, 37], [260, 203], [309, 290]],
  [[160, 64], [208, 83], [256, 64], [208, 174]],
];
const CENTER = { x: 208, y: 145 };
const SCALE = 1 / 95;
// Cuánto se aparta cada pata de la W cuando se separan
const SPREAD = 1;

function pieceGeometry(points: [number, number][]) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => {
    const px = (x - CENTER.x) * SCALE;
    const py = -(y - CENTER.y) * SCALE;
    if (i === 0) shape.moveTo(px, py);
    else shape.lineTo(px, py);
  });
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.55, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 4 });
  geo.translate(0, 0, -0.275);
  geo.computeVertexNormals();
  return geo;
}

// Avance del scroll (0 → 1) en la sección. Con data-w-progress="pin" el escenario se queda fijo
// mientras la sección pasa: el avance va de cuando se fija a cuando se suelta. Si no, va de cuando
// la sección asoma por abajo a cuando sale por arriba.
function sectionProgress(el: HTMLElement | null) {
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  const p = el.dataset.wProgress === "pin" ? -r.top / Math.max(1, r.height - innerHeight) : (innerHeight - r.top) / (innerHeight + r.height);
  return THREE.MathUtils.clamp(p, 0, 1);
}

function W({ sectionEl }: { sectionEl: HTMLElement | null }) {
  const group = useRef<THREE.Group>(null);
  const refs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  const geos = useMemo(() => PIECES.map(pieceGeometry), []);
  const theme = useTheme();
  // La pieza central toma el acento de los tokens CSS (lima en la paleta actual)
  const accent = useMemo(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#d4ff3a", [theme]);
  const pointer = useRef({ x: 0, y: 0 });
  // La W (4.4 × 3.05 unidades a escala 1) se centra en su escenario. Separada llega a medir unas
  // 6.4 unidades de ancho: la escala hace que aun así quepa con aire en el 82 % del escenario
  const { viewport } = useThree();
  const scale = Math.min((viewport.width * 0.82) / 6.4, (viewport.height * 0.6) / 3.05);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = sectionProgress(sectionEl);
    const sep = Math.sin(p * Math.PI); // 0 → 1 → 0: se separan y se vuelven a unir
    const t = state.clock.elapsedTime;
    const k = 1 - Math.pow(0.002, delta);

    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, pointer.current.x * 0.45 + sep * Math.PI * 1.1, k);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, pointer.current.y * 0.25 + Math.sin(t * 0.6) * 0.04, k);
    g.position.y = Math.sin(t * 0.8) * 0.06;

    const [l, r, c] = refs.map((ref) => ref.current);
    if (l && r && c) {
      l.position.x = THREE.MathUtils.lerp(l.position.x, -sep * SPREAD, k);
      l.rotation.z = THREE.MathUtils.lerp(l.rotation.z, sep * 0.5, k);
      r.position.x = THREE.MathUtils.lerp(r.position.x, sep * SPREAD, k);
      r.rotation.z = THREE.MathUtils.lerp(r.rotation.z, -sep * 0.5, k);
      c.position.y = THREE.MathUtils.lerp(c.position.y, -sep * 0.9, k);
      c.position.z = THREE.MathUtils.lerp(c.position.z, sep * 1.2, k);
      c.rotation.x = THREE.MathUtils.lerp(c.rotation.x, sep * Math.PI, k);
    }
  });

  const dark = theme === "dark";
  return (
    <group ref={group} scale={scale}>
      {geos.map((geo, i) => (
        <mesh key={i} ref={refs[i]} geometry={geo}>
          <meshPhysicalMaterial
            color={i === 2 ? accent : dark ? "#e8e8e8" : "#2b2b2e"}
            emissive={i === 2 ? accent : "#000000"}
            emissiveIntensity={i === 2 ? 0.35 : 0}
            metalness={i === 2 ? 0.1 : 1}
            roughness={i === 2 ? 0.3 : 0.08}
            clearcoat={1}
            clearcoatRoughness={0.08}
            envMapIntensity={dark ? 1.25 : 1.6}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function WScene({ running, mobile }: { running: boolean; mobile: boolean }) {
  const sectionEl = document.querySelector<HTMLElement>("[data-lab]");
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={mobile ? [1, 1.5] : [1, 2]}
      frameloop={running ? "always" : "never"}
      camera={{ position: [0, 0, mobile ? 8.2 : 6.6], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => document.querySelector("[data-w-fallback]")?.classList.add("is-hidden")}
      aria-hidden="true"
    >
      <ambientLight intensity={0.2} />
      <W sectionEl={sectionEl} />
      <StudioEnv size={mobile ? 128 : 256} />
    </Canvas>
  );
}
