// Escena 3D del inicio (se carga aparte, después de que la página ya se ve; ver HeroW.tsx).
// El isotipo W en cromo, extruido desde el SVG del logo: se inclina hacia el mouse y con el scroll
// sus tres piezas se separan, giran y se vuelven a unir.
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

function W({ heroEl }: { heroEl: HTMLElement | null }) {
  const group = useRef<THREE.Group>(null);
  const refs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  const geos = useMemo(() => PIECES.map(pieceGeometry), []);
  const theme = useTheme();
  // La pieza central toma el acento de los tokens CSS (lima en la paleta actual)
  const accent = useMemo(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#d4ff3a", [theme]);
  const pointer = useRef({ x: 0, y: 0 });
  // Pantallas anchas: la W a la derecha del texto. Tableta: arriba y centrada.
  // Móvil: de fondo, grande y centrada detrás del texto (decisión de Willder, 2026-10-26)
  const { viewport, size } = useThree();
  const wide = size.width >= 1100 && viewport.aspect > 1.15;
  const narrow = size.width < 768;
  // El isotipo mide 4.4 unidades de ancho a escala 1
  const baseX = wide ? viewport.width * 0.27 : 0;
  // En pantallas estrechas el canvas es más alto que la ventana: la W se coloca en píxeles desde arriba
  const unitsPerPx = viewport.height / size.height;
  const vh = typeof innerHeight !== "undefined" ? innerHeight : size.height;
  const baseY = wide ? 0.25 : viewport.height / 2 - (narrow ? 0.5 * vh : 72 + 0.23 * vh) * unitsPerPx;
  const scale = wide
    ? Math.min(1, (viewport.width * 0.3) / 4.4)
    : narrow
      ? Math.min((0.5 * vh * unitsPerPx) / 3.05, (viewport.width * 0.95) / 4.4)
      : Math.min((0.34 * vh * unitsPerPx) / 3.05, (viewport.width * 0.7) / 4.4);

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
    const h = heroEl?.offsetHeight || innerHeight;
    const p = THREE.MathUtils.clamp(scrollY / h, 0, 1);
    const sep = Math.sin(p * Math.PI); // 0 → 1 → 0: se separan y se vuelven a unir
    const t = state.clock.elapsedTime;
    const k = 1 - Math.pow(0.002, delta);

    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, pointer.current.x * 0.45 + p * Math.PI * 1.1, k);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, pointer.current.y * 0.25 + Math.sin(t * 0.6) * 0.04, k);
    g.position.x = baseX;
    g.position.y = baseY + Math.sin(t * 0.8) * 0.06 + p * 0.6;

    const [l, r, c] = refs.map((ref) => ref.current);
    if (l && r && c) {
      l.position.x = THREE.MathUtils.lerp(l.position.x, -sep * 1.3, k);
      l.rotation.z = THREE.MathUtils.lerp(l.rotation.z, sep * 0.5, k);
      r.position.x = THREE.MathUtils.lerp(r.position.x, sep * 1.3, k);
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

export default function HeroScene({ running, mobile }: { running: boolean; mobile: boolean }) {
  const heroEl = document.querySelector<HTMLElement>("[data-hero]");
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={mobile ? [1, 1.5] : [1, 2]}
      frameloop={running ? "always" : "never"}
      camera={{ position: [0, 0, mobile ? 8.2 : 6.6], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => document.querySelector("[data-hero-fallback]")?.classList.add("is-hidden")}
      aria-hidden="true"
    >
      <ambientLight intensity={0.2} />
      <W heroEl={heroEl} />
      <StudioEnv size={mobile ? 128 : 256} />
    </Canvas>
  );
}
