import { TunableKey, useCameraConfig } from "../game/cameraConfig";
import { useCameraDebug } from "../game/systems/useCameraDebug";

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
  { key: "turnRate", label: "선회 속도", keys: "9 / 0" },
];

export function CameraDebug() {
  useCameraDebug();
  const debug = useCameraConfig((s) => s.debug);
  const distance = useCameraConfig((s) => s.distance);
  const height = useCameraConfig((s) => s.height);
  const lookUp = useCameraConfig((s) => s.lookUp);
  const fov = useCameraConfig((s) => s.fov);
  const turnRate = useCameraConfig((s) => s.turnRate);

  if (!debug) {
    return <div className="debug-toggle">C — 카메라 디버그</div>;
  }

  const values = { distance, height, lookUp, fov, turnRate };
  const configLine = `distance:${distance} height:${height} lookUp:${lookUp} fov:${fov} turnRate:${turnRate}`;

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
      <div className="debug-copy">{configLine}</div>
    </div>
  );
}
