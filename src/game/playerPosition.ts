import { Vector3 } from "three";

/**
 * The hamster's current world position, written every frame by the controller
 * and read by effects that need to follow the player (rain, ambience, …).
 * Shared module state to avoid threading it through props.
 */
export const playerPosition = new Vector3(0, 8, 0);

/** Lightweight player state shared with non-React systems (audio, …). */
export const playerState = { speed: 0 };

/**
 * Per-frame debug snapshot written by the Hamster controller and read by the
 * CameraDebug overlay.  Updated every frame so the UI can show live values.
 */
export const playerDebug = {
  pos: new Vector3(),
  up: new Vector3(),
  head: new Vector3(),
  face: new Vector3(),
  headDotUp: 0,
  moving: false,
};
