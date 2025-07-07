const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  moveWindow: (x, y) => ipcRenderer.send('move-window', x, y),
  onInitPosition: (callback) => ipcRenderer.on('init-position', (_, pos) => callback(pos))
});
