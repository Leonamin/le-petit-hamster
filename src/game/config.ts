/**
 * Central tuning knobs for the prototype.
 * Keep gameplay constants here so designers can feel the world without
 * hunting through systems code.
 */
// Per-planet radius now lives in planets/registry.ts; the active planet's
// radius is threaded to the controller and props.
export const WALK_SPEED = 3.2; // world units / second along the surface

// How quickly the follow-camera eases to its target each frame (0..1).
// Lower = floatier. Distance/height/look/fov live in cameraConfig.ts (tunable).
export const CAM_SMOOTH = 0.08;
