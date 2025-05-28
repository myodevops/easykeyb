const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getAppVersion: () => {
    try {
      return ipcRenderer.invoke('get-app-version');
    } catch (error) {
      console.error("Error getting app version:", error);
      return null;
    }
  },
  openWebsite: (url) => {
    if (typeof url === 'string' && url.startsWith('http')) {
      shell.openExternal(url);
    }
  }
});

