const { app, Tray, Menu, BrowserWindow } = require('electron');
const { exec } = require('child_process');
const setup = require('./setup');
const { ipcMain } = require('electron');
const path = require('path');
const Registry = require('winreg');
const { refreshKeyboardMenu } = require('./src/keyManager');


let tray = null;
const regKey = new Registry({
  hive: Registry.HKCU,
  key: '\\Software\\easykeyb'
});

app.on('window-all-closed', (e) => {
  // Non chiudere l'app se è solo nella tray
});

ipcMain.handle('get-keyboard-layouts', async () => {
  return new Promise((resolve, reject) => {
    regKey.get('EnabledKeyboards', (err, item) => {
      if (err || !item || !item.value) return resolve([]);
      try {
        const parsed = item.value
          .split('|')
          .map(v => v.trim())
          .filter(Boolean);
        resolve(parsed);
      } catch (e) {
        console.error('Errore nel parsing della chiave EnabledKeyboards:', e);
        resolve([]);
      }
    });
  });
});

ipcMain.handle('save-selected-layouts', async (event, selectedIds) => {
  return new Promise((resolve, reject) => {
    try {
      const value = `"${selectedIds.join('|')}"`;
      regKey.set('EnabledKeyboards', Registry.REG_SZ, value, err => {
        if (err) {
          console.error('Errore nel salvataggio dei layout:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    } catch (e) {
      console.error('Errore nella preparazione dei layout da salvare:', e);
      reject(e);
    }
  });
});

ipcMain.on('close-setup-window', () => {
  if (global.setupWindow && !global.setupWindow.isDestroyed()) {
    global.setupWindow.close(); // chiude solo la finestra, non l'app
    global.setupWindow = null;
  }
});

function getInstalledKeyboards(callback) {
  // Comando PowerShell per ottenere la lista delle tastiere installate
  exec('powershell "Get-WinUserLanguageList | ForEach-Object { $_.InputMethodTips }"', (error, stdout) => {
    if (error) return callback([]);
    const keyboards = stdout
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    callback(keyboards);
  });
}

app.whenReady().then(() => {
  tray = new Tray(__dirname + '/assets/icon.png');
  tray.setToolTip('easykeyb');

  // Clic sinistro → menu Setup + Quit
  tray.on('right-click', () => {
    const serviceMenu = Menu.buildFromTemplate([
      { label: 'Setup', click: openSetupWindow },
      { label: 'Quit', click: () => app.quit() }
    ]);
    tray.popUpContextMenu(serviceMenu);
  });

  // Clic destro → elenco tastiere
  refreshKeyboardMenu(tray, regKey);
});

function openSetupWindow() {
  if (!global.setupWindow || global.setupWindow.isDestroyed()) {
    global.setupWindow = new BrowserWindow({
      width: 600,
      height: 500,
      resizable: true,
      minimizable: false,
      maximizable: false,
      frame: false,
      icon: __dirname + '/assets/icon.png',
      webPreferences: {
        preload: path.join(__dirname, 'src', 'setupPreload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    global.setupWindow.loadFile(path.join(__dirname, 'src', 'setup.html'));
    //global.setupWindow.webContents.openDevTools();
    global.setupWindow.setMenu(null);
  } else {
    global.setupWindow.focus();
  }
}
