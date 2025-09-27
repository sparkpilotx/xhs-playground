import { app, nativeTheme } from "electron";

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
  // do nothing
});

void app.whenReady().then(() => {
  nativeTheme.themeSource = "system";

  if (!app.isPackaged) {
  } else {
  }
});
