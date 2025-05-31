const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getLayouts: () => ipcRenderer.invoke('get-keyboard-layouts'),
  saveLayouts: (layouts) => ipcRenderer.invoke('save-selected-layouts', layouts),
  closeSetupWindow: () => ipcRenderer.send('close-setup-window'),
  t: (key) => t(key)
});