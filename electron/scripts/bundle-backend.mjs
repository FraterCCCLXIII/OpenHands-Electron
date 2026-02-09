import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..", "..");
const backendSrcDir = rootDir;
const backendDestDir = path.join(rootDir, "electron", "backend");

const pathsToCopy = [
  "pyproject.toml",
  "poetry.lock",
  "Makefile",
  "openhands",
  "openhands-cli",
  "scripts",
];

const ensureDir = (dir) => {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
};

const copyPaths = () => {
  ensureDir(backendDestDir);

  for (const relative of pathsToCopy) {
    const src = path.join(backendSrcDir, relative);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(backendDestDir, relative);
    fs.cpSync(src, dest, { recursive: true });
  }
};

const installDependencies = () => {
  const env = { ...process.env, POETRY_VIRTUALENVS_IN_PROJECT: "true" };
  const result = spawnSync("poetry", ["install", "--without", "dev", "--no-root"], {
    cwd: backendDestDir,
    stdio: "inherit",
    env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const main = () => {
  copyPaths();
  installDependencies();
  console.log("Bundled backend into electron/backend");
};

main();
