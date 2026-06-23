import { useEffect } from "react";
import { TunableKey, useCameraConfig } from "../cameraConfig";

/**
 * Keyboard tuning for the camera debug overlay. Toggle with C; while open,
 * nudge each parameter with its key pair. Values persist to localStorage.
 */
const NUDGES: Record<string, [TunableKey, number]> = {
  BracketLeft: ["distance", -0.25],
  BracketRight: ["distance", 0.25],
  Minus: ["height", -0.2],
  Equal: ["height", 0.2],
  Semicolon: ["lookUp", -0.2],
  Quote: ["lookUp", 0.2],
  Comma: ["fov", -2],
  Period: ["fov", 2],
  Digit9: ["turnRate", -0.5],
  Digit0: ["turnRate", 0.5],
};

export function useCameraDebug(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const store = useCameraConfig.getState();

      if (e.code === "KeyC") {
        store.toggleDebug();
        return;
      }
      if (!store.debug) return;

      if (e.code === "Backslash") {
        e.preventDefault();
        store.reset();
        return;
      }
      const nudge = NUDGES[e.code];
      if (nudge) {
        e.preventDefault();
        store.nudge(nudge[0], nudge[1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
