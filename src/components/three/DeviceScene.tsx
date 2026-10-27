// Escena 3D del portafolio (opción C), cargada aparte por DeviceShowcase.tsx: una laptop y un
// teléfono con las capturas reales, que giran y cambian al proyecto que está en pantalla.
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "./utils";
import { StudioEnv } from "./StudioEnv";

export type Item = { slug: string; desktop: string; mobile: string };
type Props = { items: Item[] };

function Screen({ map, width, height, z }: { map: THREE.Texture; width: number; height: number; z: number }) {
  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={map} toneMapped={false} />
    </mesh>
  );
}

function RoundedBox({ args, radius, smoothness = 4, position, children }: { args: [number, number, number]; radius: number; smoothness?: number; position?: [number, number, number]; children: React.ReactNode }) {
  const geo = useMemo(() => new RoundedBoxGeometry(args[0], args[1], args[2], smoothness, radius), [args[0], args[1], args[2], radius, smoothness]);
  return (
    <mesh geometry={geo} position={position}>
      {children}
    </mesh>
  );
}

function Devices({ items, active }: Props & { active: number }) {
  const desktopMaps = useLoader(THREE.TextureLoader, items.map((i) => i.desktop));
  const mobileMaps = useLoader(THREE.TextureLoader, items.map((i) => i.mobile));
  useMemo(() => {
    [...desktopMaps, ...mobileMaps].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
    });
  }, [desktopMaps, mobileMaps]);

  const theme = useTheme();
  const laptop = useRef<THREE.Group>(null);
  const phone = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const lapY = useRef(-0.35);
  const phoneY = useRef(0.45);
  const shown = useRef(active);
  const [visible, setVisible] = useState(active);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, []);

  // Al cambiar de proyecto: media vuelta, cambio de captura y vuelta a su sitio
  useEffect(() => {
    if (active !== shown.current) spin.current = Math.PI;
  }, [active]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const k = 1 - Math.pow(0.001, delta);
    spin.current = THREE.MathUtils.lerp(spin.current, 0, 1 - Math.pow(0.02, delta));
    if (spin.current < Math.PI / 2 && shown.current !== active) {
      shown.current = active;
      setVisible(active);
    }
    const px = pointer.current.x;
    const py = pointer.current.y;
    lapY.current = THREE.MathUtils.lerp(lapY.current, -0.35 + px * 0.25, k);
    phoneY.current = THREE.MathUtils.lerp(phoneY.current, 0.45 + px * 0.45, k);
    if (laptop.current) {
      // El giro del cambio de proyecto (spin, de π a 0) se suma a la inclinación hacia el mouse
      laptop.current.rotation.y = lapY.current + spin.current;
      laptop.current.rotation.x = THREE.MathUtils.lerp(laptop.current.rotation.x, 0.12 + py * 0.08, k);
      laptop.current.position.y = -0.2 + Math.sin(t * 0.7) * 0.05;
    }
    if (phone.current) {
      phone.current.rotation.y = phoneY.current - spin.current;
      phone.current.rotation.z = -0.08 + Math.sin(t * 0.9) * 0.03;
      phone.current.position.y = 0.15 + Math.sin(t * 0.9 + 1) * 0.09 - py * 0.12;
      phone.current.position.x = 1.55 + px * 0.15;
    }
  });

  const body = theme === "dark" ? "#2a2a2e" : "#c9c8c2";
  const metal = { color: body, metalness: 0.8, roughness: 0.35 };

  return (
    <>
      <group ref={laptop} position={[-0.55, -0.2, 0]}>
        {/* Base */}
        <RoundedBox args={[3.3, 0.1, 2.2]} radius={0.05} position={[0, -1.02, 0.95]}>
          <meshStandardMaterial {...metal} />
        </RoundedBox>
        {/* Tapa con pantalla */}
        <group position={[0, -1, -0.12]} rotation-x={-0.12}>
          <RoundedBox args={[3.3, 2.05, 0.08]} radius={0.05} position={[0, 1.02, 0]}>
            <meshStandardMaterial {...metal} />
          </RoundedBox>
          <group position={[0, 1.04, 0.045]}>
            <mesh>
              <planeGeometry args={[3.16, 1.92]} />
              <meshBasicMaterial color="#050506" />
            </mesh>
            <Screen map={desktopMaps[visible]} width={3.04} height={1.71} z={0.002} />
          </group>
        </group>
      </group>

      <group ref={phone} position={[1.55, 0.15, 0.9]}>
        <RoundedBox args={[0.82, 1.68, 0.09]} radius={0.1} smoothness={6}>
          <meshStandardMaterial color={theme === "dark" ? "#1c1c1f" : "#dcdbd5"} metalness={0.7} roughness={0.3} />
        </RoundedBox>
        <Screen map={mobileMaps[visible]} width={0.72} height={1.56} z={0.047} />
      </group>
    </>
  );
}

export default function DeviceScene({ items, active, running }: Props & { active: number; running: boolean }) {
  return (
    <Canvas dpr={[1, 1.75]} frameloop={running ? "always" : "never"} camera={{ position: [0, 0.2, 7.6], fov: 38 }} gl={{ antialias: true, alpha: true }} aria-hidden="true">
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <Suspense fallback={null}>
        <Devices items={items} active={active} />
        <StudioEnv size={128} />
      </Suspense>
    </Canvas>
  );
}
