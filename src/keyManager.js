// src/keyManager.js

const fs = require('fs');
const path = require('path');
const { Menu } = require('electron');

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

// Funzione esportata
function refreshKeyboardMenu(tray, regKey) {
  regKey.get('EnabledKeyboards', (err, item) => {
    if (err || !item || !item.value) return;

    const ids = item.value
      .replace(/"/g, '')
      .split('|')
      .map(v => v.trim())
      .filter(Boolean);

    const menuTemplate = ids.map(id => ({
      label: getLayoutNameById(id),
      click: () => {
        console.log('Hai selezionato:', id);
        // TODO: attiva effettivamente il layout
      }
    }));

    const menu = Menu.buildFromTemplate(menuTemplate);
    tray.setContextMenu(null);
    tray.removeAllListeners('click');
    tray.on('click', () => tray.popUpContextMenu(menu));
  });
}

module.exports = {
  refreshKeyboardMenu
};
