import { TunableKey, useCameraConfig } from "../game/cameraConfig";
import { useSystemConfig } from "../game/systemConfig";
import { useCameraDebug } from "../game/systems/useCameraDebug";
import { useSystemControls } from "../game/systems/useSystemControls";

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
  { key: "camFollow", label: "카메라 추적", keys: "O / P" },
];

export function CameraDebug() {
  useCameraDebug();
  useSystemControls(); // K/L/N/M work globally, even when this panel is closed
  const debug = useCameraConfig((s) => s.debug);
  const distance = useCameraConfig((s) => s.distance);
  const height = useCameraConfig((s) => s.height);
  const lookUp = useCameraConfig((s) => s.lookUp);
  const fov = useCameraConfig((s) => s.fov);
  const turnRate = useCameraConfig((s) => s.turnRate);
  const camFollow = useCameraConfig((s) => s.camFollow);

  const orbitOn = useSystemConfig((s) => s.orbitOn);
  const showOrbits = useSystemConfig((s) => s.showOrbits);
  const orbitScale = useSystemConfig((s) => s.orbitScale);
  const rainIntensity = useSystemConfig((s) => s.rainIntensity);

  if (!debug) {
    return <div className="debug-toggle">C — 디버그 · K 공전 · L 궤도선</div>;
  }

  const values = { distance, height, lookUp, fov, turnRate, camFollow };
  const configLine = `distance:${distance} height:${height} lookUp:${lookUp} fov:${fov} turnRate:${turnRate} camFollow:${camFollow}`;

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
        </tbody>
      </table>

      <div className="debug-copy">{configLine}</div>
    </div>
  );
}
