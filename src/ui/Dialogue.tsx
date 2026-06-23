import { useEffect } from "react";
import { useGame } from "../game/state";

/**
 * Storybook dialogue box with a typewriter reveal. Minimal per ART_DIRECTION.
 * Click the box, or press Space/Enter, to finish the line / advance.
 */
const CHAR_MS = 28; // typing speed

export function Dialogue() {
  const dialogue = useGame((s) => s.dialogue);
  const interact = useGame((s) => s.interact);
  const revealStep = useGame((s) => s.revealStep);

  const line = dialogue ? dialogue.lines[dialogue.index] : "";
  const revealed = dialogue?.revealed ?? 0;
  const done = !!dialogue && revealed >= line.length;
  const isLast = !!dialogue && dialogue.index === dialogue.lines.length - 1;

  // Type the current line out one character at a time.
  useEffect(() => {
    if (!dialogue || done) return;
    const id = window.setInterval(revealStep, CHAR_MS);
    return () => window.clearInterval(id);
  }, [dialogue, done, revealStep]);

  if (!dialogue) return null;

  return (
    <div className="dialogue" onClick={() => interact()}>
      <div className="dialogue-speaker">{dialogue.speaker}</div>
      <div className="dialogue-line">
        {line.slice(0, revealed)}
        {!done && <span className="dialogue-caret" />}
      </div>
      {done && (
        <div className="dialogue-cue">
          {isLast ? "스페이스 / 클릭 — 마치기" : "스페이스 / 클릭 — 계속"}
        </div>
      )}
    </div>
  );
}
