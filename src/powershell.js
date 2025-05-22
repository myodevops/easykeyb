const { exec } = require('child_process');

/**
 * Recover the currently active keyboard layout in Windows
 * using PowerShell: (Get-WinUserLanguageList)[0].InputMethodTips
 * 
 * Output example: "0409:00000409" → return "00000409"
 * 
 * @param {(layoutId: string|null) => void} callback - callback function that riceive the ID
 */
function getCurrentKeyboardLayout(callback) {
  exec('powershell -Command "(Get-WinUserLanguageList)[0].InputMethodTips"', (err, stdout, stderr) => {
    if (err) {
      console.error('Errore PowerShell:', err);
      return callback(null);
    }

    const match = stdout.match(/:(\w{8})/);
    if (match && match[1]) {
      const layoutId = match[1].toUpperCase();
      callback(layoutId);
    } else {
      callback(null);
    }
  });
}

module.exports = {
  getCurrentKeyboardLayout
};
