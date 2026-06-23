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
  /** Prompt shown while in range, e.g. "스페이스 — 말 걸기". */
  prompt: string;
  /** Optional storybook lines shown when interacted with. */
  speaker?: string;
  lines?: string[];
  /** Optional side-effect fired the instant the hamster interacts. */
  onInteract?: () => void;
}

interface ActiveDialogue {
  speaker: string;
  lines: string[];
  index: number;
  /** Characters of the current line revealed so far (typewriter). */
  revealed: number;
}

interface GameState {
  interactables: Record<string, Interactable>;
  /** The interactable currently within range, if any. */
  nearbyId: string | null;
  dialogue: ActiveDialogue | null;
  /** Ids of friends that have been gently woken. */
  awakenedFriends: string[];
  /** True while the leave-planet fade is playing. */
  departing: boolean;
  /** Bumped on each departure/arrival; controllers reset when it changes. */
  planetEpoch: number;
  /** Index of the active planet in the registry. */
  currentPlanet: number;
  /** Number of planets in the registry (set once by App). */
  planetCount: number;

  register: (item: Interactable) => void;
  unregister: (id: string) => void;
  /** Called every frame by the controller; no-op if unchanged. */
  setNearby: (id: string | null) => void;
  /** Talk to whatever is nearby, or advance/close an open dialogue. */
  interact: () => void;
  /** Reveal one more character of the current line (typewriter). */
  revealStep: () => void;
  awakenFriend: (id: string) => void;
  leavePlanet: () => void;
}

export const useGame = create<GameState>((set, get) => ({
  interactables: {},
  nearbyId: null,
  dialogue: null,
  awakenedFriends: [],
  departing: false,
  planetEpoch: 0,
  currentPlanet: 0,
  planetCount: 1,

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
    if (s.departing) return;

    if (s.dialogue) {
      const line = s.dialogue.lines[s.dialogue.index];
      if (s.dialogue.revealed < line.length) {
        // Still typing → reveal the whole line first.
        set({ dialogue: { ...s.dialogue, revealed: line.length } });
        return;
      }
      const next = s.dialogue.index + 1;
      set({
        dialogue:
          next >= s.dialogue.lines.length
            ? null
            : { ...s.dialogue, index: next, revealed: 0 },
      });
      return;
    }

    if (s.nearbyId) {
      const item = s.interactables[s.nearbyId];
      if (!item) return;
      item.onInteract?.();
      if (item.lines && item.lines.length > 0) {
        set({
          dialogue: { speaker: item.speaker ?? "", lines: item.lines, index: 0, revealed: 0 },
        });
      }
    }
  },

  revealStep: () =>
    set((s) => {
      if (!s.dialogue) return {};
      const len = s.dialogue.lines[s.dialogue.index].length;
      if (s.dialogue.revealed >= len) return {};
      return { dialogue: { ...s.dialogue, revealed: s.dialogue.revealed + 1 } };
    }),

  awakenFriend: (id) =>
    set((s) =>
      s.awakenedFriends.includes(id)
        ? s
        : { awakenedFriends: [...s.awakenedFriends, id] },
    ),

  leavePlanet: () => {
    if (get().departing) return;
    // Fade out (CSS ~1.2s) → swap to the next planet while black → fade in.
    set({ departing: true, dialogue: null, nearbyId: null });
    window.setTimeout(() => {
      set((s) => ({
        planetEpoch: s.planetEpoch + 1,
        currentPlanet: (s.currentPlanet + 1) % Math.max(1, s.planetCount),
      }));
      window.setTimeout(() => set({ departing: false }), 450);
    }, 1300);
  },
}));
