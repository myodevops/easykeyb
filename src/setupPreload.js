const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('easykeyb', {
  getLayouts: () => ipcRenderer.invoke('get-keyboard-layouts'),
  saveLayouts: (layouts) => ipcRenderer.invoke('save-selected-layouts', layouts),
  closeSetupWindow: () => ipcRenderer.send('close-setup-window')
});
