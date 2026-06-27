import { useEffect, useState } from "react";
import { TunableKey, useCameraConfig } from "../game/cameraConfig";
import { useSystemConfig } from "../game/systemConfig";
import { useCameraDebug } from "../game/systems/useCameraDebug";
import { useSystemControls } from "../game/systems/useSystemControls";
import { playerDebug } from "../game/playerPosition";

/**
 * Camera tuning overlay. Press C to toggle. Adjust each value with its keys,
 * fly the hamster around the planet, and when the view feels right, read the
 * numbers off the bottom line and hand them over to bake into cameraConfig.ts.
 */
const ROWS: { key: TunableKey; label: string; keys: string }[] = [
  { key: "distance", label: "거리 (뒤)", keys: "[ / ]" },
  { key: "height", label: "높이 (위)", keys: "- / =" },
  { key: "lookUp", label: "시선 높이", keys: "; / '" },
  { key: "fov", label: "시야각 FOV", keys: ", / ." },
  { key: "turnRate", label: "몸 선회", keys: "9 / 0" },
];

const f = (n: number) => n.toFixed(3);

export function CameraDebug() {
  useCameraDebug();
  useSystemControls(); // K/L/N/M work globally, even when this panel is closed
  const debug = useCameraConfig((s) => s.debug);
  const distance = useCameraConfig((s) => s.distance);
  const height = useCameraConfig((s) => s.height);
  const lookUp = useCameraConfig((s) => s.lookUp);
  const fov = useCameraConfig((s) => s.fov);
  const turnRate = useCameraConfig((s) => s.turnRate);

  const orbitOn = useSystemConfig((s) => s.orbitOn);
  const showOrbits = useSystemConfig((s) => s.showOrbits);
  const orbitScale = useSystemConfig((s) => s.orbitScale);
  const rainIntensity = useSystemConfig((s) => s.rainIntensity);
  const weatherAuto = useSystemConfig((s) => s.weatherAuto);

  // Tick at ~15 fps so the live position readout updates smoothly.
  const [, tick] = useState(0);
  useEffect(() => {
    if (!debug) return;
    let id: number;
    const loop = () => {
      tick((n) => n + 1);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [debug]);

  if (!debug) {
    return <div className="debug-toggle">C — 디버그 · V 관찰 · K 공전 · L 궤도선</div>;
  }

  const values = { distance, height, lookUp, fov, turnRate };
  const configLine = `distance:${distance} height:${height} lookUp:${lookUp} fov:${fov} turnRate:${turnRate}`;

  const d = playerDebug;

  return (
    <div className="debug-panel">
      <div className="debug-title">카메라 튜닝 — C로 닫기, \ 초기화</div>
      <table>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.key}>
              <td>{row.label}</td>
              <td className="debug-val">{values[row.key]}</td>
              <td className="debug-keys">{row.keys}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="debug-title" style={{ marginTop: 12 }}>항성계</div>
      <table>
        <tbody>
          <tr>
            <td>공전</td>
            <td className="debug-val">{orbitOn ? "ON" : "OFF"}</td>
            <td className="debug-keys">K</td>
          </tr>
          <tr>
            <td>궤도선</td>
            <td className="debug-val">{showOrbits ? "ON" : "OFF"}</td>
            <td className="debug-keys">L</td>
          </tr>
          <tr>
            <td>공전 배속</td>
            <td className="debug-val">{orbitScale}×</td>
            <td className="debug-keys">N / M</td>
          </tr>
          <tr>
            <td>강수량</td>
            <td className="debug-val">{rainIntensity}</td>
            <td className="debug-keys">1 / 2</td>
          </tr>
          <tr>
            <td>날씨 자동</td>
            <td className="debug-val">{weatherAuto ? "ON" : "OFF"}</td>
            <td className="debug-keys">3</td>
          </tr>
        </tbody>
      </table>

      <div className="debug-title" style={{ marginTop: 12 }}>플레이어 상태</div>
      <table>
        <tbody>
          <tr>
            <td>pos</td>
            <td className="debug-val" colSpan={3}>
              ({f(d.pos.x)}, {f(d.pos.y)}, {f(d.pos.z)})
            </td>
          </tr>
          <tr>
            <td>up</td>
            <td className="debug-val" colSpan={3}>
              ({f(d.up.x)}, {f(d.up.y)}, {f(d.up.z)})
            </td>
          </tr>
          <tr>
            <td>head</td>
            <td className="debug-val" colSpan={3}>
              ({f(d.head.x)}, {f(d.head.y)}, {f(d.head.z)})
            </td>
          </tr>
          <tr>
            <td>face</td>
            <td className="debug-val" colSpan={3}>
              ({f(d.face.x)}, {f(d.face.y)}, {f(d.face.z)})
            </td>
          </tr>
          <tr>
            <td>head·up</td>
            <td className="debug-val">{f(d.headDotUp)}</td>
          </tr>
          <tr>
            <td>이동중</td>
            <td className="debug-val">{d.moving ? "YES" : "NO"}</td>
          </tr>
        </tbody>
      </table>

      <div className="debug-copy">{configLine}</div>
    </div>
  );
}
