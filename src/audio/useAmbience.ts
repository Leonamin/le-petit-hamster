import { useEffect } from "react";
import { startAmbience } from "./ambience";

/**
 * Starts the rain ambience on the first user gesture (browser autoplay policy).
 * `startAmbience` is idempotent, so StrictMode double-mounting is harmless.
 */
export function useAmbience(): void {
  useEffect(() => {
    const start = () => startAmbience();
    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, []);
}
