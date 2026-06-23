import { useMemo } from "react";
import { AdditiveBlending, Color } from "three";

/**
 * A thin fresnel rim-glow shell just above a planet, so it reads as a little
 * world wrapped in atmosphere. Glows at the grazing limb, transparent head-on,
 * so it haloes the planet's edge without washing the ground. Additive blend.
 */
const vertexShader = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  void main() {
    float rim = 1.0 - max(dot(normalize(vNormalW), normalize(vViewDir)), 0.0);
    float f = pow(rim, uPower);
    gl_FragColor = vec4(uColor, f * uIntensity);
  }
`;

interface Props {
  radius: number;
  color: string;
  power?: number;
  intensity?: number;
}

export function Atmosphere({ radius, color, power = 2.6, intensity = 0.9 }: Props) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(color) },
      uPower: { value: power },
      uIntensity: { value: intensity },
    }),
    [color, power, intensity],
  );

  return (
    <mesh scale={radius * 1.06}>
      <sphereGeometry args={[1, 48, 48]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  );
}
