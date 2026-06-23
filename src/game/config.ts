/**
 * Central tuning knobs for the prototype.
 * Keep gameplay constants here so designers can feel the world without
 * hunting through systems code.
 */
export const PLANET_RADIUS = 8;

export const WALK_SPEED = 3.2; // world units / second along the surface

// Camera lives close to the ground and looks slightly upward (ART_DIRECTION).
export const CAM_DISTANCE = 5.5;
export const CAM_HEIGHT = 1.6;
export const CAM_LOOK_UP = 1.4; // how far above the hamster the camera aims
export const CAM_SMOOTH = 0.08; // 0..1 lerp factor; lower = floatier
