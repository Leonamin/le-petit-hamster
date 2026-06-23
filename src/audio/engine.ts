/**
 * Procedural audio engine — no audio files. A single AudioContext (started on
 * the first user gesture) with a master gain. One "ambience" plays at a time
 * and crossfades when you travel: rain on the Rain Planet, a slow tick + drone
 * on the Clock Planet. Plus soft footsteps while walking.
 */

interface Ambience {
  id: string;
  gain: GainNode;
  stop: () => void;
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let footBuffer: AudioBuffer | null = null;
let current: Ambience | null = null;
let pendingId: string | null = null;

export function ensureAudio(): void {
  if (ctx) return;
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  // Short noise burst reused for footsteps.
  footBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
  const data = footBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  if (pendingId) applyAmbience(pendingId);
}

export function setAmbience(id: string): void {
  if (!ctx) {
    pendingId = id; // remember until audio starts
    return;
  }
  applyAmbience(id);
}

function applyAmbience(id: string): void {
  if (!ctx || !master || current?.id === id) return;

  if (current) {
    const old = current;
    const t = ctx.currentTime;
    old.gain.gain.cancelScheduledValues(t);
    old.gain.gain.setValueAtTime(old.gain.gain.value, t);
    old.gain.gain.linearRampToValueAtTime(0, t + 1.2);
    window.setTimeout(() => old.stop(), 1400);
  }

  const next = createAmbience(ctx, id);
  if (!next) {
    current = null;
    return;
  }
  next.gain.connect(master);
  next.gain.gain.setValueAtTime(0, ctx.currentTime);
  next.gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.5);
  current = next;
}

function createAmbience(c: AudioContext, id: string): Ambience | null {
  if (id === "rain") return createRain(c, id);
  if (id === "clock") return createClock(c, id);
  return null;
}

/** Soft, breathing filtered-noise rain. */
function createRain(c: AudioContext, id: string): Ambience {
  const gain = c.createGain();
  const vol = c.createGain();
  vol.gain.value = 0.12;

  const buffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const lowpass = c.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 2000;
  lowpass.Q.value = 0.4;

  const lfo = c.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoDepth = c.createGain();
  lfoDepth.gain.value = 450;
  lfo.connect(lfoDepth).connect(lowpass.frequency);

  noise.connect(lowpass).connect(vol).connect(gain);
  noise.start();
  lfo.start();

  return {
    id,
    gain,
    stop: () => {
      noise.stop();
      lfo.stop();
    },
  };
}

/** A slow tick-tock over a soft, faintly beating drone. */
function createClock(c: AudioContext, id: string): Ambience {
  const gain = c.createGain();

  // Low drone — two slightly detuned sines for a gentle beat.
  const droneVol = c.createGain();
  droneVol.gain.value = 0.05;
  const o1 = c.createOscillator();
  o1.type = "sine";
  o1.frequency.value = 110;
  const o2 = c.createOscillator();
  o2.type = "sine";
  o2.frequency.value = 110.4;
  o1.connect(droneVol);
  o2.connect(droneVol);
  droneVol.connect(gain);
  o1.start();
  o2.start();

  // Tick-tock: a short blip each second, alternating pitch.
  let n = 0;
  const interval = window.setInterval(() => {
    const t = c.currentTime;
    const osc = c.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = n % 2 ? 880 : 1120;
    const env = c.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.05, t + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(env).connect(gain);
    osc.start(t);
    osc.stop(t + 0.1);
    n++;
  }, 1000);

  return {
    id,
    gain,
    stop: () => {
      o1.stop();
      o2.stop();
      window.clearInterval(interval);
    },
  };
}

/** A soft, low footstep tap. */
export function footstep(): void {
  if (!ctx || !master || !footBuffer) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = footBuffer;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 450;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.07, t);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  src.connect(lowpass).connect(env).connect(master);
  src.start(t);
  src.stop(t + 0.15);
}
