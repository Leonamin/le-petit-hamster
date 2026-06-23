import { Vector3 } from "three";
import { create } from "zustand";

/**
 * Shared game state. The render loop (useFrame) mutates/reads this via
 * `useGame.getState()` without subscribing; React UI subscribes with the hook.
 * This is the bridge between the imperative 3D world and the declarative UI.
 */

export interface Interactable {
  id: string;
  /** World position on the planet surface. */
  position: Vector3;
  /** How close (world units) the hamster must be to interact. */
  radius: number;
  speaker: string;
  lines: string[];
}

interface ActiveDialogue {
  speaker: string;
  lines: string[];
  index: number;
}

interface GameState {
  interactables: Record<string, Interactable>;
  /** The interactable currently within range, if any. */
  nearbyId: string | null;
  dialogue: ActiveDialogue | null;

  register: (item: Interactable) => void;
  unregister: (id: string) => void;
  /** Called every frame by the controller; no-op if unchanged. */
  setNearby: (id: string | null) => void;
  /** Talk to whatever is nearby, or advance/close an open dialogue. */
  interact: () => void;
}

export const useGame = create<GameState>((set, get) => ({
  interactables: {},
  nearbyId: null,
  dialogue: null,

  register: (item) =>
    set((s) => ({ interactables: { ...s.interactables, [item.id]: item } })),

  unregister: (id) =>
    set((s) => {
      const next = { ...s.interactables };
      delete next[id];
      return {
        interactables: next,
        nearbyId: s.nearbyId === id ? null : s.nearbyId,
      };
    }),

  setNearby: (id) => {
    if (get().nearbyId !== id) set({ nearbyId: id });
  },

  interact: () => {
    const s = get();
    if (s.dialogue) {
      const next = s.dialogue.index + 1;
      set({
        dialogue:
          next >= s.dialogue.lines.length
            ? null
            : { ...s.dialogue, index: next },
      });
      return;
    }
    if (s.nearbyId) {
      const item = s.interactables[s.nearbyId];
      if (item) {
        set({ dialogue: { speaker: item.speaker, lines: item.lines, index: 0 } });
      }
    }
  },
}));
