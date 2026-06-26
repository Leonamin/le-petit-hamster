#!/usr/bin/env node
// Meshy 3D for Le Petit Hamster. Three modes:
//   text:      MESHY_API_KEY=... node scripts/meshy.mjs <slug> "<subject>" [a-pose|t-pose]
//   image:     ... node scripts/meshy.mjs <slug> --image <file> [a-pose|t-pose]
//   retexture: ... node scripts/meshy.mjs <slug> --retexture <model.glb> --style <image>
//
// text/image emit an UNTEXTURED mesh (flat-matte house style — colour in-engine).
// Image mode reconstructs from a concept silhouette (fixes text-to-3D's limb-count
// hallucination on quadrupeds). Retexture bakes colour onto an existing mesh from a
// style image (remove_lighting → flat base colour, no shiny PBR) — use it to turn a
// grey "clay" preview into a coloured asset while keeping the geometry.
// Downloads .glb + thumbnail to the gitignored raw dump + a committed <slug>.json.
//
// Env overrides (text/image): MESHY_MODEL_TYPE=standard|lowpoly, MESHY_POLYCOUNT=<int>.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const API_TEXT = "https://api.meshy.ai/openapi/v2/text-to-3d";
const API_IMAGE = "https://api.meshy.ai/openapi/v1/image-to-3d";
const API_RETEX = "https://api.meshy.ai/openapi/v1/retexture";

const STYLE = "minimalist 3D model, smooth shading, simplified realistic shape, solid colors, matte, soft rounded silhouette, cute stylized aesthetic, game asset";
const NEGATIVE = "faceted, sharp edges, low-poly wireframe look, hyper-detailed, realistic fur texture, gritty, noisy, complex patterns";

const MODEL_TYPE = process.env.MESHY_MODEL_TYPE ?? "standard"; // or "lowpoly"
const POLYCOUNT = Number(process.env.MESHY_POLYCOUNT ?? 15000);

const KEY = process.env.MESHY_API_KEY;
if (!KEY) die("set MESHY_API_KEY");

const args = process.argv.slice(2);
const slug = args[0];
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const imagePath = args[1] === "--image" ? args[2] : null;
const retexModel = args[1] === "--retexture" ? args[2] : null;
const stylePath = flag("--style");
const subject = imagePath || retexModel ? null : args[1];
const pose = imagePath || retexModel ? flag("--pose") : args[2];

if (!slug || (retexModel ? !stylePath : imagePath ? !imagePath : !subject)) {
  die('usage: meshy.mjs <slug> "<subject>" [pose] | <slug> --image <file> [--pose p] | <slug> --retexture <glb> --style <image>');
}
if (pose && !["a-pose", "t-pose"].includes(pose)) die(`bad pose "${pose}" (a-pose|t-pose)`);

const headers = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

let endpoint, body, archive;
if (retexModel) {
  endpoint = API_RETEX;
  body = {
    model_url: await fileUri(retexModel),
    image_style_url: await fileUri(stylePath),
    ai_model: "latest",
    enable_pbr: false,
    remove_lighting: true, // flat base colour, no baked highlights
    target_formats: ["glb"],
  };
  archive = { mode: "retexture", source: retexModel, style: stylePath };
} else {
  const common = {
    ai_model: "latest",
    model_type: MODEL_TYPE,
    topology: pose ? "quad" : "triangle", // quad deforms better if later rigged
    target_polycount: POLYCOUNT,
    should_remesh: true,
    pose_mode: pose ?? "",
    target_formats: ["glb"],
  };
  if (imagePath) {
    endpoint = API_IMAGE;
    body = { ...common, image_url: await fileUri(imagePath), should_texture: false };
    archive = { mode: "image-to-3d", image: imagePath, params: common };
  } else {
    endpoint = API_TEXT;
    const prompt = `${subject}, ${STYLE}`;
    body = { ...common, mode: "preview", prompt };
    archive = { mode: "text-to-3d", subject, prompt, negative: NEGATIVE, params: common };
  }
}

const created = await api("POST", endpoint, body);
const id = created.result ?? created.id;
console.log(`task ${id} (${archive.mode}) — polling…`);

let task;
for (;;) {
  await sleep(5000);
  task = await api("GET", `${endpoint}/${id}`);
  process.stdout.write(`\r${task.status} ${task.progress ?? 0}%   `);
  if (["SUCCEEDED", "FAILED", "CANCELED"].includes(task.status)) break;
}
console.log();
if (task.status !== "SUCCEEDED") die(`task ${task.status}: ${task.task_error?.message ?? ""}`);

const rawDir = resolve(ROOT, "assets/meshy/raw", slug);
await mkdir(rawDir, { recursive: true });
await download(task.model_urls?.glb, resolve(rawDir, `${slug}.glb`));
await download(task.thumbnail_url, resolve(rawDir, `${slug}.png`));

await writeFile(
  resolve(ROOT, "assets/meshy", `${slug}.json`),
  JSON.stringify(
    { slug, ...archive, task_id: id, ai_model: task.model,
      consumed_credits: task.consumed_credits, created_at: new Date().toISOString(), adopted: false },
    null, 2,
  ) + "\n",
);
console.log(`\n✓ raw  → assets/meshy/raw/${slug}/${slug}.glb`);
console.log(`✓ meta → assets/meshy/${slug}.json  (commit this)`);

async function fileUri(path) {
  const buf = await readFile(resolve(path)).catch(() => die(`can't read ${path}`));
  const ext = extname(path).toLowerCase();
  const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".glb": "model/gltf-binary" }[ext];
  if (!mime) die(`unsupported file type ${ext}`);
  return `data:${mime};base64,${buf.toString("base64")}`;
}
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
