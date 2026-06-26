#!/usr/bin/env node
// Meshy text-to-3D for Le Petit Hamster.
// Usage: MESHY_API_KEY=... node scripts/meshy.mjs <slug> "<subject>" [pose]
//   pose: a-pose | t-pose  — only for a BIPED HUMANOID you intend to rig later
//   (Meshy auto-rig is humanoid-only; quadrupeds/non-humanoid aren't supported).
//   Omit for static props and all animals.
// Generates a PREVIEW (untextured geometry) — that *is* the flat-matte style we
// want, so we stop here. Downloads the .glb + thumbnail into the gitignored raw
// dump, and writes a committed <slug>.json archive (prompt + params + task id).
//
// ponytail: preview-only, no refine/texture step. Rigging forks here and Meshy
// only covers one branch — see .claude/skills/meshy-asset/SKILL.md "Animation".
// Add a --texture refine pass (mode:"refine", enable_pbr:false) ONLY for a biped
// NPC you'll feed to POST /openapi/v1/rigging (which needs a textured glb).
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://api.meshy.ai/openapi/v2/text-to-3d";

// The house style. "standard" model_type = smooth rounded silhouette (NOT
// faceted low-poly). Style words live in the prompt; the v2 API has no
// negative_prompt field, so we keep NEGATIVE only as an archived note.
const STYLE = "minimalist 3D model, smooth shading, simplified realistic shape, solid colors, matte, soft rounded silhouette, cute stylized aesthetic, game asset";
const NEGATIVE = "faceted, sharp edges, low-poly wireframe look, hyper-detailed, realistic fur texture, gritty, noisy, complex patterns";
const KEY = process.env.MESHY_API_KEY;
const [slug, subject, pose] = process.argv.slice(2);
if (!KEY) die("set MESHY_API_KEY");
if (!slug || !subject) die('usage: node scripts/meshy.mjs <slug> "<subject>" [a-pose|t-pose]');
if (pose && !["a-pose", "t-pose"].includes(pose)) die(`bad pose "${pose}" (a-pose|t-pose)`);

const PARAMS = {
  mode: "preview",
  ai_model: "latest",
  model_type: "standard",
  topology: pose ? "quad" : "triangle", // quad deforms better when rigged
  target_polycount: 15000,
  should_remesh: true,
  pose_mode: pose ?? "",
  target_formats: ["glb"],
};

const headers = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const prompt = `${subject}, ${STYLE}`;

const created = await api("POST", API, { ...PARAMS, prompt });
const id = created.result ?? created.id;
console.log(`task ${id} — polling…`);

let task;
for (;;) {
  await sleep(5000);
  task = await api("GET", `${API}/${id}`);
  process.stdout.write(`\r${task.status} ${task.progress ?? 0}%   `);
  if (["SUCCEEDED", "FAILED", "CANCELED"].includes(task.status)) break;
}
console.log();
if (task.status !== "SUCCEEDED") die(`task ${task.status}: ${task.task_error?.message ?? ""}`);

const rawDir = resolve(ROOT, "assets/meshy/raw", slug);
await mkdir(rawDir, { recursive: true });
await download(task.model_urls?.glb, resolve(rawDir, `${slug}.glb`));
await download(task.thumbnail_url, resolve(rawDir, `${slug}.png`));

const meta = {
  slug, subject, prompt, negative: NEGATIVE, params: PARAMS,
  task_id: id, ai_model: task.model, consumed_credits: task.consumed_credits,
  created_at: new Date().toISOString(), adopted: false,
};
await writeFile(resolve(ROOT, "assets/meshy", `${slug}.json`), JSON.stringify(meta, null, 2) + "\n");
console.log(`\n✓ raw  → assets/meshy/raw/${slug}/${slug}.glb`);
console.log(`✓ meta → assets/meshy/${slug}.json  (commit this)`);
console.log(`  adopt: flatten material to matte, decimate, copy to public/models/, set adopted:true`);

async function api(method, url, body) {
  const r = await fetch(url, { method, headers, body: body && JSON.stringify(body) });
  const text = await r.text();
  if (!r.ok) die(`${r.status} ${text}`);
  return text ? JSON.parse(text) : {};
}
async function download(url, path) {
  if (!url) die(`no url for ${path}`);
  const r = await fetch(url);
  if (!r.ok) die(`download ${r.status} ${url}`);
  await writeFile(path, Buffer.from(await r.arrayBuffer()));
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function die(msg) { console.error(`meshy: ${msg}`); process.exit(1); }
