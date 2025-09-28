import { app, nativeTheme, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

let mainWindow: BrowserWindow | null = null;

function getPreloadPath(): string {
  // __dirname at runtime will be `out/main`
  // preload output is `out/preload/index.cjs`
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return join(__dirname, "../preload/index.cjs");
}

function getRendererUrl(): string {
  const devServerUrl = process.env.ELECTRON_RENDERER_URL;
  if (devServerUrl) return devServerUrl;
  // packaged: load file from out/renderer/index.html
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return `file://${join(__dirname, "../renderer/index.html")}`;
}

function createMainWindow() {
  if (mainWindow) return;

  const ASPECT_RATIO = 16 / 9;
  const MIN_WIDTH = 1000;
  const INITIAL_WIDTH = 1000;
  const INITIAL_HEIGHT = Math.round(INITIAL_WIDTH / ASPECT_RATIO);
  const MIN_HEIGHT = Math.round(MIN_WIDTH / ASPECT_RATIO);

  mainWindow = new BrowserWindow({
    width: INITIAL_WIDTH,
    height: INITIAL_HEIGHT,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    show: false,
    maximizable: false,
    fullscreenable: false,
    title: "Xiaohongshu Playground",
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // webviewTag: true,
      // partition: "persist:xhs-login",
    },
  });

  const rendererUrl = getRendererUrl();
  void mainWindow.loadURL(rendererUrl);

  // Dynamically set CSP based on environment
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    let csp = "default-src 'self'; img-src 'self' https: data:; connect-src 'self' https:;";
    if (!app.isPackaged) {
      // Development: allow unsafe-inline for styles and scripts, and unsafe-eval for scripts
      csp += " style-src 'self' 'unsafe-inline';";
      csp += " script-src 'self' 'unsafe-inline' 'unsafe-eval';";
    } else {
      // Production: stricter style-src and script-src
      csp += " style-src 'self';";
      csp += " script-src 'self';";
    }
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [csp],
      },
    });
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
}

app.on("second-instance", () => {
  // do nothing
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

void app.whenReady().then(() => {
  nativeTheme.themeSource = "system";

  if (!app.isPackaged) {
  } else {
  }

  createMainWindow();
});
