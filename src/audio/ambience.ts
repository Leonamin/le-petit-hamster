/**
 * Procedural rain ambience — no audio asset required (fits the "no assets"
 * philosophy). Looping filtered white noise with a slowly drifting cutoff so it
 * "breathes" rather than sounding like static. Web Audio (not Howler) because
 * we synthesise the sound rather than play a file.
 *
 * Browsers block audio until a user gesture, so this is started from the first
 * pointer/key event (see useAmbience).
 */

let started = false;

export function startAmbience(): void {
  if (started) return;
  started = true;

  const ctx = new AudioContext();

  // ~2s of white noise, looped.
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  // Lowpass turns hiss into soft rain.
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 2000;
  lowpass.Q.value = 0.4;

  const master = ctx.createGain();
  master.gain.value = 0;

  noise.connect(lowpass).connect(master).connect(ctx.destination);

  // Slow LFO drifts the cutoff (~1550–2450 Hz) for a living, breathing rain.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 450;
  lfo.connect(lfoDepth).connect(lowpass.frequency);

  noise.start();
  lfo.start();

  // Gentle fade-in so it eases into the scene.
  master.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 3);
}
