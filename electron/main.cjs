const { app, BrowserWindow } = require("electron");
const path = require("path");

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);

function createWindow() {
  const win = new BrowserWindow({
    show: false,
    backgroundColor: "#0a0a0b",
    fullscreen: true,
    autoHideMenuBar: true,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
      zoomFactor: 1,
      devTools: isDev
    }
  });

  win.removeMenu();

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  win.once("ready-to-show", () => {
    win.show();
    win.setFullScreen(true);
    win.setMenuBarVisibility(false);
    win.webContents.setZoomFactor(1);
    try {
      win.webContents.setVisualZoomLevelLimits(1, 1);
    } catch {
      /* eski Electron */
    }
  });

  win.webContents.on("did-finish-load", () => {
    win.webContents.setZoomFactor(1);
    try {
      win.webContents.setVisualZoomLevelLimits(1, 1);
    } catch {
      /* ignore */
    }
  });

  win.webContents.on("before-input-event", (_event, input) => {
    if (input.key === "F11") {
      _event.preventDefault();
      return;
    }
    const ctrl = input.control || input.meta;
    if (!ctrl) return;
    const k = input.key;
    if (k === "+" || k === "=" || k === "-" || k === "0" || k === "_") {
      _event.preventDefault();
    }
  });
}

app.whenReady().then(() => {
  app.commandLine.appendSwitch("disable-pinch");
  app.commandLine.appendSwitch("disable-features", "ElasticOverscroll");

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
