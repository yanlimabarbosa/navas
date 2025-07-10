const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),
  onBackendReady: (callback) => ipcRenderer.on('backend-ready', callback),
  onBackendError: (callback) => ipcRenderer.on('backend-error', (_event, message) => callback(message)),
});
