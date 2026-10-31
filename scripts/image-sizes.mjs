// Writes src/data/image-sizes.json: pixel size of every portfolio image under public/work,
// so pages can reserve the exact box (no layout shift) without reading files at runtime.
// Run after adding or replacing images: node scripts/image-sizes.mjs
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import sharp from "sharp";

const root = new URL("../public", import.meta.url).pathname;
const files = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(webp|png|jpe?g)$/.test(f) ? [p] : [];
  });

const sizes = {};
for (const f of files(join(root, "work")).sort()) {
  const { width, height } = await sharp(f).metadata();
  sizes["/" + relative(root, f)] = [width, height];
}
writeFileSync(new URL("../src/data/image-sizes.json", import.meta.url), JSON.stringify(sizes, null, 0) + "\n");
console.log(Object.keys(sizes).length, "images");
