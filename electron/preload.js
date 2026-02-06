const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),
  onBackendReady: (callback) => ipcRenderer.on('backend-ready', callback),
  onBackendError: (callback) => ipcRenderer.on('backend-error', (_event, message) => callback(message)),
  onBackendStatus: (callback) => ipcRenderer.on('backend-status', (_event, message) => callback(message)),
  onImagensPath: (callback) => ipcRenderer.on('imagens-path', callback),
  getImagensPath: () => ipcRenderer.invoke('get-imagens-path'),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  saveImageToDirectory: (dataURL, filename, directory) => ipcRenderer.invoke('save-image-to-directory', dataURL, filename, directory),
  getLicenseStatus: () => ipcRenderer.invoke('get-license-status'),
});
