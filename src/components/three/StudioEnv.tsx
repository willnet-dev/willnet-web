// Entorno de luz para los reflejos de las escenas 3D.
import { useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

/**
 * Entorno de estudio para los reflejos del cromo: paneles de luz blancos y una franja lima,
 * convertidos en mapa de entorno con PMREM. Sustituye a <Environment> de drei (pesa mucho menos).
 */

export function StudioEnv({ accent = "#d4ff3a", size = 256 }: { accent?: string; size?: number }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const env = new THREE.Scene();
    env.background = new THREE.Color("#111114");
    const panel = (w: number, h: number, color: string, intensity: number, pos: [number, number, number], rotY = 0, rotX = 0) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
      m.position.set(...pos);
      m.rotation.set(rotX, rotY, 0);
      env.add(m);
    };
    // Paneles alrededor del objeto (como un estudio de fotografía) para que el cromo tenga qué reflejar
    panel(10, 3, "#ffffff", 3, [0, 5, 2], 0, Math.PI / 2);
    panel(4, 10, "#ffffff", 2.2, [-6, 0, 3], Math.PI / 2);
    panel(4, 10, "#ffffff", 1.2, [6, 0, 3], -Math.PI / 2);
    panel(8, 1, accent, 3, [5, -2, 0], -Math.PI / 2);
    panel(12, 6, "#ffffff", 1.4, [0, 0, 8], Math.PI);
    panel(12, 6, "#8a8a90", 1, [0, 0, -8]);
    panel(10, 10, "#3a3a40", 1, [0, -6, 0], 0, -Math.PI / 2);
    const pmrem = new THREE.PMREMGenerator(gl);
    const rt = pmrem.fromScene(env, 0.02, 0.1, 100, { size });
    scene.environment = rt.texture;
    return () => {
      scene.environment = null;
      rt.dispose();
      pmrem.dispose();
      env.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
      });
    };
  }, [gl, scene, accent, size]);
  return null;
}
