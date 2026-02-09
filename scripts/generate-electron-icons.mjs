#!/usr/bin/env node
/**
 * Generates icon.icns (macOS) and icon.ico (Windows) from electron/icons/icon.png.
 * Requires: npm install sharp icon-gen
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import icongen from "icon-gen";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const iconsDir = path.join(rootDir, "electron", "icons");
const inputPng = path.join(iconsDir, "icon.png");

const SIZES = [16, 24, 32, 48, 64, 128, 256, 512, 1024];

async function main() {
  if (!fs.existsSync(inputPng)) {
    console.error("Missing electron/icons/icon.png. Add openhands_icon.png and run: cp openhands_icon.png electron/icons/icon.png");
    process.exit(1);
  }

  const tmpDir = path.join(iconsDir, ".icon-gen-src");
  fs.mkdirSync(tmpDir, { recursive: true });

  try {
    const image = sharp(inputPng);
    const metadata = await image.metadata();
    const size = Math.min(metadata.width || 1024, metadata.height || 1024, 1024);

    for (const s of SIZES) {
      await image
        .clone()
        .resize(s, s)
        .png()
        .toFile(path.join(tmpDir, `${s}.png`));
    }

    await icongen(tmpDir, iconsDir, {
      report: true,
      ico: { name: "icon", sizes: [16, 24, 32, 48, 64, 128, 256] },
      icns: { name: "icon", sizes: [16, 32, 64, 128, 256, 512, 1024] },
    });

    console.log("Generated electron/icons/icon.ico and electron/icons/icon.icns");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
