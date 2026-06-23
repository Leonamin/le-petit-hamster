import { useEffect } from "react";
import { useSystemConfig } from "../systemConfig";

/**
 * Global keys for the star system:
 *   K — pause/resume celestial motion (공전)
 *   L — show/hide orbit rings (궤도선)
 *   N / M — slow down / speed up (공전 배속)
 */
export function useSystemControls(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useSystemConfig.getState();
      switch (e.code) {
        case "KeyK":
          s.toggleOrbit();
          break;
        case "KeyL":
          s.toggleOrbits();
          break;
        case "KeyN":
          s.nudgeScale(-0.25);
          break;
        case "KeyM":
          s.nudgeScale(0.25);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
