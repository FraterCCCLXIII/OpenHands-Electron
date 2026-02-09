import { app, BrowserWindow } from "electron";
import * as path from "node:path";

const ELECTRON_URL = process.env.ELECTRON_DEV_URL;

const isDev = Boolean(ELECTRON_URL);

const getProductionIndex = () => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "frontend", "build", "index.html");
  }

  return path.join(__dirname, "..", "..", "frontend", "build", "index.html");
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

const startApp = () => {
  app.on("ready", createMainWindow);

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
  startApp();
}
