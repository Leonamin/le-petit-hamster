import { useEffect } from "react";
import { PLANETS } from "../game/planets/registry";
import { playerState } from "../game/playerPosition";
import { useGame } from "../game/state";
import { ensureAudio, footstep, setAmbience } from "./engine";

/**
 * Wires the audio engine to the game: starts it on the first gesture (browser
 * autoplay policy), crossfades the ambience to match the active planet, and
 * taps a footstep at a walking cadence while the hamster moves.
 */
export function useAudio(): void {
  const planetId = useGame((s) => PLANETS[s.currentPlanet]?.id);

  useEffect(() => {
    const start = () => ensureAudio();
    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, []);

  useEffect(() => {
    if (planetId) setAmbience(planetId);
  }, [planetId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (playerState.speed > 0.5) footstep();
    }, 280);
    return () => window.clearInterval(interval);
  }, []);
}
