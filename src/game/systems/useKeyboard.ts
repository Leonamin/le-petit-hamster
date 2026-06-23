import { useEffect, useRef } from "react";

export interface MoveInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

const KEY_MAP: Record<string, keyof MoveInput> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
};

/**
 * Tiny keyboard hook returning a stable ref to the current movement state.
 * We use a ref (not state) so the render loop reads it without re-rendering.
 */
export function useKeyboard(): React.MutableRefObject<MoveInput> {
  const input = useRef<MoveInput>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const set = (code: string, value: boolean) => {
      const dir = KEY_MAP[code];
      if (dir) input.current[dir] = value;
    };
    const down = (e: KeyboardEvent) => set(e.code, true);
    const up = (e: KeyboardEvent) => set(e.code, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return input;
}
