const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("navbatKiosk", {
  isDesktop: true
});
