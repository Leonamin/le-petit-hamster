import { useGame } from "../game/state";

/** Full-screen fade used for leaving a planet. Driven by CSS opacity. */
export function Fade() {
  const departing = useGame((s) => s.departing);
  return <div className="fade" data-active={departing} />;
}
