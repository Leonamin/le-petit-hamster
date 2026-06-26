#!/usr/bin/env node
// Concept-image generator for the Meshy image-to-3D pipeline (OpenAI gpt-image-2).
// Usage: OPENAI_API_KEY=... node scripts/concept.mjs <slug> "<subject>"
// Saves the PNG (plain white bg — clean image-to-3D input) + the full prompt, so
// you can review it in the file explorer and coach. Then feed the PNG to
// scripts/meshy.mjs <slug> --image assets/meshy/concepts/<slug>.png
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://api.openai.com/v1/images/generations";

// Concept house style — aim the image at the cute HammyHome look AND at being a
// clean image-to-3D input (single centred subject, plain background, clear
// silhouette). Tune this string as we coach the look.
const STYLE = "cute HammyHome-style game character, simple rounded chibi proportions, soft smooth forms, flat solid colors, minimal surface detail, gentle even lighting, single centred subject, full body in frame, clear readable silhouette, plain flat solid white background, no text, no ground shadow";

const KEY = process.env.OPENAI_API_KEY;
const [slug, subject] = process.argv.slice(2);
if (!KEY) die("set OPENAI_API_KEY");
if (!slug || !subject) die('usage: concept.mjs <slug> "<subject>"');

const prompt = `${subject}. ${STYLE}`;
const r = await fetch(API, {
  method: "POST",
  headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "gpt-image-2",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "high",
  }),
});
const text = await r.text();
if (!r.ok) die(`${r.status} ${text}`);
const out = JSON.parse(text).data?.[0];
if (!out) die(`no image in response: ${text.slice(0, 300)}`);

const dir = resolve(ROOT, "assets/meshy/concepts");
await mkdir(dir, { recursive: true });
const png = resolve(dir, `${slug}.png`);
const bytes = out.b64_json
  ? Buffer.from(out.b64_json, "base64")
  : Buffer.from(await (await fetch(out.url)).arrayBuffer());
await writeFile(png, bytes);
await writeFile(resolve(dir, `${slug}.txt`), prompt + "\n");

console.log(`✓ image  → assets/meshy/concepts/${slug}.png  (open in your file explorer)`);
console.log(`✓ prompt → assets/meshy/concepts/${slug}.txt`);
console.log(`  then: node --env-file=.env scripts/meshy.mjs ${slug} --image assets/meshy/concepts/${slug}.png`);

function die(msg) { console.error(`concept: ${msg}`); process.exit(1); }
