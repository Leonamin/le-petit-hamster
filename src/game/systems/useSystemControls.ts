import { useEffect } from "react";
import { useSystemConfig } from "../systemConfig";
import { useGame } from "../state";

/**
 * Global keys for the star system:
 *   V — toggle free observation camera (자유 관찰)
 *   K — pause/resume celestial motion (공전)
 *   L — show/hide orbit rings (궤도선)
 *   N / M — slow down / speed up (공전 배속)
 *   1 / 2 — less / more rain (강수량; turns auto-weather off)
 *   3 — toggle auto-weather (time of day drives the rain)
 */
export function useSystemControls(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useSystemConfig.getState();
      switch (e.code) {
        case "KeyV":
          useGame.getState().toggleObserve();
          break;
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
        case "Digit1":
          s.nudgeRain(-0.1);
          s.setWeatherAuto(false);
          break;
        case "Digit2":
          s.nudgeRain(0.1);
          s.setWeatherAuto(false);
          break;
        case "Digit3":
          s.setWeatherAuto(!s.weatherAuto);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
