import { Billboard } from "@react-three/drei";
import { useMemo } from "react";
import { AdditiveBlending, Color } from "three";

/**
 * A soft, camera-facing glow (corona) around a star. The trick behind the
 * "sun from Earth" look: the bright core stays small, but a big additive halo
 * makes it read as a brilliant, dazzling sun — light, not size, is what says
 * "this is the star". Falls off radially from the centre. Unlit + additive.
 */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uFalloff;
  varying vec2 vUv;
  void main() {
    float d = distance(vUv, vec2(0.5)) * 2.0; // 0 centre .. 1 edge
    float a = pow(clamp(1.0 - d, 0.0, 1.0), uFalloff);
    gl_FragColor = vec4(uColor * uIntensity, a);
  }
`;

interface Props {
  /** Side length of the glow quad (world units) — make it several × the core. */
  size: number;
  color?: string;
  intensity?: number;
  /** Higher = tighter glow concentrated near the core. */
  falloff?: number;
}

export function Corona({ size, color = "#ffdca6", intensity = 1.5, falloff = 2.6 }: Props) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(color) },
      uIntensity: { value: intensity },
      uFalloff: { value: falloff },
    }),
    [color, intensity, falloff],
  );

  return (
    <Billboard>
      <mesh>
        <planeGeometry args={[size, size]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </Billboard>
  );
}
