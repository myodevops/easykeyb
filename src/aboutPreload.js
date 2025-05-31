const { contextBridge, ipcRenderer, shell } = require('electron');
const { t, tDom } = require('./i18n');

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
  },
  t: (key) => t(key),
  tDom: () => tDom(document)
});
