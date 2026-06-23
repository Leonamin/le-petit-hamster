import { useGame } from "../game/state";

/**
 * Storybook dialogue box. Minimal per ART_DIRECTION ("Excessive UI" to avoid).
 * Click the box, or press Space/Enter, to advance.
 */
export function Dialogue() {
  const dialogue = useGame((s) => s.dialogue);
  const interact = useGame((s) => s.interact);

  if (!dialogue) return null;

  const line = dialogue.lines[dialogue.index];
  const isLast = dialogue.index === dialogue.lines.length - 1;

  return (
    <div className="dialogue" onClick={() => interact()}>
      <div className="dialogue-speaker">{dialogue.speaker}</div>
      <div className="dialogue-line">{line}</div>
      <div className="dialogue-cue">
        {isLast ? "스페이스 / 클릭 — 마치기" : "스페이스 / 클릭 — 계속"}
      </div>
    </div>
  );
}
