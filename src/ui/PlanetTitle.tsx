import { useGame } from "../game/state";
import { PLANETS } from "../game/planets/registry";

/**
 * Shows the planet's name + theme on arrival, then fades — a storybook chapter
 * heading. Re-keying on the planet index restarts the CSS fade each time.
 */
export function PlanetTitle() {
  const index = useGame((s) => s.currentPlanet);
  const planet = PLANETS[index];
  if (!planet) return null;

  return (
    <div key={index} className="planet-title">
      <div className="planet-name">{planet.name}</div>
      <div className="planet-theme">{planet.theme}</div>
    </div>
  );
}
