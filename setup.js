const Registry = require('winreg');

const regKey = new Registry({
  hive: Registry.HKCU,
  key:  '\\Software\\easykeyb'
});

function saveKeyboards(keyboards, callback) {
  const value = keyboards.join(',');
  regKey.set('EnabledKeyboards', Registry.REG_SZ, value, callback);
}

function loadKeyboards(callback) {
  regKey.get('EnabledKeyboards', (err, item) => {
    if (err || !item) return callback([]);
    callback(item.value.split(','));
  });
}

module.exports = {
  saveKeyboards,
  loadKeyboards
};
