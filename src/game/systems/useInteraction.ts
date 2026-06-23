import { useEffect } from "react";
import { useGame } from "../state";

/**
 * Global interaction input: Space / Enter to talk or advance dialogue.
 * (Clicking the dialogue box also advances it — see ui/Dialogue.tsx.)
 */
export function useInteraction(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return; // holding the key shouldn't skip lines
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        useGame.getState().interact();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
