import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("openHandsElectron", {
  isDev: Boolean(process.env.ELECTRON_DEV_URL),
  platform: process.platform,
});
