import { Vector3 } from "three";

/**
 * The hamster's current world position, written every frame by the controller
 * and read by effects that need to follow the player (rain, ambience, …).
 * Shared module state to avoid threading it through props.
 */
export const playerPosition = new Vector3(0, 8, 0);

/** Lightweight player state shared with non-React systems (audio, …). */
export const playerState = { speed: 0 };
