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
  // Don't close the app if it's only in the tray
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
        console.error('Key parsing error for EnabledKeyboards:', e);
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
          console.error('Error saving layouts:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    } catch (e) {
      console.error('Error preparing layouts to save:', e);
      reject(e);
    }
  });
});

ipcMain.on('close-setup-window', () => {
  if (global.setupWindow && !global.setupWindow.isDestroyed()) {
    global.setupWindow.close(); // It only closes the window, not the app.
    global.setupWindow = null;
  }
});

function getInstalledKeyboards(callback) {
  // PowerShell Command to Get List of Installed Keyboards
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

  // Left clieck → Setup + Quit menu
  tray.on('right-click', () => {
    const serviceMenu = Menu.buildFromTemplate([
      { label: 'Setup', click: openSetupWindow },
      { label: 'Quit', click: () => app.quit() }
    ]);
    tray.popUpContextMenu(serviceMenu);
  });

  // Right click → list of keyboard layouts
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
