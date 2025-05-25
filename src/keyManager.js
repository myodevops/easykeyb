// src/keyManager.js

const fs = require('fs');
const path = require('path');
const { Menu } = require('electron');
const { setKeyboardLayout, getCurrentKeyboardLayout } = require('./powershell');


const keyboardLayouts = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'keyboard_layouts.json'), 'utf-8')
);

// Mapp ID → name
function getLayoutNameById(id) {
  for (const layouts of Object.values(keyboardLayouts)) {
    const found = layouts.find(l => l.id === id);
    if (found) return found.name;
  }
  return id; // fallback
}

// Exported function
function refreshKeyboardMenu(tray, regKey) {
  setTimeout(() => {
    getCurrentKeyboardLayout(currentId => {
      regKey.get('EnabledKeyboards', (err, item) => {
        if (err || !item || !item.value) return;

        const ids = item.value
          .replace(/"/g, '')
          .split('|')
          .map(v => v.trim())
          .filter(Boolean);

        const menuTemplate = ids.map(id => ({
          label: id === currentId
            ? `✅ ${getLayoutNameById(id)}`
            : `⬜️ ${getLayoutNameById(id)}`,
            click: () => {
              setTrayLoadingIcon(tray);
              setKeyboardLayout(id, success => {
                if (success) {
                  currentId = id;
                  waitForTrayAndRefresh(tray, regKey, 30000);
                }
              });
            }
        }));

        const menu = Menu.buildFromTemplate(menuTemplate);
        tray.setContextMenu(null);
        tray.removeAllListeners('click');
        tray.on('click', () => tray.popUpContextMenu(menu));
      });  
    });
  }, 1000);
}

function setTrayLoadingIcon(tray, maxWaitMs = 30000, intervalMs = 200) {
  const busyIcon = path.join(__dirname, '..', 'assets', 'icon_busy.png');
  const start = Date.now();

  const loop = () => {
    if (tray && typeof tray.setImage === 'function') {
      try {
        tray.setImage(busyIcon);
      } catch (err) {
        console.warn("Error changing the busy tray icon:", err.message);
      }
      return;
    }

    if (Date.now() - start > maxWaitMs) {
      console.error("Timeout: tray not available after 30 seconds.");
      return;
    }

    setTimeout(loop, intervalMs);
  };

  loop();
}


function waitForTrayAndRefresh(tray, regKey, maxWaitMs = 30000, intervalMs = 200) {
  const start = Date.now();
  const normalIcon = path.join(__dirname, '..', 'assets', 'icon.png');

  const loop = () => {
    if (tray && typeof tray.setContextMenu === 'function') {
      tray.setImage(normalIcon);
      refreshKeyboardMenu(tray, regKey);
      return;
    }

    if (Date.now() - start > maxWaitMs) {
      console.error("Timeout: tray not available after 30 seconds.");
      return;
    }

    setTimeout(loop, intervalMs);
  };

  loop();
}

module.exports = {
  refreshKeyboardMenu
};
