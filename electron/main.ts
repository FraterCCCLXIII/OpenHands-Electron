import { app, BrowserWindow } from "electron";
import { spawn, ChildProcess } from "node:child_process";
import fs from "node:fs";
import * as path from "node:path";
import waitOn from "wait-on";

const ELECTRON_URL = process.env.ELECTRON_DEV_URL;
const backendPort = 3000;
const isDev = Boolean(ELECTRON_URL);
const shouldStartBundledBackend = app.isPackaged;
let backendProcess: ChildProcess | null = null;

const getProductionIndex = () => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "frontend", "build", "index.html");
  }

  return path.join(__dirname, "..", "..", "frontend", "build", "index.html");
};

const getBackendDir = () => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "electron", "backend");
  }
  return path.join(__dirname, "..", "..", "electron", "backend");
};

const getPythonExecutable = () => {
  const backendDir = getBackendDir();
  const venvRoot = path.join(backendDir, ".venv");
  const binDir = path.join(venvRoot, process.platform === "win32" ? "Scripts" : "bin");
  const pythonName = process.platform === "win32" ? "python.exe" : "python";
  return path.join(binDir, pythonName);
};

const startBundledBackend = () => {
  if (!shouldStartBundledBackend) {
    return;
  }

  if (backendProcess) {
    return;
  }

  const pythonExecutable = getPythonExecutable();
  if (!fs.existsSync(pythonExecutable)) {
    throw new Error("Bundled backend is missing the Python executable.");
  }

  const child = spawn(
    pythonExecutable,
    [
      "-m",
      "uvicorn",
      "openhands.server.listen:app",
      "--host",
      "127.0.0.1",
      "--port",
      `${backendPort}`,
    ],
    {
      cwd: getBackendDir(),
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  backendProcess = child;
  child.stdout?.pipe(process.stdout);
  child.stderr?.pipe(process.stderr);

  child.on("exit", () => {
    backendProcess = null;
  });
};

const stopBundledBackend = () => {
  if (!backendProcess) {
    return;
  }

  backendProcess.kill();
  backendProcess = null;
};

const waitForBundledBackend = async () => {
  if (!shouldStartBundledBackend) {
    return;
  }

  await waitOn({
    resources: [`http://127.0.0.1:${backendPort}/api/options/config`],
    timeout: 30_000,
    interval: 1000,
  });
};

const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1260,
    height: 768,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "assets", "openhands_icon.png"),
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (isDev && ELECTRON_URL) {
    void mainWindow.loadURL(ELECTRON_URL);
    if (!app.isPackaged) {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  } else {
    void mainWindow.loadFile(getProductionIndex());
  }
};

const startApp = async () => {
  await waitForBundledBackend();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
};

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    startBundledBackend();
    void startApp();
  });

  app.on("before-quit", () => {
    stopBundledBackend();
  });
}
